'use client';

/**
 * Record Inspector コンテンツ
 *
 * Toggl風3行構造:
 * 1行目: タイトル（大きく）
 * 2行目: 日付 + 時間
 * 3行目: Tags + オプションアイコン（Plan紐付け、充実度、メモ）
 */

import { AlertCircle, Check, FileText, FolderOpen, Smile, Tag, Trash2, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ClockTimePicker } from '@/components/common/ClockTimePicker';
import { Badge } from '@/components/ui/badge';
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
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { InspectorHeader } from '@/features/inspector';
import { DatePickerPopover } from '@/features/plans/components/shared/DatePickerPopover';
import { TagSelectCombobox } from '@/features/plans/components/shared/TagSelectCombobox';
import { useTags } from '@/features/tags/hooks';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import { useRecordMutations, useRecordTags, type RecordItem } from '../hooks';
import { useRecordInspectorStore, type DraftRecord } from '../stores';

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

export function RecordInspectorContent({ onClose }: RecordInspectorContentProps) {
  const t = useTranslations();
  const locale = useLocale();
  const utils = api.useUtils();
  const selectedRecordId = useRecordInspectorStore((state) => state.selectedRecordId);
  const draftRecord = useRecordInspectorStore((state) => state.draftRecord);
  const updateDraft = useRecordInspectorStore((state) => state.updateDraft);

  // ドラフトモードかどうか
  const isDraftMode = draftRecord !== null && selectedRecordId === null;

  // 時間重複エラー状態
  const [timeConflictError, setTimeConflictError] = useState(false);

  // Record取得（既存編集時のみ）
  const { data: record, isLoading } = api.records.getById.useQuery(
    { id: selectedRecordId!, include: { plan: true } },
    { enabled: !!selectedRecordId },
  );

  // Plan一覧取得
  const { data: plans } = api.plans.list.useQuery({});

  // タグデータ取得
  const { data: allTags = [] } = useTags();

  // Mutations
  const { createRecord, updateRecord, deleteRecord } = useRecordMutations();
  const { setRecordTags } = useRecordTags();

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
  const [isScorePopoverOpen, setIsScorePopoverOpen] = useState(false);
  const [isNotePopoverOpen, setIsNotePopoverOpen] = useState(false);

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
        start_time: draftRecord.start_time ?? '',
        end_time: draftRecord.end_time ?? '',
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
        start_time: record.start_time ?? '',
        end_time: record.end_time ?? '',
        duration_minutes: record.duration_minutes,
        fulfillment_score: record.fulfillment_score as FulfillmentScore | null,
        note: record.note ?? '',
        tagIds: record.tagIds ?? [],
      });
      setIsDirty(false);
    }
  }, [record, draftRecord, isDraftMode, today]);

  // 時間変更時にdurationを自動計算
  useEffect(() => {
    const duration = calculateDuration(formData.start_time, formData.end_time);
    if (duration !== formData.duration_minutes) {
      setFormData((prev) => ({ ...prev, duration_minutes: duration }));
    }
  }, [formData.start_time, formData.end_time, calculateDuration, formData.duration_minutes]);

  // 時間表示フォーマット
  const durationDisplay = useMemo(() => {
    if (formData.duration_minutes <= 0) return '';
    const h = Math.floor(formData.duration_minutes / 60);
    const m = formData.duration_minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }, [formData.duration_minutes]);

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

  // 選択済みタグ
  const selectedTags = useMemo(() => {
    return formData.tagIds
      .map((id) => allTags.find((tag) => tag.id === id))
      .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);
  }, [formData.tagIds, allTags]);

  // 各オプションに値があるか
  const hasTags = formData.tagIds.length > 0;
  const hasPlan = !!formData.plan_id;
  const hasScore = formData.fulfillment_score !== null;
  const hasNote = formData.note.length > 0;

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

  const handleTagsChange = useCallback(
    async (newTagIds: string[]) => {
      setFormData((prev) => ({ ...prev, tagIds: newTagIds }));
      setIsDirty(true);

      if (isDraftMode) {
        updateDraft({ tagIds: newTagIds } as Partial<DraftRecord>);
      } else if (selectedRecordId) {
        await setRecordTags(selectedRecordId, newTagIds);
      }
    },
    [isDraftMode, selectedRecordId, updateDraft, setRecordTags],
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      const newTagIds = formData.tagIds.filter((id) => id !== tagId);
      void handleTagsChange(newTagIds);
    },
    [formData.tagIds, handleTagsChange],
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
        setIsDirty(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
          setTimeConflictError(true);
        }
      }
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
    onClose();
  }, [onClose]);

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

  const typedRecord = record as RecordItem | undefined;

  // 保存ボタンの無効化条件
  const isSaveDisabled = isDraftMode
    ? !(formData.title.trim() || formData.plan_id) || formData.duration_minutes <= 0
    : !isDirty;

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
        <div className="bg-popover flex shrink-0 items-center px-4 py-4">
          <h2 className="text-base font-medium">Record 作成</h2>
        </div>
      ) : (
        <InspectorHeader
          onClose={cancelAndClose}
          closeLabel={t('actions.close')}
          menuContent={menuContent}
        />
      )}

      {/* コンテンツ部分（Toggl風3行構造） */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* 1行目: タイトル（プライマリ） */}
        <div className="px-4 pt-4 pb-2">
          <input
            type="text"
            value={formData.title}
            placeholder="何をした？"
            onChange={(e) => handleTitleChange(e.target.value)}
            className="placeholder:text-muted-foreground block w-full border-0 bg-transparent pl-2 text-xl font-bold outline-none"
            aria-label="記録タイトル"
          />
        </div>

        {/* 2行目: 日付 + 時間（メタデータ） */}
        <div className="flex items-start gap-2 px-4 py-2">
          {/* 日付 */}
          <DatePickerPopover
            selectedDate={formData.worked_at}
            onDateChange={handleDateChange}
            placeholder="日付..."
            showIcon
          />

          {/* 時間範囲 + Duration */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <ClockTimePicker
                value={formData.start_time}
                onChange={handleStartTimeChange}
                showIcon
                hasError={timeConflictError}
              />
              <span className="text-muted-foreground px-2 text-sm">–</span>
              <ClockTimePicker
                value={formData.end_time}
                onChange={handleEndTimeChange}
                showIcon
                iconType="flag"
                minTime={formData.start_time}
                showDurationInMenu
                hasError={timeConflictError}
              />
              {durationDisplay && (
                <span className="text-muted-foreground ml-4 text-sm tabular-nums">
                  {durationDisplay}
                </span>
              )}
            </div>
            {/* 時間重複エラーメッセージ */}
            {timeConflictError && (
              <div className="text-destructive flex items-center gap-1 py-1 text-sm" role="alert">
                <AlertCircle className="size-3 flex-shrink-0" />
                <span>{t('calendar.toast.conflictDescription')}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3行目: Tags + オプションアイコン（メタデータ） */}
        <div className="flex items-center gap-1 px-4 pt-2 pb-4">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1">
            {selectedTags.map((tag) => (
              <HoverTooltip
                key={tag.id}
                content={tag.description}
                side="top"
                disabled={!tag.description}
              >
                <Badge
                  variant="outline"
                  style={{ borderColor: tag.color || undefined }}
                  className="group relative pr-4 text-xs font-normal"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag.id);
                    }}
                    className="hover:bg-state-hover absolute top-1/2 right-1 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              </HoverTooltip>
            ))}
            <HoverTooltip content="タグを追加" side="top">
              <TagSelectCombobox
                selectedTagIds={formData.tagIds}
                onTagsChange={handleTagsChange}
                side="bottom"
                sideOffset={8}
                zIndex={zIndex.overlayDropdown}
              >
                <button
                  type="button"
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md transition-colors',
                    'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    hasTags ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label="タグを追加"
                >
                  <Tag className="size-4" />
                </button>
              </TagSelectCombobox>
            </HoverTooltip>
          </div>

          {/* Plan紐付け */}
          {isDraftMode ? (
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
                            <span className="flex-1 truncate">{plan.title}</span>
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
                                'text-primary ml-2 size-4 shrink-0',
                                formData.plan_id === plan.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : typedRecord?.plan ? (
            // 編集モード: Planリンク
            <HoverTooltip content={typedRecord.plan.title} side="top">
              <Link
                href={`/${locale}/plan?selected=${typedRecord.plan.id}`}
                className={cn(
                  'flex h-8 items-center gap-1 rounded-md px-2 text-sm transition-colors',
                  'hover:bg-state-hover text-foreground',
                )}
              >
                <FolderOpen className="size-4" />
                <span className="max-w-20 truncate text-xs">{typedRecord.plan.title}</span>
              </Link>
            </HoverTooltip>
          ) : (
            <HoverTooltip content="Planに紐付けなし" side="top">
              <div className="flex size-8 items-center justify-center">
                <FolderOpen className="text-muted-foreground size-4" />
              </div>
            </HoverTooltip>
          )}

          {/* 充実度 */}
          <Popover open={isScorePopoverOpen} onOpenChange={setIsScorePopoverOpen}>
            <HoverTooltip
              content={hasScore ? `充実度: ${formData.fulfillment_score}` : '充実度'}
              side="top"
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex h-8 items-center gap-1 rounded-md px-2 text-sm transition-colors',
                    'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    hasScore ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label="充実度"
                >
                  <Smile className="size-4" />
                  {hasScore && (
                    <span className="text-xs">{'★'.repeat(formData.fulfillment_score!)}</span>
                  )}
                </button>
              </PopoverTrigger>
            </HoverTooltip>
            <PopoverContent
              className="w-auto p-2"
              side="bottom"
              align="start"
              sideOffset={8}
              style={{ zIndex: zIndex.overlayDropdown }}
            >
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  充実度
                </span>
                <StarRating
                  value={formData.fulfillment_score}
                  onChange={handleScoreChange}
                  max={5}
                />
                {hasScore && (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground text-left text-xs transition-colors"
                    onClick={() => handleScoreChange(null)}
                  >
                    クリア
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* メモ */}
          <Popover open={isNotePopoverOpen} onOpenChange={setIsNotePopoverOpen}>
            <HoverTooltip content={hasNote ? 'メモあり' : 'メモ'} side="top">
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md transition-colors',
                    'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    hasNote ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label="メモ"
                >
                  <FileText className="size-4" />
                </button>
              </PopoverTrigger>
            </HoverTooltip>
            <PopoverContent
              className="w-64 p-2"
              side="bottom"
              align="start"
              sideOffset={8}
              style={{ zIndex: zIndex.overlayDropdown }}
            >
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  メモ
                </span>
                <Textarea
                  value={formData.note}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="メモを追加..."
                  className="min-h-20 resize-none text-sm"
                  rows={3}
                  aria-label="メモ"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* フッター */}
      {(isDirty || isDraftMode) && (
        <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
          <Button variant="ghost" onClick={cancelAndClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaveDisabled}>
            {isDraftMode ? 'Record 作成' : '保存'}
          </Button>
        </div>
      )}
    </div>
  );
}
