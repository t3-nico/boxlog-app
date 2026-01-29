'use client';

import { AlertCircle, Check, FileText, FolderOpen, Smile, Tag, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { ClockTimePicker } from '@/components/common/ClockTimePicker';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { useRecordMutations } from '@/features/records/hooks';
import { useTags } from '@/features/tags/hooks';
import { api } from '@/lib/trpc';

import { cn } from '@/lib/utils';
import { TagSelectCombobox } from '../../shared/TagSelectCombobox';

import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore';
import { DatePickerPopover } from '../../shared/DatePickerPopover';

import type { FulfillmentScore } from '@/features/records/types/record';

interface RecordFormData {
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

export interface RecordCreateFormRef {
  save: () => Promise<void>;
  isSaveDisabled: () => boolean;
}

/**
 * Record 作成フォーム（Toggl風3行構造）
 *
 * 1行目: タイトル（大きく）
 * 2行目: 日付 + 時間
 * 3行目: Tags + オプションアイコン（Plan紐付け、充実度、メモ）
 */
export const RecordCreateForm = forwardRef<RecordCreateFormRef>(
  function RecordCreateForm(_props, ref) {
    const t = useTranslations();
    const utils = api.useUtils();
    const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
    const closeInspector = usePlanInspectorStore((state) => state.closeInspector);

    // 時間重複エラー状態（視覚的フィードバック用）
    const [timeConflictError, setTimeConflictError] = useState(false);

    // Plan一覧取得（全ステータス）
    const { data: plans } = api.plans.list.useQuery({});

    // Mutations
    const { createRecord } = useRecordMutations();

    // 今日の日付
    const today = useMemo(() => new Date(), []);

    // draftPlan から初期値を取得
    const initialStartTime = useMemo(() => {
      if (!draftPlan?.start_time) return '';
      const date = new Date(draftPlan.start_time);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }, [draftPlan?.start_time]);

    const initialEndTime = useMemo(() => {
      if (!draftPlan?.end_time) return '';
      const date = new Date(draftPlan.end_time);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }, [draftPlan?.end_time]);

    const initialWorkedAt = useMemo(() => {
      if (draftPlan?.due_date) {
        return new Date(draftPlan.due_date);
      }
      return today;
    }, [draftPlan?.due_date, today]);

    // 初期duration計算
    const calculateDuration = useCallback((start: string, end: string): number => {
      if (!start || !end) return 60;
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const startMinutes = (startH ?? 0) * 60 + (startM ?? 0);
      const endMinutes = (endH ?? 0) * 60 + (endM ?? 0);
      const duration = endMinutes - startMinutes;
      return duration > 0 ? duration : 60;
    }, []);

    // フォーム状態
    const [formData, setFormData] = useState<RecordFormData>({
      title: '',
      plan_id: null,
      worked_at: initialWorkedAt,
      start_time: initialStartTime,
      end_time: initialEndTime,
      duration_minutes: calculateDuration(initialStartTime, initialEndTime),
      fulfillment_score: null,
      note: '',
      tagIds: [],
    });

    // タグデータ取得
    const { data: allTags = [] } = useTags();

    // Popover開閉状態
    const [isPlanPopoverOpen, setIsPlanPopoverOpen] = useState(false);
    const [planSearchQuery, setPlanSearchQuery] = useState('');
    const [isScorePopoverOpen, setIsScorePopoverOpen] = useState(false);
    const [isNotePopoverOpen, setIsNotePopoverOpen] = useState(false);

    // Plan: updated_at降順ソート + 検索フィルタリング
    const filteredPlans = useMemo(() => {
      if (!plans) return [];

      // updated_at降順でソート
      const sorted = [...plans].sort(
        (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(),
      );

      // 検索フィルタリング
      if (!planSearchQuery) return sorted;
      return sorted.filter((p) => p.title.toLowerCase().includes(planSearchQuery.toLowerCase()));
    }, [plans, planSearchQuery]);

    // 初期値が変わったら反映
    useEffect(() => {
      setFormData((prev) => ({
        ...prev,
        worked_at: initialWorkedAt,
        start_time: initialStartTime,
        end_time: initialEndTime,
        duration_minutes: calculateDuration(initialStartTime, initialEndTime),
      }));
    }, [initialWorkedAt, initialStartTime, initialEndTime, calculateDuration]);

    // 時間変更時にdurationを自動計算
    useEffect(() => {
      const duration = calculateDuration(formData.start_time, formData.end_time);
      setFormData((prev) => ({ ...prev, duration_minutes: duration }));
    }, [formData.start_time, formData.end_time, calculateDuration]);

    // 時間表示フォーマット（例: "2h 30m"）
    const durationDisplay = useMemo(() => {
      if (formData.duration_minutes <= 0) return '';
      const h = Math.floor(formData.duration_minutes / 60);
      const m = formData.duration_minutes % 60;
      if (h > 0 && m > 0) return `${h}h ${m}m`;
      if (h > 0) return `${h}h`;
      return `${m}m`;
    }, [formData.duration_minutes]);

    // フォーム変更ハンドラ
    const handleTitleChange = useCallback((value: string) => {
      setFormData((prev) => ({ ...prev, title: value }));
    }, []);

    const handlePlanChange = useCallback(
      (value: string) => {
        setFormData((prev) => {
          const updates: Partial<RecordFormData> = { plan_id: value || null };

          // Planのタグを自動プリセット
          if (value && plans) {
            const selectedPlan = plans.find((p) => p.id === value);
            if (selectedPlan?.tagIds && selectedPlan.tagIds.length > 0) {
              updates.tagIds = selectedPlan.tagIds;
            }
          }

          return { ...prev, ...updates };
        });
        setIsPlanPopoverOpen(false);
        setPlanSearchQuery('');
      },
      [plans],
    );

    const handlePlanPopoverOpenChange = useCallback((open: boolean) => {
      setIsPlanPopoverOpen(open);
      if (!open) {
        setPlanSearchQuery('');
      }
    }, []);

    const handleDateChange = useCallback((date: Date | undefined) => {
      setFormData((prev) => ({ ...prev, worked_at: date }));
    }, []);

    const handleStartTimeChange = useCallback((time: string) => {
      // 時間変更時にエラーをクリア
      setTimeConflictError(false);
      setFormData((prev) => ({ ...prev, start_time: time }));
    }, []);

    const handleEndTimeChange = useCallback((time: string) => {
      // 時間変更時にエラーをクリア
      setTimeConflictError(false);
      setFormData((prev) => ({ ...prev, end_time: time }));
    }, []);

    const handleScoreChange = useCallback((value: number | null) => {
      setFormData((prev) => ({
        ...prev,
        fulfillment_score: value as FulfillmentScore | null,
      }));
    }, []);

    const handleNoteChange = useCallback((value: string) => {
      setFormData((prev) => ({ ...prev, note: value }));
    }, []);

    const handleTagsChange = useCallback((tagIds: string[]) => {
      setFormData((prev) => ({ ...prev, tagIds }));
    }, []);

    const handleRemoveTag = useCallback((tagId: string) => {
      setFormData((prev) => ({
        ...prev,
        tagIds: prev.tagIds.filter((id) => id !== tagId),
      }));
    }, []);

    // 選択済みタグ（追加順を維持）
    const selectedTags = useMemo(() => {
      return formData.tagIds
        .map((id) => allTags.find((tag) => tag.id === id))
        .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);
    }, [formData.tagIds, allTags]);

    // 保存ボタンの無効化条件（時間が必須）
    const isSaveDisabled = useCallback(() => {
      return formData.duration_minutes <= 0;
    }, [formData.duration_minutes]);

    // 保存処理
    const save = useCallback(async () => {
      if (!formData.worked_at) {
        return;
      }

      const workedAtStr = formData.worked_at.toISOString().split('T')[0] ?? '';

      // クライアント側で即時重複チェック（サーバー呼び出し前）
      if (formData.start_time && formData.end_time) {
        const records = utils.records.list.getData();
        if (records && records.length > 0) {
          // 新規Recordの時間範囲
          const [startH, startM] = formData.start_time.split(':').map(Number);
          const [endH, endM] = formData.end_time.split(':').map(Number);
          const newStart = new Date(formData.worked_at);
          newStart.setHours(startH ?? 0, startM ?? 0, 0, 0);
          const newEnd = new Date(formData.worked_at);
          newEnd.setHours(endH ?? 0, endM ?? 0, 0, 0);

          // 同日のRecordと重複チェック
          const hasOverlap = records.some((r) => {
            if (r.worked_at !== workedAtStr) return false;
            if (!r.start_time || !r.end_time) return false;

            // HH:MM:SS形式をパース
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
            return; // サーバーを呼ばずに即座にエラー表示
          }
        }
      }

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

        closeInspector();
      } catch (error) {
        // TIME_OVERLAPエラー（重複防止）の場合はフィールドにエラー表示（toastなし）
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('既にRecord') || errorMessage.includes('TIME_OVERLAP')) {
          // エラー表示（時間変更するまで維持）
          setTimeConflictError(true);
        }
      }
    }, [formData, createRecord, closeInspector, utils.records.list]);

    // ref 経由で save と isSaveDisabled を公開
    useImperativeHandle(ref, () => ({
      save,
      isSaveDisabled,
    }));

    // 各オプションに値があるか
    const hasTags = formData.tagIds.length > 0;
    const hasPlan = !!formData.plan_id;
    const hasScore = formData.fulfillment_score !== null;
    const hasNote = formData.note.length > 0;

    // 選択中のPlan名
    const selectedPlanName = useMemo(() => {
      if (!formData.plan_id || !plans) return null;
      const plan = plans.find((p) => p.id === formData.plan_id);
      return plan?.title ?? null;
    }, [formData.plan_id, plans]);

    return (
      <div className="flex flex-col">
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
        <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">
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
                  className="group relative h-8 pr-8 text-xs font-normal"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag.id);
                    }}
                    className="hover:bg-state-hover absolute top-1/2 right-2 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                  >
                    <X className="size-4" />
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
                    className={cn(
                      'focus-visible:ring-ring flex items-center gap-1 text-sm focus-visible:ring-2 focus-visible:outline-none',
                      hasPlan ? 'pl-2' : 'px-2',
                    )}
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
                    onClick={() => handlePlanChange('')}
                    className="hover:bg-state-hover mr-1 rounded p-2 transition-colors"
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
                          onSelect={() => handlePlanChange(plan.id)}
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
                  {hasScore && <span className="text-xs">★ {formData.fulfillment_score}</span>}
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
                    'relative flex size-8 items-center justify-center rounded-md transition-colors',
                    'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                    hasNote ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label="メモ"
                >
                  <FileText className="size-4" />
                  {hasNote && (
                    <span className="bg-primary absolute top-1 right-1 size-2 rounded-full" />
                  )}
                </button>
              </PopoverTrigger>
            </HoverTooltip>
            <PopoverContent
              className="w-80 p-2"
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
                  onChange={(e) => {
                    handleNoteChange(e.target.value);
                    // Auto-grow: 高さを内容に合わせる
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                  }}
                  placeholder="メモを追加..."
                  className="max-h-[200px] min-h-20 resize-none text-sm"
                  rows={3}
                  aria-label="メモ"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  },
);
