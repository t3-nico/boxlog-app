'use client';

/**
 * EntryInspectorContent のロジックを管理するカスタムフック（オーケストレーション）
 *
 * 責務を3つのサブフックに分割:
 * - useInspectorTagState: タグ状態管理
 * - useInspectorTimeState: 時間・スケジュール状態管理（デバウンス即時保存）
 * - useInspectorSaveClose: 閉じるロジック（タグ保存のみ）
 *
 * 全フィールドはデバウンス即時保存。pendingChangesバッファなし。
 */

import { useCallback, useEffect, useRef } from 'react';

import type { EntryWithTags } from '@/core/types/entry';
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
import { useEntry } from '../../../hooks/useEntry';
import { useInspectorAutoSave, useInspectorNavigation, useRecurringEntryEdit } from '../hooks';
import { useInspectorSaveClose } from './useInspectorSaveClose';
import { useInspectorTagState } from './useInspectorTagState';
import { useInspectorTimeState } from './useInspectorTimeState';

// 繰り返しインスタンスでスコープダイアログを表示するフィールド
const SCOPE_DIALOG_FIELDS = ['start_time', 'end_time'] as const;

export function useEntryInspectorContentLogic() {
  // title/description のデバウンス保存用タイマー
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entryId = useEntryInspectorStore((state) => state.entryId);
  const instanceDate = useEntryInspectorStore((state) => state.instanceDate);
  const closeInspector = useEntryInspectorStore((state) => state.closeInspector);

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

  const { data: planData } = useEntry(entryId!, {
    includeTags: true,
    enabled: !!entryId,
  });

  const plan: EntryWithTags | null = (planData ?? null) as EntryWithTags | null;

  // 繰り返しプラン編集フック
  const recurringEdit = useRecurringEntryEdit({
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
    setEntryTags,
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
    updatePlan,
  });

  // --- サブフック: 閉じるロジック ---
  const { saveAndClose, cancelAndClose, hasPendingChanges } = useInspectorSaveClose({
    planId: entryId,
    hasTagChanges,
    selectedTagIdRef,
    originalTagIdRef,
    setEntryTags: setEntryTags as unknown as (planId: string, tagIds: string[]) => Promise<void>,
    closeInspector,
    timeConflictError,
  });

  // デバウンス即時保存（title/description用 + 繰り返しインスタンスのスコープダイアログ）
  const autoSave = useCallback(
    (field: string, value: string | undefined) => {
      const currentEntryId = useEntryInspectorStore.getState().entryId;

      // 繰り返しインスタンスの時間フィールド → スコープダイアログ
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

      // 全フィールド共通: デバウンス500msで即時保存
      if (currentEntryId) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          updatePlan.mutate({ id: currentEntryId, data: { [field]: value } });
        }, 500);
      }
    },
    [recurringEdit, updatePlan],
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
    // Cache
    getCache,
  };
}
