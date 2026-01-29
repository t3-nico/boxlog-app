'use client';

/**
 * Plan Inspectorのコンテンツ部分
 * InspectorShellの中で使用される
 */

import { CalendarPlus, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { InspectorHeader, useDragHandle } from '@/features/inspector';
import { cn } from '@/lib/utils';

import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore';
import { reminderTypeToMinutes } from '../../../utils/reminder';

import { PlanInspectorDetailsTab } from './PlanInspectorDetailsTab';
import { PlanInspectorMenu } from './PlanInspectorMenu';
import { RecordCreateForm, type RecordCreateFormRef } from './RecordCreateForm';
import { usePlanInspectorContentLogic } from './usePlanInspectorContentLogic';

export function PlanInspectorContent() {
  const t = useTranslations();

  // 新規作成時のエントリタイプ
  const createType = usePlanInspectorStore((state) => state.createType);
  const setCreateType = usePlanInspectorStore((state) => state.setCreateType);

  // Record フォームの ref
  const recordFormRef = useRef<RecordCreateFormRef>(null);

  const {
    planId,
    plan,
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

  if (!plan) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ヘッダー */}
      {isDraftMode ? (
        <DraftModeHeader createType={createType} setCreateType={setCreateType} />
      ) : (
        // 既存Plan編集用ヘッダー
        <InspectorHeader
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onClose={cancelAndClose}
          onPrevious={goToPrevious}
          onNext={goToNext}
          closeLabel={t('actions.close')}
          previousLabel={t('aria.previous')}
          nextLabel={t('aria.next')}
          menuContent={menuContent}
        />
      )}

      {/* コンテンツ部分 */}
      <div
        className={cn(
          'overflow-y-auto',
          // Recordモードはコンパクトに、それ以外はflex-1で伸ばす
          isDraftMode && createType === 'record' ? '' : 'flex-1',
        )}
      >
        {isDraftMode ? (
          // ドラフトモード: タイプに応じてフォームを表示
          createType === 'plan' ? (
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
              recurrenceRule={null}
              recurrenceType={null}
              onAutoSave={autoSave}
              onScheduleDateChange={handleScheduleDateChange}
              onDueDateChange={handleDueDateChange}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
              onReminderChange={(type) => setReminderType(type)}
              onTagsChange={handleTagsChange}
              onRemoveTag={handleRemoveTag}
              onRepeatTypeChange={() => {}}
              onRecurrenceRuleChange={() => {}}
              timeConflictError={timeConflictError}
              onStatusChange={() => {}}
              isDraftMode={isDraftMode}
            />
          ) : (
            <RecordCreateForm ref={recordFormRef} />
          )
        ) : (
          /* 既存Plan編集時はタブなし */
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
              setReminderType(type);
              if (planId) {
                updatePlan.mutate({
                  id: planId,
                  data: { reminder_minutes: reminderTypeToMinutes(type) },
                });
              }
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
            isDraftMode={isDraftMode}
          />
        )}
      </div>

      {/* 保存/キャンセルボタン（未保存の変更がある場合またはドラフトモード時に表示） */}
      {(hasPendingChanges || isDraftMode) && (
        <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
          <Button variant="ghost" onClick={cancelAndClose}>
            キャンセル
          </Button>
          {isDraftMode && createType === 'record' ? (
            <Button onClick={() => recordFormRef.current?.save()}>Record 作成</Button>
          ) : (
            <Button onClick={saveAndClose}>{isDraftMode ? 'Plan 作成' : '保存'}</Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ドラフトモード用ヘッダー
 *
 * タブ切り替え（Plan/Record）を配置
 * ドラッグハンドルを適用してドラッグを可能にする
 */
interface DraftModeHeaderProps {
  createType: 'plan' | 'record';
  setCreateType: (type: 'plan' | 'record') => void;
}

function DraftModeHeader({ createType, setCreateType }: DraftModeHeaderProps) {
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

      {/* Plan/Record タブ */}
      <div className="relative z-10 flex gap-1">
        <button
          type="button"
          onClick={() => setCreateType('plan')}
          className={cn(
            'flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium transition-colors',
            createType === 'plan'
              ? 'bg-state-active text-state-active-foreground'
              : 'text-muted-foreground hover:bg-state-hover hover:text-foreground',
          )}
        >
          <CalendarPlus className="size-4" />
          Plan
        </button>
        <button
          type="button"
          onClick={() => setCreateType('record')}
          className={cn(
            'flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium transition-colors',
            createType === 'record'
              ? 'bg-state-active text-state-active-foreground'
              : 'text-muted-foreground hover:bg-state-hover hover:text-foreground',
          )}
        >
          <Clock className="size-4" />
          Record
        </button>
      </div>
    </div>
  );
}
