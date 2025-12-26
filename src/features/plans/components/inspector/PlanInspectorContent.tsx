'use client';

import * as Portal from '@radix-ui/react-portal';
import { format } from 'date-fns';
import {
  Bell,
  CheckIcon,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  History,
  Link,
  MessageSquare,
  PanelRight,
  Save,
  SquareMousePointer,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseDateString, parseDatetimeString } from '@/features/calendar/utils/dateUtils';
import { InspectorHeader, type InspectorDisplayMode } from '@/features/inspector';

import { usePlan } from '../../hooks/usePlan';
import { usePlanTags } from '../../hooks/usePlanTags';
import { useDeleteConfirmStore } from '../../stores/useDeleteConfirmStore';
import { usePlanCacheStore } from '../../stores/usePlanCacheStore';
import { usePlanInspectorStore } from '../../stores/usePlanInspectorStore';
import type { Plan } from '../../types/plan';
import { PlanScheduleSection } from '../shared/PlanScheduleSection';
import { PlanTagsSection } from '../shared/PlanTagsSection';
import { ReminderSelect } from '../shared/ReminderSelect';

// Novel エディターは重いため遅延ロード（~300KB削減）
const NovelDescriptionEditor = dynamic(
  () => import('../shared/NovelDescriptionEditor').then((mod) => mod.NovelDescriptionEditor),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground min-h-8 px-2 py-1 text-sm">読み込み中...</div>
    ),
  },
);

import { ActivityTab } from './components';
import { useInspectorAutoSave, useInspectorNavigation } from './hooks';

/**
 * Plan Inspectorのコンテンツ部分
 * InspectorShellの中で使用される
 */
export function PlanInspectorContent() {
  const t = useTranslations();
  const planId = usePlanInspectorStore((state) => state.planId);
  const initialData = usePlanInspectorStore((state) => state.initialData);
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector);
  const displayMode = usePlanInspectorStore((state) => state.displayMode) as InspectorDisplayMode;
  const setDisplayMode = usePlanInspectorStore((state) => state.setDisplayMode);

  // 削除確認ダイアログ（ストア経由で制御）
  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);

  const { data: planData } = usePlan(planId!, { includeTags: true, enabled: !!planId });
  const plan = (planData ?? null) as unknown as Plan | null;

  // Custom hooks
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId);
  const { autoSave, updatePlan, deletePlan } = useInspectorAutoSave({ planId, plan });

  // Activity state
  const [activityOrder, setActivityOrder] = useState<'asc' | 'desc'>('desc');
  const [isHoveringSort, setIsHoveringSort] = useState(false);
  const sortButtonRef = useRef<HTMLSpanElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const { addPlanTag, removePlanTag } = usePlanTags();

  // UI state
  const titleRef = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderType, setReminderType] = useState<string>('');

  const getCache = usePlanCacheStore((state) => state.getCache);

  // Sync tags from plan data
  useEffect(() => {
    if (planData && 'tags' in planData) {
      const tagIds = (planData.tags as Array<{ id: string }>).map((tag) => tag.id);
      setSelectedTagIds(tagIds);
    } else {
      setSelectedTagIds([]);
    }
  }, [planData]);

  // Initialize state from plan data
  useEffect(() => {
    if (plan && 'id' in plan) {
      setSelectedDate(plan.due_date ? parseDateString(plan.due_date) : undefined);

      if (plan.start_time) {
        const date = parseDatetimeString(plan.start_time);
        setStartTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setStartTime('');
      }

      if (plan.end_time) {
        const date = parseDatetimeString(plan.end_time);
        setEndTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setEndTime('');
      }

      if ('reminder_minutes' in plan && plan.reminder_minutes !== null) {
        const minutes = plan.reminder_minutes;
        const reminderMap: Record<number, string> = {
          0: '開始時刻',
          10: '10分前',
          30: '30分前',
          60: '1時間前',
          1440: '1日前',
          10080: '1週間前',
        };
        setReminderType(reminderMap[minutes] || 'カスタム');
      } else {
        setReminderType('');
      }
    } else if (!plan && initialData) {
      if (initialData.start_time) {
        const startDate = new Date(initialData.start_time);
        setSelectedDate(startDate);
        setStartTime(
          `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
        );
      }
      if (initialData.end_time) {
        const endDate = new Date(initialData.end_time);
        setEndTime(
          `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
        );
      }
    } else if (!plan && !initialData) {
      setSelectedDate(undefined);
      setStartTime('');
      setEndTime('');
      setReminderType('');
    }
  }, [plan, initialData]);

  // Focus title on open
  useEffect(() => {
    if (titleRef.current) {
      const timer = setTimeout(() => {
        titleRef.current?.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        if (selection && titleRef.current) {
          range.selectNodeContents(titleRef.current);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [planId]);

  // Adjust description height
  useEffect(() => {
    if (descriptionRef.current && plan) {
      const textarea = descriptionRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 96);
      textarea.style.height = `${newHeight}px`;
    }
  }, [plan]);

  // Handlers
  // selectedTagIds を ref で保持して最新値を参照可能にする
  const selectedTagIdsRef = useRef<string[]>(selectedTagIds);
  useEffect(() => {
    selectedTagIdsRef.current = selectedTagIds;
  }, [selectedTagIds]);

  const handleTagsChange = useCallback(
    async (newTagIds: string[]) => {
      if (!planId) return;

      // ref から最新の値を取得
      const oldTagIds = selectedTagIdsRef.current;
      const added = newTagIds.filter((id) => !oldTagIds.includes(id));
      const removed = oldTagIds.filter((id) => !newTagIds.includes(id));

      // 変更がなければスキップ
      if (added.length === 0 && removed.length === 0) return;

      // 楽観的更新
      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;

      try {
        // 追加されたタグを処理
        for (const tagId of added) {
          await addPlanTag(planId, tagId);
        }
        // 削除されたタグを処理
        for (const tagId of removed) {
          await removePlanTag(planId, tagId);
        }
      } catch (error) {
        console.error('Failed to update tags:', error);
        // エラー時はロールバック
        setSelectedTagIds(oldTagIds);
        selectedTagIdsRef.current = oldTagIds;
      }
    },
    [planId, addPlanTag, removePlanTag],
  );

  const handleRemoveTag = useCallback(
    async (tagId: string) => {
      if (!planId) return;

      // ref から最新の値を取得
      const oldTagIds = selectedTagIdsRef.current;
      const newTagIds = oldTagIds.filter((id) => id !== tagId);

      // 楽観的更新
      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;

      try {
        await removePlanTag(planId, tagId);
      } catch (error) {
        console.error('Failed to remove tag:', error);
        // エラー時はロールバック
        setSelectedTagIds(oldTagIds);
        selectedTagIdsRef.current = oldTagIds;
      }
    },
    [planId, removePlanTag],
  );

  const handleDelete = useCallback(() => {
    if (!planId) return;
    openDeleteDialog(planId, plan?.title ?? null, async () => {
      await deletePlan.mutateAsync({ id: planId });
      closeInspector();
    });
  }, [planId, plan?.title, openDeleteDialog, deletePlan, closeInspector]);

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      autoSave('due_date', date ? format(date, 'yyyy-MM-dd') : undefined);
    },
    [autoSave],
  );

  const handleStartTimeChange = useCallback(
    (time: string) => {
      setStartTime(time);
      if (time && selectedDate) {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        autoSave('start_time', dateTime.toISOString());
      } else {
        autoSave('start_time', undefined);
      }
    },
    [selectedDate, autoSave],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      setEndTime(time);
      if (time && selectedDate) {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        autoSave('end_time', dateTime.toISOString());
      } else {
        autoSave('end_time', undefined);
      }
    },
    [selectedDate, autoSave],
  );

  // Plan固有のメニューアクション
  const handleCopyId = useCallback(() => {
    if (planId) navigator.clipboard.writeText(planId);
  }, [planId]);

  const handleOpenInNewTab = useCallback(() => {
    if (planId) window.open(`/plans/${planId}`, '_blank');
  }, [planId]);

  const handleDuplicate = useCallback(() => {
    console.log('Duplicate plan:', plan);
  }, [plan]);

  const handleCopyLink = useCallback(() => {
    if (planId) {
      const url = `${window.location.origin}/plans/${planId}`;
      navigator.clipboard.writeText(url);
    }
  }, [planId]);

  const handleSaveAsTemplate = useCallback(() => {
    console.log('Save as template:', plan);
  }, [plan]);

  // Plan固有のメニュー内容
  const menuContent = (
    <>
      <DropdownMenuItem onClick={handleDuplicate}>
        <Copy className="size-4" />
        複製する
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleCopyLink}>
        <Link className="size-4" />
        リンクをコピー
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleSaveAsTemplate}>
        <Save className="size-4" />
        テンプレートとして保存
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleCopyId}>
        <Copy className="size-4" />
        IDをコピー
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleOpenInNewTab}>
        <ExternalLink className="size-4" />
        新しいタブで開く
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <div className="text-muted-foreground px-2 py-2 text-xs font-medium">表示モード</div>
      <button
        type="button"
        onClick={() => setDisplayMode('sheet')}
        className="hover:bg-state-hover flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
      >
        <span className="flex items-center gap-2">
          <PanelRight className="size-4 shrink-0" />
          パネル
        </span>
        {displayMode === 'sheet' && <CheckIcon className="text-primary size-4" />}
      </button>
      <button
        type="button"
        onClick={() => setDisplayMode('popover')}
        className="hover:bg-state-hover flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none"
      >
        <span className="flex items-center gap-2">
          <SquareMousePointer className="size-4 shrink-0" />
          ポップアップ
        </span>
        {displayMode === 'popover' && <CheckIcon className="text-primary size-4" />}
      </button>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} variant="destructive">
        <Trash2 className="size-4" />
        削除
      </DropdownMenuItem>
    </>
  );

  // ローディング・空状態はInspectorContentで処理されるので、ここでは通常コンテンツのみ
  if (!plan) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ヘッダー */}
      <InspectorHeader
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onClose={closeInspector}
        onPrevious={goToPrevious}
        onNext={goToNext}
        displayMode={displayMode}
        closeLabel={t('actions.close')}
        previousLabel={t('aria.previous')}
        nextLabel={t('aria.next')}
        menuContent={menuContent}
      />

      <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden pt-2">
        <TabsList className="border-border bg-popover sticky top-0 z-10 grid h-10 w-full shrink-0 grid-cols-3 rounded-none border-b p-0">
          <TabsTrigger
            value="details"
            className="data-[state=active]:border-foreground hover:border-foreground/50 flex h-10 items-center justify-center gap-2 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <ClipboardList className="size-4" />
            詳細
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:border-foreground hover:border-foreground/50 flex h-10 items-center justify-center gap-2 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <span className="relative flex items-center gap-2">
              <History className="size-4" />
              アクティビティ
              <span
                ref={sortButtonRef}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivityOrder(activityOrder === 'desc' ? 'asc' : 'desc');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivityOrder(activityOrder === 'desc' ? 'asc' : 'desc');
                  }
                }}
                onMouseEnter={() => {
                  if (sortButtonRef.current) {
                    const rect = sortButtonRef.current.getBoundingClientRect();
                    setTooltipPosition({
                      top: rect.top - 8,
                      left: rect.left + rect.width / 2,
                    });
                  }
                  setIsHoveringSort(true);
                }}
                onMouseLeave={() => setIsHoveringSort(false)}
                className="hover:bg-state-hover cursor-pointer rounded p-0.5 transition-colors"
                aria-label={activityOrder === 'desc' ? '古い順に変更' : '最新順に変更'}
              >
                {activityOrder === 'desc' ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </span>
              {isHoveringSort && (
                <Portal.Root>
                  <div
                    className="bg-tooltip text-tooltip-foreground fixed z-[9999] -translate-x-1/2 -translate-y-full rounded-md px-3 py-1.5 text-xs whitespace-nowrap"
                    style={{
                      top: `${tooltipPosition.top}px`,
                      left: `${tooltipPosition.left}px`,
                    }}
                  >
                    {activityOrder === 'desc' ? '最新順で表示中' : '古い順で表示中'}
                  </div>
                </Portal.Root>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="data-[state=active]:border-foreground hover:border-foreground/50 flex h-10 items-center justify-center gap-2 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <MessageSquare className="size-4" />
            コメント
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="flex-1 overflow-y-auto">
          {/* Title */}
          <div className="flex min-h-10 items-start gap-2 px-4 py-2">
            <CheckSquare className="text-muted-foreground mt-1.5 size-4 flex-shrink-0" />
            <div className="flex min-h-8 flex-1 items-center">
              <span
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => autoSave('title', e.currentTarget.textContent || '')}
                className="bg-popover border-0 px-0 text-lg font-semibold outline-none"
              >
                {plan.title}
              </span>
              {plan.plan_number && (
                <span className="text-muted-foreground ml-2 text-sm">#{plan.plan_number}</span>
              )}
            </div>
          </div>

          {/* 日付・時刻・繰り返し */}
          <PlanScheduleSection
            selectedDate={selectedDate}
            startTime={startTime}
            endTime={endTime}
            onDateChange={handleDateChange}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            recurrenceRule={(() => {
              if (!planId) return null;
              const cache = getCache(planId);
              return cache?.recurrence_rule !== undefined
                ? cache.recurrence_rule
                : (plan?.recurrence_rule ?? null);
            })()}
            recurrenceType={(() => {
              if (!planId) return null;
              const cache = getCache(planId);
              return cache?.recurrence_type !== undefined
                ? cache.recurrence_type
                : (plan?.recurrence_type ?? null);
            })()}
            onRepeatTypeChange={(type) => {
              if (!planId) return;
              const typeMap: Record<
                string,
                'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'
              > = {
                '': 'none',
                毎日: 'daily',
                毎週: 'weekly',
                毎月: 'monthly',
                毎年: 'yearly',
                平日: 'weekdays',
              };
              updatePlan.mutate({
                id: planId,
                data: { recurrence_type: typeMap[type] || 'none', recurrence_rule: null },
              });
            }}
            onRecurrenceRuleChange={(rrule) => {
              if (!planId) return;
              updatePlan.mutate({ id: planId, data: { recurrence_rule: rrule } });
            }}
            showBorderTop={true}
          />

          {/* Tags */}
          <PlanTagsSection
            selectedTagIds={selectedTagIds}
            onTagsChange={handleTagsChange}
            onRemoveTag={handleRemoveTag}
            showBorderTop={true}
            popoverAlign="end"
            popoverSide="bottom"
            popoverAlignOffset={-80}
          />

          {/* Description */}
          <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
            <FileText className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
            <div className="max-h-52 min-h-8 min-w-0 flex-1 overflow-y-auto">
              <NovelDescriptionEditor
                key={plan.id}
                content={plan.description || ''}
                onChange={(html) => autoSave('description', html)}
                placeholder="説明を追加..."
              />
            </div>
          </div>

          {/* Reminder */}
          <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
            <Bell className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
            <div className="flex h-8 flex-1 items-center">
              <ReminderSelect
                value={reminderType}
                onChange={(type) => {
                  if (!planId) return;
                  setReminderType(type);
                  const reminderMap: Record<string, number | null> = {
                    '': null,
                    開始時刻: 0,
                    '10分前': 10,
                    '30分前': 30,
                    '1時間前': 60,
                    '1日前': 1440,
                    '1週間前': 10080,
                  };
                  updatePlan.mutate({
                    id: planId,
                    data: { reminder_minutes: reminderMap[type] ?? null },
                  });
                }}
                variant="inspector"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 overflow-y-auto">
          <ActivityTab planId={planId!} order={activityOrder} />
        </TabsContent>

        <TabsContent value="comments" className="flex-1 overflow-y-auto">
          <div className="text-muted-foreground py-8 text-center">コメント機能は準備中です</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
