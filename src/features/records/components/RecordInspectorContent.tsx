'use client';

/**
 * Record Inspector コンテンツ
 *
 * Toggl風3行構造:
 * 1行目: タイトル（大きく）
 * 2行目: 日付 + 時間
 * 3行目: Tags + オプションアイコン（Plan紐付け、充実度、メモ）
 *
 * 既存Record編集専用（新規作成はPlanInspectorで行う）
 */

import { useQueryClient } from '@tanstack/react-query';
import { Check, ExternalLink, FolderOpen, Smile, Trash2, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { InspectorHeader } from '@/features/inspector';
import { NoteIconButton } from '@/features/inspector/components/NoteIconButton';
import { ScheduleRow } from '@/features/inspector/components/ScheduleRow';
import { TagsIconButton } from '@/features/inspector/components/TagsIconButton';
import { TitleInput } from '@/features/inspector/components/TitleInput';
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
import { useRecordInspectorStore } from '../stores';

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

  // 時間重複エラー状態
  const [timeConflictError, setTimeConflictError] = useState(false);

  // 自動保存デバウンス用タイマー（Activityノイズ防止）
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 元のタグID（キャンセル時のロールバック用）
  const originalTagIdsRef = useRef<string[]>([]);
  // タグが変更されたかどうか
  const [hasTagChanges, setHasTagChanges] = useState(false);

  // Record取得
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
  const { updateRecord, deleteRecord } = useRecordMutations();
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

  // Recordデータを編集フォームに反映
  useEffect(() => {
    if (record) {
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
  }, [record, today]);

  // 時間変更時にdurationを自動計算
  useEffect(() => {
    const duration = calculateDuration(formData.start_time, formData.end_time);
    if (duration !== formData.duration_minutes) {
      setFormData((prev) => ({ ...prev, duration_minutes: duration }));
    }
  }, [formData.start_time, formData.end_time, calculateDuration, formData.duration_minutes]);

  // 自動保存タイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // TitleInputの自動フォーカストリガー用のキー
  const autoFocusKey = selectedRecordId ?? '';

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
      if (selectedRecordId) {
        // デバウンス適用してDB保存（Activityノイズ防止）
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          updateRecord.mutate({ id: selectedRecordId, data: { title: value || null } });
        }, 500);
      }
    },
    [selectedRecordId, updateRecord],
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

      if (selectedRecordId) {
        // plan_id変更を即座にDB保存
        updateRecord.mutate({ id: selectedRecordId, data: { plan_id: planId } });
      }
    },
    [plans, selectedRecordId, updateRecord],
  );

  const handlePlanPopoverOpenChange = useCallback((open: boolean) => {
    setIsPlanPopoverOpen(open);
    if (!open) {
      setPlanSearchQuery('');
    }
  }, []);

  const handleDateChange = useCallback((date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, worked_at: date }));
    setIsDirty(true);
  }, []);

  const handleStartTimeChange = useCallback((time: string) => {
    setTimeConflictError(false);
    setFormData((prev) => ({ ...prev, start_time: time }));
    setIsDirty(true);
  }, []);

  const handleEndTimeChange = useCallback((time: string) => {
    setTimeConflictError(false);
    setFormData((prev) => ({ ...prev, end_time: time }));
    setIsDirty(true);
  }, []);

  const handleScoreChange = useCallback(
    (value: number | null) => {
      setFormData((prev) => ({
        ...prev,
        fulfillment_score: value as FulfillmentScore | null,
      }));
      setIsDirty(true);
      if (selectedRecordId) {
        // 即座にDB保存
        updateRecord.mutate({ id: selectedRecordId, data: { fulfillment_score: value } });
      }
    },
    [selectedRecordId, updateRecord],
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
      if (selectedRecordId) {
        // デバウンス適用してDB保存（Activityノイズ防止）
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          updateRecord.mutate({ id: selectedRecordId, data: { note: value || null } });
        }, 500);
      }
    },
    [selectedRecordId, updateRecord],
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

      if (selectedRecordId) {
        // 楽観的更新: キャッシュを即座に更新（カレンダーカードに反映）
        updateTagsInCache(selectedRecordId, newTagIds);
        setHasTagChanges(true);
      }
    },
    [selectedRecordId, updateTagsInCache],
  );

  // 削除
  const handleDelete = async () => {
    if (!selectedRecordId) return;
    if (!window.confirm('このRecordを削除しますか？')) return;

    await deleteRecord.mutateAsync({ id: selectedRecordId });
    onClose();
  };

  // 保存して閉じる（時間フィールドとタグを保存）
  const saveAndClose = useCallback(async () => {
    if (!selectedRecordId || !formData.worked_at) {
      onClose();
      return;
    }

    const workedAtStr = formData.worked_at.toISOString().split('T')[0] ?? '';

    // 時間重複チェック
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
          if (r.id === selectedRecordId) return false;
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

    try {
      // 時間フィールドを保存（変更があれば）
      if (isDirty) {
        await updateRecord.mutateAsync({
          id: selectedRecordId,
          data: {
            worked_at: workedAtStr,
            start_time: formData.start_time || null,
            end_time: formData.end_time || null,
            duration_minutes: formData.duration_minutes,
          },
        });
      }

      // タグを保存（変更があれば）
      if (hasTagChanges) {
        await setRecordTags(selectedRecordId, formData.tagIds);
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
        setTimeConflictError(true);
      }
    }
  }, [
    selectedRecordId,
    formData.worked_at,
    formData.start_time,
    formData.end_time,
    formData.duration_minutes,
    formData.tagIds,
    isDirty,
    hasTagChanges,
    updateRecord,
    setRecordTags,
    utils.records.list,
    onClose,
  ]);

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      </div>
    );
  }

  // Record未取得
  if (!record) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Recordが見つかりません</p>
      </div>
    );
  }

  // メニューコンテンツ
  const menuContent = (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
        <Trash2 className="mr-2 size-4" />
        削除
      </DropdownMenuItem>
    </>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ヘッダー（自動保存: ×で閉じる時に時間・タグを保存） */}
      <InspectorHeader
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onClose={saveAndClose}
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

      {/* コンテンツ部分（Toggl風3行構造） */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* 1行目: タイトル（プライマリ） */}
        <div className="px-4 pt-4 pb-2">
          <TitleInput
            key={autoFocusKey}
            ref={titleRef}
            value={formData.title}
            onChange={handleTitleChange}
            placeholder={t('calendar.event.noTitle')}
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
        <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">
          {/* Tags */}
          <TagsIconButton
            tagIds={formData.tagIds}
            onTagsChange={handleTagsChange}
            popoverSide="bottom"
          />

          {/* Plan紐付け */}
          <Popover open={isPlanPopoverOpen} onOpenChange={handlePlanPopoverOpenChange}>
            <HoverTooltip content={selectedPlanName ?? 'Planに紐付け'} side="top">
              <div
                className={cn(
                  'hover:bg-state-hover flex h-8 items-center rounded-lg transition-colors',
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
                    className="hover:bg-state-hover mr-1 rounded p-1 transition-colors"
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
                                  className="rounded px-1 py-1 text-xs"
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
                    className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors"
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
                'flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
                'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                'select-none', // 長押し時のテキスト選択防止
                hasScore ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={`充実度: ${formData.fulfillment_score ?? 0}/5`}
            >
              <Smile className="size-4" />
              {hasScore && (
                <span className="text-xs font-bold tabular-nums">{formData.fulfillment_score}</span>
              )}
            </button>
          </HoverTooltip>

          {/* メモ */}
          <NoteIconButton
            id={selectedRecordId ?? 'record'}
            note={formData.note}
            onNoteChange={handleNoteChange}
          />
        </div>
      </div>
    </div>
  );
}
