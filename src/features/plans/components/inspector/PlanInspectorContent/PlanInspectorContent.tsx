'use client';

/**
 * Plan Inspectorのコンテンツ部分
 * InspectorShellの中で使用される
 */

import * as Portal from '@radix-ui/react-portal';
import { ChevronDown, ChevronUp, ClipboardList, History, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InspectorHeader } from '@/features/inspector';

import { reminderTypeToMinutes } from '../../../utils/reminder';
import { ActivityTab } from '../components';

import { DisplayModeSwitcher } from './DisplayModeSwitcher';
import { PlanInspectorDetailsTab } from './PlanInspectorDetailsTab';
import { PlanInspectorMenu } from './PlanInspectorMenu';
import { usePlanInspectorContentLogic } from './usePlanInspectorContentLogic';

export function PlanInspectorContent() {
  const t = useTranslations();
  const {
    planId,
    plan,
    displayMode,
    setDisplayMode,
    closeInspector,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
    activityOrder,
    setActivityOrder,
    isHoveringSort,
    setIsHoveringSort,
    sortButtonRef,
    tooltipPosition,
    setTooltipPosition,
    selectedTagIds,
    handleTagsChange,
    handleRemoveTag,
    titleRef,
    scheduleDate,
    dueDate,
    startTime,
    endTime,
    reminderType,
    setReminderType,
    timeConflictError,
    handleScheduleDateChange,
    handleDueDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    autoSave,
    updatePlan,
    handleDelete,
    handleCopyId,
    handleOpenInNewTab,
    handleDuplicate,
    handleCopyLink,
    handleSaveAsTemplate,
    getCache,
  } = usePlanInspectorContentLogic();

  const menuContent = (
    <PlanInspectorMenu
      onDuplicate={handleDuplicate}
      onCopyLink={handleCopyLink}
      onSaveAsTemplate={handleSaveAsTemplate}
      onCopyId={handleCopyId}
      onOpenInNewTab={handleOpenInNewTab}
      onDelete={handleDelete}
    />
  );

  const displayModeSwitcher = (
    <DisplayModeSwitcher displayMode={displayMode} onDisplayModeChange={setDisplayMode} />
  );

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
        rightContent={displayModeSwitcher}
        menuContent={menuContent}
      />

      <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="bg-popover sticky top-0 z-10 grid h-10 w-full shrink-0 grid-cols-3 rounded-none border-0 p-0">
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
                    className="bg-foreground text-background fixed z-[9999] -translate-x-1/2 -translate-y-full rounded-md px-3 py-1.5 text-xs whitespace-nowrap"
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
          <PlanInspectorDetailsTab
            plan={plan}
            planId={planId!}
            titleRef={titleRef}
            scheduleDate={scheduleDate}
            dueDate={dueDate}
            startTime={startTime}
            endTime={endTime}
            reminderType={reminderType}
            selectedTagIds={selectedTagIds}
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
            onAutoSave={autoSave}
            onScheduleDateChange={handleScheduleDateChange}
            onDueDateChange={handleDueDateChange}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onReminderChange={(type) => {
              if (!planId) return;
              setReminderType(type);
              updatePlan.mutate({
                id: planId,
                data: { reminder_minutes: reminderTypeToMinutes(type) },
              });
            }}
            onTagsChange={handleTagsChange}
            onRemoveTag={handleRemoveTag}
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
            timeConflictError={timeConflictError}
            onStatusChange={(status) => {
              if (!planId) return;
              updatePlan.mutate({ id: planId, data: { status } });
            }}
          />
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
