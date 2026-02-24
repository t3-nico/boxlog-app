'use client';

/**
 * PlanInspectorContent のロジックを管理するカスタムフック（オーケストレーション）
 *
 * 責務を3つのサブフックに分割:
 * - useInspectorTagState: タグ状態管理
 * - useInspectorTimeState: 時間・スケジュール状態管理
 * - useInspectorSaveClose: 保存・閉じるロジック
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';
import type { RecurringEditScope } from '../../../components/RecurringEditConfirmDialog';
import { usePlan } from '../../../hooks/usePlan';
import { useRecurringScopeMutations } from '../../../hooks/useRecurringScopeMutations';
import { useDeleteConfirmStore } from '../../../stores/useDeleteConfirmStore';
import { usePlanCacheStore } from '../../../stores/usePlanCacheStore';
import { usePlanInspectorStore, type DraftPlan } from '../../../stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '../../../stores/useRecurringEditConfirmStore';
import type { Plan } from '../../../types/plan';
import { useInspectorAutoSave, useInspectorNavigation, useRecurringPlanEdit } from '../hooks';
import { useInspectorSaveClose } from './useInspectorSaveClose';
import { useInspectorTagState } from './useInspectorTagState';
import { useInspectorTimeState } from './useInspectorTimeState';

// スコープダイアログを表示するフィールド（日付・時間）
// title/descriptionは即座に保存（Googleカレンダー準拠）
const SCOPE_DIALOG_FIELDS = ['start_time', 'end_time'] as const;

// 即座にDB保存するフィールド（編集モードのみ）
const IMMEDIATE_SAVE_FIELDS = ['title', 'description'] as const;

export function usePlanInspectorContentLogic() {
  // 保存中フラグ（即座に閉じるため常にfalse、UIの disabled guard として維持）
  const isSaving = false;

  // 自動保存デバウンス用タイマー（Activityノイズ防止）
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const planId = usePlanInspectorStore((state) => state.planId);
  const instanceDate = usePlanInspectorStore((state) => state.instanceDate);
  const initialData = usePlanInspectorStore((state) => state.initialData);
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector);
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);
  const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
  const updateDraft = usePlanInspectorStore((state) => state.updateDraft);
  const addPendingChange = usePlanInspectorStore((state) => state.addPendingChange);
  const clearPendingChanges = usePlanInspectorStore((state) => state.clearPendingChanges);
  const pendingChanges = usePlanInspectorStore((state) => state.pendingChanges);

  // ドラフトモード判定: draftPlanがあり、planIdがない場合
  const isDraftMode = draftPlan !== null && planId === null;

  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const openRecurringDialog = useRecurringEditConfirmStore((state) => state.openDialog);
  const getCache = usePlanCacheStore((state) => state.getCache);
  const { applyDelete } = useRecurringScopeMutations();

  // Inspectorマウント時にグローバルダイアログをリセット
  useEffect(() => {
    const { closeDialog } = useRecurringEditConfirmStore.getState();
    closeDialog();
    const timer = setTimeout(() => {
      const { closeDialog: close } = useRecurringEditConfirmStore.getState();
      close();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // planIdが変わったときもリセット
  useEffect(() => {
    const { closeDialog } = useRecurringEditConfirmStore.getState();
    closeDialog();
    const timer = setTimeout(() => {
      const { closeDialog: close } = useRecurringEditConfirmStore.getState();
      close();
    }, 50);
    return () => clearTimeout(timer);
  }, [planId]);

  // 自動保存タイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // ドラフトモードまたは未保存の変更がある場合、beforeunload警告を表示
  useEffect(() => {
    if (!isDraftMode && !pendingChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDraftMode, pendingChanges]);

  const { data: planData } = usePlan(planId!, {
    includeTags: true,
    enabled: !!planId && !isDraftMode,
  });

  // ドラフトモードの場合はdraftPlanを使用、それ以外はfetchしたplanDataを使用
  const plan = isDraftMode
    ? (draftPlan as unknown as Plan | null)
    : ((planData ?? null) as unknown as Plan | null);

  // 繰り返しプラン編集フック
  const recurringEdit = useRecurringPlanEdit({
    plan,
    planId,
    instanceDate,
  });

  // Custom hooks
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId);
  const { updatePlan, deletePlan } = useInspectorAutoSave({ planId, plan });

  // --- サブフック: タグ状態 ---
  const {
    selectedTagIds,
    selectedTagIdsRef,
    originalTagIdsRef,
    hasTagChanges,
    handleTagsChange,
    handleRemoveTag,
    setPlanTags,
  } = useInspectorTagState({ planId, planData: planData as Plan | undefined, isDraftMode });

  // --- サブフック: 時間・スケジュール状態 ---
  const {
    timeConflictError,
    titleRef,
    scheduleDate,
    startTime,
    endTime,
    reminderMinutes,
    handleScheduleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleReminderChange,
  } = useInspectorTimeState({
    plan,
    planId,
    isDraftMode,
    draftPlan,
    initialData: initialData ?? null,
    recurringEdit,
    addPendingChange,
    updateDraft,
    updatePlan,
  });

  // --- サブフック: 保存・閉じるロジック ---
  const { saveAndClose, cancelAndClose, hasPendingChanges } = useInspectorSaveClose({
    planId,
    hasTagChanges,
    selectedTagIdsRef,
    originalTagIdsRef,
    setPlanTags: setPlanTags as unknown as (planId: string, tagIds: string[]) => Promise<void>,
    updatePlan,
    closeInspector,
    pendingChanges: pendingChanges as Record<string, string | number | null | undefined> | null,
    clearPendingChanges,
  });

  // 繰り返しインスタンス対応のautoSave
  const autoSave = useCallback(
    async (field: string, value: string | undefined) => {
      const { draftPlan: currentDraft, planId: currentPlanId } = usePlanInspectorStore.getState();
      const currentIsDraftMode = currentDraft !== null && currentPlanId === null;

      if (currentIsDraftMode) {
        updateDraft({ [field]: value } as Partial<DraftPlan>);
        return;
      }

      if (
        currentPlanId &&
        IMMEDIATE_SAVE_FIELDS.includes(field as (typeof IMMEDIATE_SAVE_FIELDS)[number])
      ) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          updatePlan.mutate({ id: currentPlanId, data: { [field]: value } });
        }, 500);
        return;
      }

      if (
        recurringEdit.isRecurringInstance &&
        SCOPE_DIALOG_FIELDS.includes(field as (typeof SCOPE_DIALOG_FIELDS)[number])
      ) {
        recurringEdit.openScopeDialog(
          field as 'title' | 'description' | 'start_time' | 'end_time',
          value,
        );
        return;
      }
      addPendingChange({ [field]: value });
    },
    [addPendingChange, recurringEdit, updateDraft, updatePlan],
  );

  // Draft Record IDs state（ドラフトモードでの Record 紐付け用）
  const [draftRecordIds, setDraftRecordIds] = useState<string[]>([]);

  // ドラフトモード突入時に _linkedRecordIds + _linkRecordId をマージして初期化
  useEffect(() => {
    if (isDraftMode && draftPlan) {
      const ids = [...(draftPlan._linkedRecordIds ?? [])];
      if (draftPlan._linkRecordId && !ids.includes(draftPlan._linkRecordId)) {
        ids.push(draftPlan._linkRecordId);
      }
      setDraftRecordIds(ids);
    } else {
      setDraftRecordIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draftPlan は除外（更新の度に再実行しない）
  }, [isDraftMode]);

  const handleDraftRecordIdsChange = useCallback(
    (ids: string[]) => {
      setDraftRecordIds(ids);
      updateDraft({ _linkedRecordIds: ids });
    },
    [updateDraft],
  );

  // 繰り返しプラン削除確認ハンドラー
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      if (!planId || !instanceDate) return;

      try {
        await applyDelete({ scope, planId, instanceDate });
        closeInspector();
      } catch (err) {
        logger.error('Failed to delete recurring plan:', err);
      }
    },
    [planId, instanceDate, applyDelete, closeInspector],
  );

  const handleDelete = useCallback(() => {
    if (!planId) return;

    if (recurringEdit.isRecurringInstance) {
      openRecurringDialog(plan?.title ?? '', 'delete', handleRecurringDeleteConfirm);
      return;
    }

    openDeleteDialog(planId, plan?.title ?? null, async () => {
      await deletePlan.mutateAsync({ id: planId });
      closeInspector();
    });
  }, [
    planId,
    plan?.title,
    recurringEdit.isRecurringInstance,
    openDeleteDialog,
    openRecurringDialog,
    handleRecurringDeleteConfirm,
    deletePlan,
    closeInspector,
  ]);

  // Menu handlers
  const handleCopyId = useCallback(() => {
    if (planId) navigator.clipboard.writeText(planId);
  }, [planId]);

  const handleDuplicate = useCallback(() => {
    if (!plan || !('id' in plan)) return;

    closeInspector();

    setTimeout(() => {
      openInspectorWithDraft({
        title: `${plan.title} (copy)`,
        description: plan.description ?? null,
        start_time: plan.start_time ?? null,
        end_time: plan.end_time ?? null,
      });
    }, 100);
  }, [plan, closeInspector, openInspectorWithDraft]);

  return {
    // Store state
    planId,
    plan,
    closeInspector,
    saveAndClose,
    cancelAndClose,
    hasPendingChanges,
    isDraftMode,
    isSaving,

    // Navigation
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,

    // Tags state
    selectedTagIds,
    handleTagsChange,
    handleRemoveTag,

    // Draft Record IDs（ドラフトモードでの Record 紐付け用）
    draftRecordIds,
    handleDraftRecordIdsChange,

    // Form state
    titleRef,
    scheduleDate,
    startTime,
    endTime,
    reminderMinutes,
    handleReminderChange,
    timeConflictError,

    // Form handlers
    handleScheduleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    autoSave,
    updatePlan,

    // Menu handlers
    handleDelete,
    handleCopyId,
    handleDuplicate,
    // Cache
    getCache,
  };
}
