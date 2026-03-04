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

import { useRecurringScopeMutations } from '@/hooks/useRecurringScopeMutations';
import { logger } from '@/lib/logger';
import { useEntryCacheStore } from '@/stores/useEntryCacheStore';
import { useEntryInspectorStore, type DraftEntry } from '@/stores/useEntryInspectorStore';
import {
  closeModal,
  openDeleteConfirm,
  openRecurringEditConfirm,
  useModalStore,
  type RecurringEditScope,
} from '@/stores/useModalStore';
import { usePlan } from '../../../hooks/usePlan';
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

  const entryId = useEntryInspectorStore((state) => state.entryId);
  const instanceDate = useEntryInspectorStore((state) => state.instanceDate);
  const initialData = useEntryInspectorStore((state) => state.initialData);
  const closeInspector = useEntryInspectorStore((state) => state.closeInspector);
  const openInspectorWithDraft = useEntryInspectorStore((state) => state.openInspectorWithDraft);
  const draftEntry = useEntryInspectorStore((state) => state.draftEntry);
  const updateDraft = useEntryInspectorStore((state) => state.updateDraft);
  const addPendingChange = useEntryInspectorStore((state) => state.addPendingChange);
  const clearPendingChanges = useEntryInspectorStore((state) => state.clearPendingChanges);
  const pendingChanges = useEntryInspectorStore((state) => state.pendingChanges);

  // ドラフトモード判定: draftEntryがあり、entryIdがない場合
  const isDraftMode = draftEntry !== null && entryId === null;

  const getCache = useEntryCacheStore((state) => state.getCache);
  const { applyDelete } = useRecurringScopeMutations();

  // Inspectorマウント時にグローバルダイアログをリセット
  useEffect(() => {
    const modal = useModalStore.getState().modal;
    if (modal?.type === 'recurringEdit') closeModal();
    const timer = setTimeout(() => {
      const m = useModalStore.getState().modal;
      if (m?.type === 'recurringEdit') closeModal();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // entryIdが変わったときもリセット
  useEffect(() => {
    const modal = useModalStore.getState().modal;
    if (modal?.type === 'recurringEdit') closeModal();
    const timer = setTimeout(() => {
      const m = useModalStore.getState().modal;
      if (m?.type === 'recurringEdit') closeModal();
    }, 50);
    return () => clearTimeout(timer);
  }, [entryId]);

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

  const { data: planData } = usePlan(entryId!, {
    includeTags: true,
    enabled: !!entryId && !isDraftMode,
  });

  // ドラフトモードの場合はdraftEntryを使用、それ以外はfetchしたplanDataを使用
  const plan = isDraftMode
    ? (draftEntry as unknown as Plan | null)
    : ((planData ?? null) as unknown as Plan | null);

  // 繰り返しプラン編集フック
  const recurringEdit = useRecurringPlanEdit({
    plan,
    planId: entryId,
    instanceDate,
  });

  // Custom hooks
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(entryId);
  const { updatePlan, deletePlan } = useInspectorAutoSave({ planId: entryId, plan });

  // --- サブフック: タグ状態 ---
  const {
    selectedTagId,
    selectedTagIdRef,
    originalTagIdRef,
    hasTagChanges,
    handleTagChange,
    setPlanTags,
  } = useInspectorTagState({
    planId: entryId,
    planData: planData as Plan | undefined,
    isDraftMode,
  });

  // --- サブフック: 時間・スケジュール状態 ---
  const {
    timeConflictError,
    titleRef,
    scheduleDate,
    startTime,
    endTime,
    reminderMinutes,
    actualStartTime,
    actualEndTime,
    handleScheduleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleReminderChange,
    handleActualStartChange,
    handleActualEndChange,
  } = useInspectorTimeState({
    plan,
    planId: entryId,
    isDraftMode,
    draftPlan: draftEntry,
    initialData: initialData ?? null,
    recurringEdit,
    addPendingChange,
    updateDraft,
    updatePlan,
  });

  // --- サブフック: 保存・閉じるロジック ---
  const { saveAndClose, cancelAndClose, hasPendingChanges } = useInspectorSaveClose({
    planId: entryId,
    hasTagChanges,
    selectedTagIdRef,
    originalTagIdRef,
    setPlanTags: setPlanTags as unknown as (planId: string, tagIds: string[]) => Promise<void>,
    updatePlan,
    closeInspector,
    pendingChanges: pendingChanges as Record<string, string | number | null | undefined> | null,
    clearPendingChanges,
  });

  // 繰り返しインスタンス対応のautoSave
  const autoSave = useCallback(
    async (field: string, value: string | undefined) => {
      const { draftEntry: currentDraft, entryId: currentEntryId } =
        useEntryInspectorStore.getState();
      const currentIsDraftMode = currentDraft !== null && currentEntryId === null;

      if (currentIsDraftMode) {
        updateDraft({ [field]: value } as Partial<DraftEntry>);
        return;
      }

      if (
        currentEntryId &&
        IMMEDIATE_SAVE_FIELDS.includes(field as (typeof IMMEDIATE_SAVE_FIELDS)[number])
      ) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          updatePlan.mutate({ id: currentEntryId, data: { [field]: value } });
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

  // ドラフトモード突入時に初期化
  useEffect(() => {
    if (isDraftMode) {
      setDraftRecordIds([]);
    } else {
      setDraftRecordIds([]);
    }
  }, [isDraftMode]);

  const handleDraftRecordIdsChange = useCallback((ids: string[]) => {
    setDraftRecordIds(ids);
  }, []);

  // 繰り返しプラン削除確認ハンドラー
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      if (!entryId || !instanceDate) return;

      try {
        await applyDelete({ scope, planId: entryId, instanceDate });
        closeInspector();
      } catch (err) {
        logger.error('Failed to delete recurring plan:', err);
      }
    },
    [entryId, instanceDate, applyDelete, closeInspector],
  );

  const handleDelete = useCallback(() => {
    if (!entryId) return;

    if (recurringEdit.isRecurringInstance) {
      openRecurringEditConfirm(plan?.title ?? '', 'delete', handleRecurringDeleteConfirm);
      return;
    }

    openDeleteConfirm(entryId, plan?.title ?? null, async () => {
      await deletePlan.mutateAsync({ id: entryId });
      closeInspector();
    });
  }, [
    entryId,
    plan?.title,
    recurringEdit.isRecurringInstance,
    handleRecurringDeleteConfirm,
    deletePlan,
    closeInspector,
  ]);

  // Menu handlers
  const handleCopyId = useCallback(() => {
    if (entryId) navigator.clipboard.writeText(entryId);
  }, [entryId]);

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
    planId: entryId,
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
    selectedTagId,
    handleTagChange,

    // Draft Record IDs（ドラフトモードでの Record 紐付け用）
    draftRecordIds,
    handleDraftRecordIdsChange,

    // Form state
    titleRef,
    scheduleDate,
    startTime,
    endTime,
    reminderMinutes,
    actualStartTime,
    actualEndTime,
    handleReminderChange,
    timeConflictError,

    // Form handlers
    handleScheduleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleActualStartChange,
    handleActualEndChange,
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
