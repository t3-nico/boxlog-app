'use client';

/**
 * Record Inspector コンテンツ
 *
 * Toggl風3行構造:
 * 1行目: タイトル（大きく）
 * 2行目: 日付 + 時間
 * 3行目: Tags + オプションアイコン（Plan紐付け、充実度、メモ）
 */

import { useQueryClient } from '@tanstack/react-query';
import { Check, ExternalLink, FolderOpen, Smile, Trash2, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { NoteIconButton } from '@/components/common/NoteIconButton';
import { ScheduleRow } from '@/components/common/ScheduleRow';
import { TagsIconButton } from '@/components/common/TagsIconButton';
import { TitleInput } from '@/components/common/TitleInput';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { InspectorHeader, useDragHandle } from '@/features/inspector';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { useTags } from '@/features/tags/hooks';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import {
  useRecord,
  useRecordInspectorNavigation,
  useRecordMutations,
  useRecordTags,
} from '../hooks';
import { useRecordInspectorStore, type DraftRecord } from '../stores';

import { RecordActivityPopover } from './ActivityPopover';

import type { FulfillmentScore } from '../types/record';

interface FormData {
  title: string;
  plan_id: string | null;
  worked_at: Date | undefined;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  fulfillment_score: FulfillmentScore | null;
  note: string;
  tagIds: string[];
}

interface RecordInspectorContentProps {
  onClose: () => void;
}

/**
 * 時刻文字列から秒を除去（HH:MM:SS → HH:MM）
 */
function formatTimeWithoutSeconds(time: string | null | undefined): string {
  if (!time) return '';
  // "09:00:00" -> "09:00"
  return time.substring(0, 5);
}

export function RecordInspectorContent({ onClose }: RecordInspectorContentProps) {
  const t = useTranslations();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const utils = api.useUtils();
  const selectedRecordId = useRecordInspectorStore((state) => state.selectedRecordId);
  const draftRecord = useRecordInspectorStore((state) => state.draftRecord);
  const updateDraft = useRecordInspectorStore((state) => state.updateDraft);

  // ドラフトモードかどうか
  const isDraftMode = draftRecord !== null && selectedRecordId === null;

  // 時間重複エラー状態
  const [timeConflictError, setTimeConflictError] = useState(false);

  // 元のタグID（キャンセル時のロールバック用）
  const originalTagIdsRef = useRef<string[]>([]);
  // タグが変更されたかどうか
  const [hasTagChanges, setHasTagChanges] = useState(false);

  // Record取得（既存編集時のみ）
  // placeholderDataでrecords.listキャッシュから即座に表示（UX向上）
  const { data: record, isLoading } = useRecord(selectedRecordId!, {
    includePlan: true,
    enabled: !!selectedRecordId,
  });

  // Plan一覧取得（キャッシュ戦略適用済み）
  const { data: plans } = usePlans({});

  // タグデータ取得
  const { data: allTags = [] } = useTags();

  // Mutations
  const { createRecord, updateRecord, deleteRecord } = useRecordMutations();
  const { setRecordTags } = useRecordTags();

  // ナビゲーション（前後のRecord移動）
  const { hasPrevious, hasNext, goToPrevious, goToNext } =
    useRecordInspectorNavigation(selectedRecordId);

  // 今日の日付
  const today = useMemo(() => new Date(), []);

  // フォーム状態
  const [formData, setFormData] = useState<FormData>({
    title: '',
    plan_id: null,
    worked_at: today,
    start_time: '',
    end_time: '',
    duration_minutes: 0,
    fulfillment_score: null,
    note: '',
    tagIds: [],
  });
  const [isDirty, setIsDirty] = useState(false);

  // Popover開閉状態
  const [isPlanPopoverOpen, setIsPlanPopoverOpen] = useState(false);
  const [planSearchQuery, setPlanSearchQuery] = useState('');

  // タイトル入力のref
  const titleRef = useRef<HTMLInputElement>(null);

  // 充実度: 長押し検出用
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const isPressingRef = useRef(false); // 実際にpress中かどうか

  // Duration計算
  const calculateDuration = useCallback((start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = (startH ?? 0) * 60 + (startM ?? 0);
    const endMinutes = (endH ?? 0) * 60 + (endM ?? 0);
    const duration = endMinutes - startMinutes;
    return duration > 0 ? duration : 0;
  }, []);

  // ドラフトまたは既存Recordデータを編集フォームに反映
  useEffect(() => {
    if (isDraftMode && draftRecord) {
      const workedAtDate = draftRecord.worked_at ? new Date(draftRecord.worked_at) : today;
      setFormData({
        title: draftRecord.title ?? '',
        plan_id: draftRecord.plan_id,
        worked_at: workedAtDate,
        start_time: formatTimeWithoutSeconds(draftRecord.start_time),
        end_time: formatTimeWithoutSeconds(draftRecord.end_time),
        duration_minutes: draftRecord.duration_minutes,
        fulfillment_score: draftRecord.fulfillment_score as FulfillmentScore | null,
        note: draftRecord.note ?? '',
        tagIds: draftRecord.tagIds ?? [],
      });
      setIsDirty(false);
    } else if (record) {
      const workedAtDate = record.worked_at ? new Date(record.worked_at) : today;
      setFormData({
        title: record.title ?? '',
        plan_id: record.plan_id,
        worked_at: workedAtDate,
        start_time: formatTimeWithoutSeconds(record.start_time),
        end_time: formatTimeWithoutSeconds(record.end_time),
        duration_minutes: record.duration_minutes,
        fulfillment_score: record.fulfillment_score as FulfillmentScore | null,
        note: record.note ?? '',
        tagIds: record.tagIds ?? [],
      });
      setIsDirty(false);
      // 元のタグを保存（キャンセル時のロールバック用）
      originalTagIdsRef.current = record.tagIds ?? [];
      setHasTagChanges(false);
    }
  }, [record, draftRecord, isDraftMode, today]);

  // 時間変更時にdurationを自動計算
  useEffect(() => {
    const duration = calculateDuration(formData.start_time, formData.end_time);
    if (duration !== formData.duration_minutes) {
      setFormData((prev) => ({ ...prev, duration_minutes: duration }));
    }
  }, [formData.start_time, formData.end_time, calculateDuration, formData.duration_minutes]);

  // TitleInputの自動フォーカストリガー用のキー
  const autoFocusKey = selectedRecordId ?? (isDraftMode ? 'draft' : '');

  // Plan: updated_at降順ソート + 検索フィルタリング
  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    const sorted = [...plans].sort(
      (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(),
    );
    if (!planSearchQuery) return sorted;
    return sorted.filter((p) => p.title.toLowerCase().includes(planSearchQuery.toLowerCase()));
  }, [plans, planSearchQuery]);

  // 選択中のPlan名
  const selectedPlanName = useMemo(() => {
    if (!formData.plan_id || !plans) return null;
    const plan = plans.find((p) => p.id === formData.plan_id);
    return plan?.title ?? null;
  }, [formData.plan_id, plans]);

  // 各オプションに値があるか
  const hasPlan = !!formData.plan_id;
  const hasScore = formData.fulfillment_score !== null;

  // フォーム変更ハンドラ
  const handleTitleChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, title: value }));
      setIsDirty(true);
      if (isDraftMode) {
        updateDraft({ title: value } as Partial<DraftRecord>);
      }
    },
    [isDraftMode, updateDraft],
  );

  const handlePlanChange = useCallback(
    (planId: string | null) => {
      setFormData((prev) => {
        const updates: Partial<FormData> = { plan_id: planId };

        // Planのタグを自動プリセット
        if (planId && plans) {
          const selectedPlan = plans.find((p) => p.id === planId);
          if (selectedPlan) {
            // タイトルが空の場合はPlanのタイトルをプリセット
            if (!prev.title) {
              updates.title = selectedPlan.title;
            }
            // タグも自動プリセット
            if (selectedPlan.tagIds && selectedPlan.tagIds.length > 0) {
              updates.tagIds = selectedPlan.tagIds;
            }
          }
        }

        return { ...prev, ...updates };
      });
      setIsDirty(true);
      setIsPlanPopoverOpen(false);
      setPlanSearchQuery('');

      if (isDraftMode) {
        updateDraft({ plan_id: planId } as Partial<DraftRecord>);
        if (planId && plans) {
          const selectedPlan = plans.find((p) => p.id === planId);
          if (selectedPlan) {
            if (!formData.title) {
              updateDraft({ title: selectedPlan.title } as Partial<DraftRecord>);
            }
            if (selectedPlan.tagIds && selectedPlan.tagIds.length > 0) {
              updateDraft({ tagIds: selectedPlan.tagIds } as Partial<DraftRecord>);
            }
          }
        }
      }
    },
    [isDraftMode, plans, updateDraft, formData.title],
  );

  const handlePlanPopoverOpenChange = useCallback((open: boolean) => {
    setIsPlanPopoverOpen(open);
    if (!open) {
      setPlanSearchQuery('');
    }
  }, []);

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      setFormData((prev) => ({ ...prev, worked_at: date }));
      setIsDirty(true);
      if (isDraftMode && date) {
        const dateStr = date.toISOString().split('T')[0] ?? '';
        updateDraft({ worked_at: dateStr } as Partial<DraftRecord>);
      }
    },
    [isDraftMode, updateDraft],
  );

  const handleStartTimeChange = useCallback(
    (time: string) => {
      setTimeConflictError(false);
      setFormData((prev) => ({ ...prev, start_time: time }));
      setIsDirty(true);
      if (isDraftMode) {
        updateDraft({ start_time: time || null } as Partial<DraftRecord>);
      }
    },
    [isDraftMode, updateDraft],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      setTimeConflictError(false);
      setFormData((prev) => ({ ...prev, end_time: time }));
      setIsDirty(true);
      if (isDraftMode) {
        updateDraft({ end_time: time || null } as Partial<DraftRecord>);
      }
    },
    [isDraftMode, updateDraft],
  );

  const handleScoreChange = useCallback(
    (value: number | null) => {
      setFormData((prev) => ({
        ...prev,
        fulfillment_score: value as FulfillmentScore | null,
      }));
      setIsDirty(true);
      if (isDraftMode) {
        updateDraft({ fulfillment_score: value } as Partial<DraftRecord>);
      }
    },
    [isDraftMode, updateDraft],
  );

  // 充実度: 長押し開始
  const handlePressStart = useCallback(() => {
    isPressingRef.current = true;
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      // リセット
      handleScoreChange(null);
    }, 500);
  }, [handleScoreChange]);

  // 充実度: 長押し終了/タップ
  const handlePressEnd = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    // 実際にpress中でなければ何もしない（mouseLeave対策）
    if (!isPressingRef.current) {
      return;
    }
    isPressingRef.current = false;
    // 長押しでなければ加算
    if (!isLongPressRef.current) {
      const currentScore = formData.fulfillment_score ?? 0;
      const newScore = Math.min(currentScore + 1, 5);
      handleScoreChange(newScore);
    }
  }, [formData.fulfillment_score, handleScoreChange]);

  // 充実度: タイマークリーンアップ
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  const handleNoteChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, note: value }));
      setIsDirty(true);
      if (isDraftMode) {
        updateDraft({ note: value || null } as Partial<DraftRecord>);
      }
    },
    [isDraftMode, updateDraft],
  );

  /**
   * キャッシュのtagIdsを楽観的に更新（CalendarCard等での即時表示用）
   */
  const updateTagsInCache = useCallback(
    (recordId: string, newTagIds: string[]) => {
      // 1. records.list のすべてのキャッシュを更新
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key.length >= 1 &&
              Array.isArray(key[0]) &&
              key[0][0] === 'records' &&
              key[0][1] === 'list'
            );
          },
        },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((r: { id: string; tagIds?: string[] }) =>
            r.id === recordId ? { ...r, tagIds: newTagIds } : r,
          );
        },
      );

      // 2. records.getById のキャッシュを更新
      utils.records.getById.setData({ id: recordId }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tagIds: newTagIds };
      });
      utils.records.getById.setData({ id: recordId, include: { plan: true } }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tagIds: newTagIds };
      });
    },
    [queryClient, utils.records.getById],
  );

  const handleTagsChange = useCallback(
    (newTagIds: string[]) => {
      setFormData((prev) => ({ ...prev, tagIds: newTagIds }));
      setIsDirty(true);

      if (isDraftMode) {
        updateDraft({ tagIds: newTagIds } as Partial<DraftRecord>);
      } else if (selectedRecordId) {
        // 楽観的更新: キャッシュを即座に更新（カレンダーカードに反映）
        updateTagsInCache(selectedRecordId, newTagIds);
        setHasTagChanges(true);
      }
    },
    [isDraftMode, updateDraft, selectedRecordId, updateTagsInCache],
  );

  // 保存
  const handleSave = async () => {
    if (!formData.worked_at) return;

    const workedAtStr = formData.worked_at.toISOString().split('T')[0] ?? '';

    // クライアント側で即時重複チェック
    if (formData.start_time && formData.end_time) {
      const records = utils.records.list.getData();
      if (records && records.length > 0) {
        const [startH, startM] = formData.start_time.split(':').map(Number);
        const [endH, endM] = formData.end_time.split(':').map(Number);
        const newStart = new Date(formData.worked_at);
        newStart.setHours(startH ?? 0, startM ?? 0, 0, 0);
        const newEnd = new Date(formData.worked_at);
        newEnd.setHours(endH ?? 0, endM ?? 0, 0, 0);

        const hasOverlap = records.some((r) => {
          // 編集時は自分自身を除外
          if (selectedRecordId && r.id === selectedRecordId) return false;
          if (r.worked_at !== workedAtStr) return false;
          if (!r.start_time || !r.end_time) return false;

          const [rStartH, rStartM] = r.start_time.split(':').map(Number);
          const [rEndH, rEndM] = r.end_time.split(':').map(Number);
          const rStart = new Date(formData.worked_at!);
          rStart.setHours(rStartH ?? 0, rStartM ?? 0, 0, 0);
          const rEnd = new Date(formData.worked_at!);
          rEnd.setHours(rEndH ?? 0, rEndM ?? 0, 0, 0);

          return rStart < newEnd && rEnd > newStart;
        });

        if (hasOverlap) {
          setTimeConflictError(true);
          return;
        }
      }
    }

    if (isDraftMode) {
      // 新規作成モード
      try {
        await createRecord.mutateAsync({
          plan_id: formData.plan_id,
          title: formData.title || null,
          worked_at: workedAtStr,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          duration_minutes: formData.duration_minutes,
          fulfillment_score: formData.fulfillment_score,
          note: formData.note || null,
          tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
        });
        onClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
          setTimeConflictError(true);
        }
      }
    } else if (selectedRecordId && isDirty) {
      // 既存Record更新モード
      try {
        // レコード情報を更新
        await updateRecord.mutateAsync({
          id: selectedRecordId,
          data: {
            title: formData.title || null,
            worked_at: workedAtStr,
            start_time: formData.start_time || null,
            end_time: formData.end_time || null,
            duration_minutes: formData.duration_minutes,
            fulfillment_score: formData.fulfillment_score,
            note: formData.note || null,
          },
        });

        // タグを保存（変更があれば）
        const originalTagIds = record?.tagIds ?? [];
        const currentTagIds = formData.tagIds;
        const tagsChanged =
          originalTagIds.length !== currentTagIds.length ||
          !originalTagIds.every((id) => currentTagIds.includes(id));

        if (tagsChanged) {
          await setRecordTags(selectedRecordId, currentTagIds);
        }

        setIsDirty(false);
        onClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
          setTimeConflictError(true);
        }
      }
    } else {
      // 変更がない場合も閉じる
      onClose();
    }
  };

  // 削除
  const handleDelete = async () => {
    if (!selectedRecordId) return;
    if (!window.confirm('このRecordを削除しますか？')) return;

    await deleteRecord.mutateAsync({ id: selectedRecordId });
    onClose();
  };

  // キャンセル
  const cancelAndClose = useCallback(() => {
    // タグ変更があった場合はキャッシュを元に戻す
    if (hasTagChanges && selectedRecordId) {
      updateTagsInCache(selectedRecordId, originalTagIdsRef.current);
    }
    onClose();
  }, [onClose, hasTagChanges, selectedRecordId, updateTagsInCache]);

  // ローディング状態
  if (!isDraftMode && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      </div>
    );
  }

  // Record未取得
  if (!isDraftMode && !record) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Recordが見つかりません</p>
      </div>
    );
  }

  // メニューコンテンツ（編集モードのみ）
  const menuContent = !isDraftMode ? (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
        <Trash2 className="mr-2 size-4" />
        削除
      </DropdownMenuItem>
    </>
  ) : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ヘッダー */}
      {isDraftMode ? (
        <DraftModeHeader />
      ) : (
        <InspectorHeader
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onClose={cancelAndClose}
          onPrevious={goToPrevious}
          onNext={goToNext}
          closeLabel={t('actions.close')}
          previousLabel={t('aria.previous')}
          nextLabel={t('aria.next')}
          extraRightContent={
            selectedRecordId ? <RecordActivityPopover recordId={selectedRecordId} /> : undefined
          }
          menuContent={menuContent}
        />
      )}

      {/* コンテンツ部分（Toggl風3行構造） */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* 1行目: タイトル（プライマリ） */}
        <div className="px-4 pt-4 pb-2">
          <TitleInput
            key={autoFocusKey}
            ref={titleRef}
            value={formData.title}
            onChange={handleTitleChange}
            placeholder={isDraftMode ? '何をした？' : t('calendar.event.noTitle')}
            className="pl-2"
            aria-label="記録タイトル"
            autoFocus
            selectOnFocus
          />
        </div>

        {/* 2行目: 日付 + 時間（メタデータ） */}
        <ScheduleRow
          selectedDate={formData.worked_at}
          startTime={formData.start_time}
          endTime={formData.end_time}
          onDateChange={handleDateChange}
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
          timeConflictError={timeConflictError}
        />

        {/* 3行目: オプションアイコン */}
        <div className="flex flex-wrap items-center gap-0.5 px-4 pt-2 pb-4">
          {/* Tags */}
          <TagsIconButton
            tagIds={formData.tagIds}
            onTagsChange={handleTagsChange}
            popoverSide="bottom"
            popoverZIndex={zIndex.overlayDropdown}
          />

          {/* Plan紐付け（新規・編集共通） */}
          <Popover open={isPlanPopoverOpen} onOpenChange={handlePlanPopoverOpenChange}>
            <HoverTooltip content={selectedPlanName ?? 'Planに紐付け'} side="top">
              <div
                className={cn(
                  'hover:bg-state-hover flex h-8 items-center rounded-md transition-colors',
                  hasPlan ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="focus-visible:ring-ring flex items-center gap-1 px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    aria-label="Planに紐付け"
                  >
                    <FolderOpen className="size-4" />
                    {hasPlan && selectedPlanName && (
                      <span className="max-w-20 truncate text-xs">{selectedPlanName}</span>
                    )}
                  </button>
                </PopoverTrigger>
                {hasPlan && (
                  <button
                    type="button"
                    onClick={() => handlePlanChange(null)}
                    className="hover:bg-state-hover mr-1 rounded p-0.5 transition-colors"
                    aria-label="Plan紐付けを解除"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </HoverTooltip>
            <PopoverContent
              className="w-[400px] p-0"
              side="bottom"
              align="start"
              sideOffset={8}
              style={{ zIndex: zIndex.overlayDropdown }}
            >
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Planを検索..."
                  value={planSearchQuery}
                  onValueChange={setPlanSearchQuery}
                />
                <CommandList className="max-h-[280px]">
                  <CommandEmpty>Planがありません</CommandEmpty>
                  <CommandGroup>
                    {filteredPlans.map((plan) => {
                      const planTags = plan.tagIds
                        ?.map((id) => allTags.find((t) => t.id === id))
                        .filter(Boolean);
                      return (
                        <CommandItem
                          key={plan.id}
                          value={plan.id}
                          onSelect={() =>
                            handlePlanChange(formData.plan_id === plan.id ? null : plan.id)
                          }
                          className="cursor-pointer"
                        >
                          <span className="shrink truncate">
                            {plan.title || (
                              <span className="text-muted-foreground">(タイトルなし)</span>
                            )}
                          </span>
                          {planTags && planTags.length > 0 && (
                            <div className="flex shrink-0 gap-1 pl-2">
                              {planTags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag!.id}
                                  className="rounded px-1 py-0.5 text-xs"
                                  style={{
                                    backgroundColor: tag!.color ? `${tag!.color}20` : undefined,
                                    color: tag!.color || undefined,
                                  }}
                                >
                                  {tag!.name}
                                </span>
                              ))}
                              {planTags.length > 2 && (
                                <span className="text-muted-foreground text-xs">
                                  +{planTags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                          <Check
                            className={cn(
                              'text-primary ml-auto size-4 shrink-0',
                              formData.plan_id === plan.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
              {/* 選択中Planへのナビゲーション */}
              {hasPlan && formData.plan_id && (
                <div className="border-border border-t p-2">
                  <Link
                    href={`/${locale}/plan?selected=${formData.plan_id}`}
                    className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                  >
                    <ExternalLink className="size-4" />
                    <span>Planを開く</span>
                  </Link>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* 充実度（連打形式） */}
          <HoverTooltip
            content={
              hasScore
                ? `充実度: ${formData.fulfillment_score}/5（長押しでリセット）`
                : '充実度（タップで加算）'
            }
            side="top"
          >
            <button
              type="button"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              className={cn(
                'flex h-8 items-center gap-1 rounded-md px-2 transition-colors',
                'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                'select-none', // 長押し時のテキスト選択防止
                hasScore ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={`充実度: ${formData.fulfillment_score ?? 0}/5`}
            >
              <Smile className="size-4" />
              {hasScore && (
                <span className="text-xs font-medium tabular-nums">
                  {formData.fulfillment_score}
                </span>
              )}
            </button>
          </HoverTooltip>

          {/* メモ */}
          <NoteIconButton
            id={selectedRecordId ?? 'draft'}
            note={formData.note}
            onNoteChange={handleNoteChange}
          />
        </div>
      </div>

      {/* フッター（常時表示） */}
      <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
        <Button variant="ghost" onClick={cancelAndClose}>
          キャンセル
        </Button>
        <Button
          onClick={() => {
            // 新規作成時は時間が必須
            if (isDraftMode && formData.duration_minutes <= 0) {
              toast.error('時間を入力してください');
              return;
            }
            handleSave();
          }}
        >
          {isDraftMode ? 'Record 作成' : '保存'}
        </Button>
      </div>
    </div>
  );
}

/**
 * ドラフトモード用ヘッダー
 *
 * Planと同様にドラッグハンドルを適用
 */
function DraftModeHeader() {
  const dragHandleProps = useDragHandle();
  const isDraggable = !!dragHandleProps;

  return (
    <div className="bg-popover relative flex shrink-0 items-center px-4 pt-4 pb-2">
      {/* ドラッグハンドル（背景レイヤー） */}
      {isDraggable && (
        <div
          {...dragHandleProps}
          className="hover:bg-state-hover absolute inset-0 cursor-move transition-colors"
          aria-hidden="true"
        />
      )}

      {/* タイトル（前面レイヤー） */}
      <h2 className="relative z-10 text-base font-medium">Record 作成</h2>
    </div>
  );
}
