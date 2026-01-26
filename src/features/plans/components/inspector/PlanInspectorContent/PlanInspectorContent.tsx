'use client';

/**
 * Plan Inspectorのコンテンツ部分
 * InspectorShellの中で使用される
 */

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { InspectorHeader } from '@/features/inspector';

import { reminderTypeToMinutes } from '../../../utils/reminder';

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
    saveAndClose,
    cancelAndClose,
    hasPendingChanges,
    isDraftMode,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
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
        onClose={cancelAndClose}
        onPrevious={goToPrevious}
        onNext={goToNext}
        displayMode={displayMode}
        closeLabel={t('actions.close')}
        previousLabel={t('aria.previous')}
        nextLabel={t('aria.next')}
        rightContent={displayModeSwitcher}
        menuContent={isDraftMode ? undefined : menuContent}
      />

      {/* シングルビュー（タブ廃止） */}
      <div className="flex-1 overflow-y-auto">
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
          recurrenceRule={
            isDraftMode
              ? null
              : (() => {
                  if (!planId) return null;
                  const cache = getCache(planId);
                  return cache?.recurrence_rule !== undefined
                    ? cache.recurrence_rule
                    : (plan?.recurrence_rule ?? null);
                })()
          }
          recurrenceType={
            isDraftMode
              ? null
              : (() => {
                  if (!planId) return null;
                  const cache = getCache(planId);
                  return cache?.recurrence_type !== undefined
                    ? cache.recurrence_type
                    : (plan?.recurrence_type ?? null);
                })()
          }
          onAutoSave={autoSave}
          onScheduleDateChange={handleScheduleDateChange}
          onDueDateChange={handleDueDateChange}
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
          onReminderChange={(type) => {
            setReminderType(type);
            if (!isDraftMode && planId) {
              updatePlan.mutate({
                id: planId,
                data: { reminder_minutes: reminderTypeToMinutes(type) },
              });
            }
          }}
          onTagsChange={handleTagsChange}
          onRemoveTag={handleRemoveTag}
          onRepeatTypeChange={(type) => {
            if (isDraftMode || !planId) return;
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
            if (isDraftMode || !planId) return;
            updatePlan.mutate({ id: planId, data: { recurrence_rule: rrule } });
          }}
          timeConflictError={timeConflictError}
          onStatusChange={(status) => {
            if (isDraftMode || !planId) return;
            updatePlan.mutate({ id: planId, data: { status } });
          }}
          isDraftMode={isDraftMode}
        />
      </div>

      {/* 保存/キャンセルボタン（未保存の変更がある場合またはドラフトモード時に表示） */}
      {(hasPendingChanges || isDraftMode) && (
        <div className="flex shrink-0 justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" onClick={cancelAndClose}>
            キャンセル
          </Button>
          <Button onClick={saveAndClose}>{isDraftMode ? '作成' : '保存'}</Button>
        </div>
      )}
    </div>
  );
}
