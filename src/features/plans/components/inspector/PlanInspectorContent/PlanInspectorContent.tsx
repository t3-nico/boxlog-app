'use client';

/**
 * Entry Inspectorのコンテンツ部分
 *
 * 「Time waits for no one」原則:
 * - SegmentedControl (Plan/Record) を廃止
 * - getEntryState() で時間位置に基づくUI出し分け
 * - status フィールドなし（時間位置から自動判定）
 */

import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import type { FulfillmentScore } from '@/core/types/entry';
import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useSubmitShortcut } from '@/hooks/useSubmitShortcut';
import { getEntryState, isTimePast } from '@/lib/entry-status';
import { cn } from '@/lib/utils';
import { InspectorHeader, useDragHandle } from '../shared';

import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';

import { PlanInspectorDetailsTab } from './PlanInspectorDetailsTab';
import { PlanInspectorMenu } from './PlanInspectorMenu';
import { usePlanInspectorContentLogic } from './usePlanInspectorContentLogic';

export function PlanInspectorContent() {
  const t = useTranslations();

  const {
    planId,
    plan,
    saveAndClose,
    cancelAndClose,
    isDraftMode,
    isSaving,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
    selectedTagId,
    handleTagChange,
    scheduleDate,
    startTime,
    endTime,
    reminderMinutes,
    actualStartTime,
    actualEndTime,
    handleReminderChange,
    timeConflictError,
    handleScheduleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleActualStartChange,
    handleActualEndChange,
    autoSave,
    updatePlan,
    handleDelete,
    handleCopyId,
    handleDuplicate,
    getCache,
  } = usePlanInspectorContentLogic();

  // Cmd+Enter / Ctrl+Enter でドラフト作成
  useSubmitShortcut({
    enabled: isDraftMode,
    isLoading: isSaving,
    checkDisabled: () => false,
    onSubmit: saveAndClose,
  });

  // エントリの時間位置ベース状態（upcoming/active/past）
  const entryState = useMemo(() => {
    if (!plan) return 'upcoming' as const;
    const st = plan.start_time ?? null;
    const et = plan.end_time ?? null;
    return getEntryState({ start_time: st, end_time: et });
  }, [plan]);

  // ドラフトの時間位置（ボタンラベル用）
  const draftStartTime = useEntryInspectorStore((state) => state.draftEntry?.start_time);
  const isDraftPast = draftStartTime ? isTimePast(draftStartTime) : false;

  // 充実度スコアのハンドリング（active/past のみ表示）
  const fulfillmentScore = useMemo<FulfillmentScore | null>(() => {
    if (!planId) return null;
    const cache = getCache(planId);
    if (cache?.fulfillment_score !== undefined) {
      return cache.fulfillment_score as FulfillmentScore | null;
    }
    return (plan as { fulfillment_score?: FulfillmentScore | null })?.fulfillment_score ?? null;
  }, [planId, plan, getCache]);

  // 充実度は entries API 経由で更新（plan mutations には fulfillment_score がない）
  const { updateEntry } = useEntryMutations();
  const handleFulfillmentChange = useCallback(
    (score: FulfillmentScore | null) => {
      if (!planId) return;
      updateEntry.mutate({ id: planId, data: { fulfillment_score: score } });
    },
    [planId, updateEntry],
  );

  const menuContent = (
    <PlanInspectorMenu
      onDuplicate={handleDuplicate}
      onCopyId={handleCopyId}
      onDelete={handleDelete}
    />
  );

  if (!plan) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ヘッダー */}
      {isDraftMode ? (
        <DraftModeHeader />
      ) : (
        <InspectorHeader
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onClose={isSaving ? () => {} : saveAndClose}
          onPrevious={goToPrevious}
          onNext={goToNext}
          closeLabel={t('common.actions.close')}
          previousLabel={t('common.aria.previous')}
          nextLabel={t('common.aria.next')}
          menuContent={menuContent}
        />
      )}

      {/* コンテンツ部分 */}
      <div className={cn('flex-1 overflow-y-auto')}>
        <PlanInspectorDetailsTab
          plan={plan}
          scheduleDate={scheduleDate}
          startTime={startTime}
          endTime={endTime}
          reminderMinutes={reminderMinutes}
          selectedTagId={selectedTagId}
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
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
          onReminderChange={handleReminderChange}
          onTagChange={handleTagChange}
          onRepeatTypeChange={(type) => {
            if (!planId) return;
            updatePlan.mutate({
              id: planId,
              data: {
                recurrence_type: (type || 'none') as
                  | 'none'
                  | 'daily'
                  | 'weekly'
                  | 'monthly'
                  | 'yearly'
                  | 'weekdays',
                recurrence_rule: null,
              },
            });
          }}
          onRecurrenceRuleChange={(rrule) => {
            if (!planId) return;
            updatePlan.mutate({ id: planId, data: { recurrence_rule: rrule } });
          }}
          timeConflictError={timeConflictError}
          isDraftMode={isDraftMode}
          entryState={isDraftMode ? (isDraftPast ? 'past' : 'upcoming') : entryState}
          fulfillmentScore={fulfillmentScore}
          onFulfillmentChange={handleFulfillmentChange}
          actualStart={actualStartTime}
          actualEnd={actualEndTime}
          onActualStartChange={handleActualStartChange}
          onActualEndChange={handleActualEndChange}
        />
      </div>

      {/* フッター: ドラフトモードのみ（編集モードは自動保存） */}
      {isDraftMode && (
        <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
          <Button variant="ghost" onClick={cancelAndClose} disabled={isSaving}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={saveAndClose} disabled={isSaving}>
            {isDraftPast ? t('plan.inspector.createRecord') : t('plan.inspector.createPlan')}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * ドラフトモード用ヘッダー
 *
 * ドラッグハンドルのみ（Plan/Record切り替えを廃止）
 */
function DraftModeHeader() {
  const dragHandleProps = useDragHandle();
  const isDraggable = !!dragHandleProps;

  return (
    <div className="bg-card relative flex shrink-0 items-center px-4 pt-4 pb-2">
      {isDraggable && (
        <div
          {...dragHandleProps}
          className="hover:bg-state-hover absolute inset-0 cursor-move transition-colors"
          aria-hidden="true"
        />
      )}
      {/* スペーサー（ヘッダー高を維持） */}
      <div className="relative z-10 h-6" />
    </div>
  );
}
