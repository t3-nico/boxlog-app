'use client';

/**
 * Plan Inspectorのコンテンツ部分
 * InspectorShellの中で使用される
 */

import { format } from 'date-fns';
import { CalendarPlus, ChevronDown, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InspectorHeader, useDragHandle } from '@/features/inspector';
import { useRecordMutations } from '@/features/records/hooks/useRecordMutations';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore';
import { reminderTypeToMinutes } from '../../../utils/reminder';
import { normalizeStatus } from '../../../utils/status';

import { ActivityPopover } from './ActivityPopover';
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

  // Record作成用mutation（完了+Record作成機能用）
  const { createRecord } = useRecordMutations();

  const {
    planId,
    plan,
    saveAndClose,
    cancelAndClose,
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

  // 既存Recordの存在チェック（編集モードのみ）
  const { data: existingRecords } = api.records.listByPlan.useQuery(
    { planId: planId!, sortOrder: 'desc' },
    { enabled: !!planId && !isDraftMode },
  );
  const hasExistingRecord = (existingRecords?.length ?? 0) > 0;

  // 時間重複チェック（その日のRecordを取得）
  const scheduleDateStr = scheduleDate ? format(scheduleDate, 'yyyy-MM-dd') : null;
  const { data: recordsOnSameDate } = api.records.list.useQuery(
    { worked_at_from: scheduleDateStr!, worked_at_to: scheduleDateStr! },
    { enabled: !!scheduleDateStr && !isDraftMode && !!startTime && !!endTime },
  );

  // 時間重複判定（start_time < 新end_time AND end_time > 新start_time）
  const hasTimeConflict = (() => {
    if (!recordsOnSameDate || !startTime || !endTime) return false;
    return recordsOnSameDate.some((record) => {
      if (!record.start_time || !record.end_time) return false;
      return record.start_time < endTime && record.end_time > startTime;
    });
  })();

  // Record作成不可
  const cannotCreateRecord = hasExistingRecord || hasTimeConflict;

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
        // 既存Plan編集用ヘッダー（自動保存: ×で閉じる時にバッファを保存）
        <InspectorHeader
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onClose={saveAndClose}
          onPrevious={goToPrevious}
          onNext={goToNext}
          closeLabel={t('actions.close')}
          previousLabel={t('aria.previous')}
          nextLabel={t('aria.next')}
          extraRightContent={planId ? <ActivityPopover planId={planId} /> : undefined}
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
            isDraftMode={isDraftMode}
          />
        )}
      </div>

      {/* フッター */}
      {isDraftMode ? (
        // ドラフトモード: 作成ボタン
        <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
          <Button variant="ghost" onClick={cancelAndClose}>
            キャンセル
          </Button>
          {createType === 'record' ? (
            <Button onClick={() => recordFormRef.current?.save()}>Record 作成</Button>
          ) : (
            <Button onClick={saveAndClose}>Plan 作成</Button>
          )}
        </div>
      ) : (
        // 編集モード: 完了にするボタン（Google Calendarスタイル）
        <div className="flex shrink-0 justify-end px-4 py-4">
          {(() => {
            const status = normalizeStatus(plan.status);

            // 完了にする
            const handleComplete = () => {
              if (!planId) return;
              updatePlan.mutate({ id: planId, data: { status: 'closed' } });
            };

            // 完了 + Record作成
            const handleCompleteWithRecord = async () => {
              if (!planId || !plan || !scheduleDate) return;

              // 1. Planを完了にする
              await updatePlan.mutateAsync({ id: planId, data: { status: 'closed' } });

              // 2. durationを計算（分単位）
              const calcDuration = () => {
                if (!startTime || !endTime) return 60; // デフォルト1時間
                const startParts = startTime.split(':');
                const endParts = endTime.split(':');
                const sh = Number(startParts[0] ?? 0);
                const sm = Number(startParts[1] ?? 0);
                const eh = Number(endParts[0] ?? 0);
                const em = Number(endParts[1] ?? 0);
                const startMinutes = sh * 60 + sm;
                const endMinutes = eh * 60 + em;
                const duration = endMinutes - startMinutes;
                return duration > 0 ? duration : 60;
              };

              // 3. 同じ内容でRecordを作成（全フィールドコピー）
              await createRecord.mutateAsync({
                title: plan.title || undefined,
                worked_at: format(scheduleDate, 'yyyy-MM-dd'),
                start_time: startTime || undefined,
                end_time: endTime || undefined,
                duration_minutes: calcDuration(),
                note: plan.description || undefined,
                plan_id: planId,
                tagIds: selectedTagIds,
              });
            };

            // 未完了に戻す
            const handleReopen = () => {
              if (!planId) return;
              updatePlan.mutate({ id: planId, data: { status: 'open' } });
            };

            if (status === 'closed') {
              // 完了状態: シンプルなボタン
              return (
                <Button variant="outline" onClick={handleReopen}>
                  未完了に戻す
                </Button>
              );
            }

            // 未完了状態: スプリットボタン
            return (
              <div className="flex items-center overflow-hidden rounded-md">
                {/* メインボタン */}
                <Button
                  variant="primary"
                  className="rounded-none border-0"
                  onClick={handleComplete}
                >
                  完了にする
                </Button>
                {/* ドロップダウントリガー */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="primary"
                      size="icon"
                      className="rounded-none border-0"
                      aria-label="完了オプション"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleComplete}>完了にする</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleCompleteWithRecord}
                      disabled={cannotCreateRecord}
                    >
                      完了 + Record作成
                    </DropdownMenuItem>
                    {cannotCreateRecord && (
                      <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-xs font-normal">
                        時間が重複しています
                      </DropdownMenuLabel>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })()}
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
            'flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-bold transition-colors',
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
            'flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-bold transition-colors',
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
