'use client';

/**
 * PlanInspectorContent のロジックを管理するカスタムフック（オーケストレーション）
 *
 * 責務を3つのサブフックに分割:
 * - useInspectorTagState: タグ状態管理
 * - useInspectorTimeState: 時間・スケジュール状態管理
 * - useInspectorSaveClose: 保存・閉じるロジック
 *
 * ドラフトモードなし（即DB保存 + edit mode）。
 */

import { useCallback, useEffect, useRef } from 'react';

import type { EntryWithTags } from '@/core/types/entry';
import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useRecurringScopeMutations } from '@/hooks/useRecurringScopeMutations';
import { logger } from '@/lib/logger';
import { useEntryCacheStore } from '@/stores/useEntryCacheStore';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';
import {
  closeModal,
  openDeleteConfirm,
  openRecurringEditConfirm,
  useModalStore,
  type RecurringEditScope,
} from '@/stores/useModalStore';
import { usePlan } from '../../../hooks/usePlan';
import { useInspectorAutoSave, useInspectorNavigation, useRecurringPlanEdit } from '../hooks';
import { useInspectorSaveClose } from './useInspectorSaveClose';
import { useInspectorTagState } from './useInspectorTagState';
import { useInspectorTimeState } from './useInspectorTimeState';

// スコープダイアログを表示するフィールド（日付・時間）
// title/descriptionは即座に保存（Googleカレンダー準拠）
const SCOPE_DIALOG_FIELDS = ['start_time', 'end_time'] as const;

// 即座にDB保存するフィールド（title/description）
const IMMEDIATE_SAVE_FIELDS = ['title', 'description'] as const;

export function usePlanInspectorContentLogic() {
  // 自動保存デバウンス用タイマー（Activityノイズ防止）
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entryId = useEntryInspectorStore((state) => state.entryId);
  const instanceDate = useEntryInspectorStore((state) => state.instanceDate);
  const closeInspector = useEntryInspectorStore((state) => state.closeInspector);
  const addPendingChange = useEntryInspectorStore((state) => state.addPendingChange);
  const clearPendingChanges = useEntryInspectorStore((state) => state.clearPendingChanges);
  const pendingChanges = useEntryInspectorStore((state) => state.pendingChanges);

  const getCache = useEntryCacheStore((state) => state.getCache);
  const { applyDelete } = useRecurringScopeMutations();
  const { createEntry } = useEntryMutations();

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

  // 未保存の変更がある場合、beforeunload警告を表示
  useEffect(() => {
    if (!pendingChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pendingChanges]);

  const { data: planData } = usePlan(entryId!, {
    includeTags: true,
    enabled: !!entryId,
  });

  const plan: EntryWithTags | null = (planData ?? null) as EntryWithTags | null;

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
    planData: planData as EntryWithTags | undefined,
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
    recurringEdit,
    addPendingChange,
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
      const currentEntryId = useEntryInspectorStore.getState().entryId;

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
    [addPendingChange, recurringEdit, updatePlan],
  );

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

  const handleDuplicate = useCallback(async () => {
    if (!plan || !('id' in plan)) return;

    try {
      const result = await createEntry.mutateAsync({
        title: plan.title,
        description: plan.description ?? undefined,
        start_time: plan.start_time ?? undefined,
        end_time: plan.end_time ?? undefined,
      });
      if (result?.id) {
        closeInspector();
        setTimeout(() => {
          useEntryInspectorStore.getState().openInspector(result.id);
        }, 100);
      }
    } catch {
      logger.error('Failed to duplicate entry');
    }
  }, [plan, createEntry, closeInspector]);

  return {
    // Store state
    planId: entryId,
    plan,
    closeInspector,
    saveAndClose,
    cancelAndClose,
    hasPendingChanges,

    // Navigation
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,

    // Tags state
    selectedTagId,
    handleTagChange,

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
