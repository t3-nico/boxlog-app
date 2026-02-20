'use client';

/**
 * Plan Inspectorのコンテンツ部分
 * InspectorShellの中で使用される
 */

import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useSubmitShortcut } from '@/hooks/useSubmitShortcut';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { InspectorHeader, useDragHandle } from '../shared';

import { usePlanInspectorStore, type DraftPlan } from '../../../stores/usePlanInspectorStore';
import { normalizeStatus } from '../../../utils/status';

import { PlanActivityPopover } from './ActivityPopover';
import { PlanInspectorDetailsTab } from './PlanInspectorDetailsTab';
import { PlanInspectorMenu } from './PlanInspectorMenu';
import { RecordCreateForm, type RecordCreateFormRef } from './RecordCreateForm';
import { usePlanInspectorContentLogic } from './usePlanInspectorContentLogic';

export function PlanInspectorContent() {
  const t = useTranslations();

  // 新規作成時のエントリタイプ
  const createType = usePlanInspectorStore((state) => state.createType);
  const setCreateType = usePlanInspectorStore((state) => state.setCreateType);
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);

  // Record フォームの ref
  const recordFormRef = useRef<RecordCreateFormRef>(null);

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
    selectedTagIds,
    handleTagsChange,
    handleRemoveTag,
    titleRef,
    scheduleDate,
    startTime,
    endTime,
    reminderMinutes,
    handleReminderChange,
    timeConflictError,
    handleScheduleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    autoSave,
    updatePlan,
    handleDelete,
    handleCopyId,
    handleDuplicate,
    handleSaveAsTemplate,
    getCache,
  } = usePlanInspectorContentLogic();

  // Cmd+Enter / Ctrl+Enter でドラフト作成
  useSubmitShortcut({
    enabled: isDraftMode,
    isLoading: isSaving,
    checkDisabled: () => {
      if (createType === 'record') {
        return recordFormRef.current?.isSaveDisabled() ?? false;
      }
      return false;
    },
    onSubmit: () => {
      if (createType === 'record') {
        recordFormRef.current?.save();
      } else {
        saveAndClose();
      }
    },
  });

  // タブ切り替え時にタイトルをフォーカス
  useEffect(() => {
    if (!isDraftMode) return;
    // レンダリング後にフォーカス
    requestAnimationFrame(() => {
      if (createType === 'plan') {
        titleRef.current?.focus();
      } else {
        recordFormRef.current?.focusTitle();
      }
    });
  }, [createType, isDraftMode, titleRef]);

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
      onSaveAsTemplate={handleSaveAsTemplate}
      onCopyId={handleCopyId}
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
          onClose={isSaving ? () => {} : saveAndClose}
          onPrevious={goToPrevious}
          onNext={goToNext}
          closeLabel={t('common.actions.close')}
          previousLabel={t('common.aria.previous')}
          nextLabel={t('common.aria.next')}
          extraRightContent={planId ? <PlanActivityPopover planId={planId} /> : undefined}
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
              startTime={startTime}
              endTime={endTime}
              reminderMinutes={reminderMinutes}
              selectedTagIds={selectedTagIds}
              recurrenceRule={null}
              recurrenceType={null}
              onAutoSave={autoSave}
              onScheduleDateChange={handleScheduleDateChange}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
              onReminderChange={handleReminderChange}
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
            startTime={startTime}
            endTime={endTime}
            reminderMinutes={reminderMinutes}
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
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onReminderChange={handleReminderChange}
            onTagsChange={handleTagsChange}
            onRemoveTag={handleRemoveTag}
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
          />
        )}
      </div>

      {/* フッター */}
      {isDraftMode ? (
        // ドラフトモード: 作成ボタン
        <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
          <Button variant="ghost" onClick={cancelAndClose} disabled={isSaving}>
            {t('common.actions.cancel')}
          </Button>
          {createType === 'record' ? (
            <Button onClick={() => recordFormRef.current?.save()} disabled={isSaving}>
              {t('plan.inspector.createRecord')}
            </Button>
          ) : (
            <Button onClick={saveAndClose} disabled={isSaving}>
              {t('plan.inspector.createPlan')}
            </Button>
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

            // 完了 + Record作成（フォームを開いて確認）
            const handleCompleteWithRecord = async () => {
              if (!planId || !plan || !scheduleDate) return;

              // 1. Planを完了にする
              await updatePlan.mutateAsync({ id: planId, data: { status: 'closed' } });

              // 2. start_time/end_timeをISO形式に変換
              const buildIsoTime = (time: string | null) => {
                if (!time) return null;
                const [h, m] = time.split(':').map(Number);
                const date = new Date(scheduleDate);
                date.setHours(h ?? 0, m ?? 0, 0, 0);
                return date.toISOString();
              };

              // 3. Record作成フォームをPlan情報でプリフィルして開く
              const draftData: Partial<DraftPlan> = {
                title: plan.title || '',
                description: plan.description,
                start_time: buildIsoTime(startTime),
                end_time: buildIsoTime(endTime),
                tagIds: selectedTagIds,
                plan_id: planId,
                note: plan.description,
              };
              openInspectorWithDraft(draftData, 'record');
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
                  {t('plan.inspector.markIncomplete')}
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
                  {t('plan.inspector.markComplete')}
                </Button>
                {/* ドロップダウントリガー */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="primary"
                      icon
                      className="rounded-none border-0"
                      aria-label={t('plan.inspector.completeOptions')}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleComplete}>
                      {t('plan.inspector.markComplete')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleCompleteWithRecord}
                      disabled={cannotCreateRecord}
                    >
                      {t('plan.inspector.completeAndCreateRecord')}
                    </DropdownMenuItem>
                    {cannotCreateRecord && (
                      <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-xs font-normal">
                        {t('plan.inspector.timeConflict')}
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

const draftTypeOptions = [
  { value: 'plan' as const, label: 'Plan' },
  { value: 'record' as const, label: 'Record' },
];

/**
 * ドラフトモード用ヘッダー
 *
 * セグメントコントロール（Plan/Record）を配置
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
    <div className="bg-card relative flex shrink-0 items-center px-4 pt-4 pb-2">
      {/* ドラッグハンドル（背景レイヤー） */}
      {isDraggable && (
        <div
          {...dragHandleProps}
          className="hover:bg-state-hover absolute inset-0 cursor-move transition-colors"
          aria-hidden="true"
        />
      )}

      {/* Plan/Record 切り替え */}
      <SegmentedControl
        options={draftTypeOptions}
        value={createType}
        onChange={setCreateType}
        className="relative z-10"
      />
    </div>
  );
}
