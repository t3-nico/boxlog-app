'use client';

/**
 * PlanInspectorContent のロジックを管理するカスタムフック
 */

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import useCalendarToast from '@/features/calendar/lib/toast';
import { parseDateString, parseDatetimeString } from '@/features/calendar/utils/dateUtils';
import type { InspectorDisplayMode } from '@/features/inspector';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { api } from '@/lib/trpc';

import type { RecurringEditScope } from '../../../components/RecurringEditConfirmDialog';
import { usePlan } from '../../../hooks/usePlan';
import { usePlanInstanceMutations } from '../../../hooks/usePlanInstances';
import { usePlanTags } from '../../../hooks/usePlanTags';
import { useDeleteConfirmStore } from '../../../stores/useDeleteConfirmStore';
import { usePlanCacheStore } from '../../../stores/usePlanCacheStore';
import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '../../../stores/useRecurringEditConfirmStore';
import type { Plan } from '../../../types/plan';
import { useInspectorAutoSave, useInspectorNavigation, useRecurringPlanEdit } from '../hooks';

// スコープダイアログを表示するフィールド（日付・時間）
// title/descriptionは即座に保存（Googleカレンダー準拠）
const SCOPE_DIALOG_FIELDS = ['due_date', 'start_time', 'end_time'] as const;

export function usePlanInspectorContentLogic() {
  const t = useTranslations();
  const utils = api.useUtils();
  const calendarToast = useCalendarToast();
  const { error: hapticError } = useHapticFeedback();

  // 時間重複エラー状態（視覚的フィードバック用）
  const [timeConflictError, setTimeConflictError] = useState(false);

  const planId = usePlanInspectorStore((state) => state.planId);
  const instanceDate = usePlanInspectorStore((state) => state.instanceDate);
  const initialData = usePlanInspectorStore((state) => state.initialData);
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector);
  const displayMode = usePlanInspectorStore((state) => state.displayMode) as InspectorDisplayMode;
  const setDisplayMode = usePlanInspectorStore((state) => state.setDisplayMode);

  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const openRecurringDialog = useRecurringEditConfirmStore((state) => state.openDialog);
  const getCache = usePlanCacheStore((state) => state.getCache);
  const { createInstance } = usePlanInstanceMutations();

  // Inspectorマウント時にグローバルダイアログをリセット
  // （ドラッグ操作で開いたダイアログが残っている場合があるため）
  // 次のティックで閉じることで、他の操作より後に実行されることを保証
  useEffect(() => {
    const { closeDialog } = useRecurringEditConfirmStore.getState();
    closeDialog();
    // 念のため遅延しても閉じる（タイミング問題対策）
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

  const { data: planData } = usePlan(planId!, { includeTags: true, enabled: !!planId });
  const plan = (planData ?? null) as unknown as Plan | null;

  // 繰り返しプラン編集フック
  const recurringEdit = useRecurringPlanEdit({
    plan,
    planId,
    instanceDate,
  });

  // 時間重複チェック関数
  const checkTimeOverlap = useCallback(
    (newStartTime: Date, newEndTime: Date): boolean => {
      if (!planId) return false;

      // キャッシュからプラン一覧を取得
      const plans = utils.plans.list.getData();
      if (!plans || plans.length === 0) return false;

      // 自分以外のプランとの重複をチェック
      return plans.some((p) => {
        if (p.id === planId) return false;
        if (!p.start_time || !p.end_time) return false;

        const pStart = new Date(p.start_time);
        const pEnd = new Date(p.end_time);

        // 時間重複条件: 既存の開始 < 新規の終了 AND 既存の終了 > 新規の開始
        return pStart < newEndTime && pEnd > newStartTime;
      });
    },
    [planId, utils.plans.list],
  );

  // Custom hooks
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId);
  const { autoSave: baseAutoSave, updatePlan, deletePlan } = useInspectorAutoSave({ planId, plan });

  // 繰り返しインスタンス対応のautoSave
  // 時間変更の場合のみスコープダイアログを表示
  const autoSave = useCallback(
    (field: string, value: string | undefined) => {
      // 繰り返しインスタンスの場合、時間フィールドはスコープダイアログを表示
      if (
        recurringEdit.isRecurringInstance &&
        SCOPE_DIALOG_FIELDS.includes(field as (typeof SCOPE_DIALOG_FIELDS)[number])
      ) {
        recurringEdit.openScopeDialog(field, value);
        return;
      }
      // 通常の保存処理（title, descriptionなど）
      baseAutoSave(field, value);
    },
    [baseAutoSave, recurringEdit],
  );

  // Activity state
  const [activityOrder, setActivityOrder] = useState<'asc' | 'desc'>('desc');
  const [isHoveringSort, setIsHoveringSort] = useState(false);
  const sortButtonRef = useRef<HTMLSpanElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const selectedTagIdsRef = useRef<string[]>(selectedTagIds);
  const { addPlanTag, removePlanTag } = usePlanTags();

  // UI state
  const titleRef = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderType, setReminderType] = useState<string>('');

  // Sync tags from plan data
  useEffect(() => {
    if (planData && 'tags' in planData) {
      const tagIds = (planData.tags as Array<{ id: string }>).map((tag) => tag.id);
      setSelectedTagIds(tagIds);
    } else {
      setSelectedTagIds([]);
    }
  }, [planData]);

  // Keep ref in sync
  useEffect(() => {
    selectedTagIdsRef.current = selectedTagIds;
  }, [selectedTagIds]);

  // Initialize state from plan data
  useEffect(() => {
    if (plan && 'id' in plan) {
      setSelectedDate(plan.due_date ? parseDateString(plan.due_date) : undefined);

      if (plan.start_time) {
        const date = parseDatetimeString(plan.start_time);
        setStartTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setStartTime('');
      }

      if (plan.end_time) {
        const date = parseDatetimeString(plan.end_time);
        setEndTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setEndTime('');
      }

      if ('reminder_minutes' in plan && plan.reminder_minutes !== null) {
        const minutes = plan.reminder_minutes;
        const reminderMap: Record<number, string> = {
          0: '開始時刻',
          10: '10分前',
          30: '30分前',
          60: '1時間前',
          1440: '1日前',
          10080: '1週間前',
        };
        setReminderType(reminderMap[minutes] || 'カスタム');
      } else {
        setReminderType('');
      }
    } else if (!plan && initialData) {
      if (initialData.start_time) {
        const startDate = new Date(initialData.start_time);
        setSelectedDate(startDate);
        setStartTime(
          `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
        );
      }
      if (initialData.end_time) {
        const endDate = new Date(initialData.end_time);
        setEndTime(
          `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
        );
      }
    } else if (!plan && !initialData) {
      setSelectedDate(undefined);
      setStartTime('');
      setEndTime('');
      setReminderType('');
    }
  }, [plan, initialData]);

  // Focus title on open
  useEffect(() => {
    if (titleRef.current) {
      const timer = setTimeout(() => {
        titleRef.current?.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        if (selection && titleRef.current) {
          range.selectNodeContents(titleRef.current);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [planId]);

  // Adjust description height
  useEffect(() => {
    if (descriptionRef.current && plan) {
      const textarea = descriptionRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 96);
      textarea.style.height = `${newHeight}px`;
    }
  }, [plan]);

  // Handlers
  const handleTagsChange = useCallback(
    async (newTagIds: string[]) => {
      if (!planId) return;

      const oldTagIds = selectedTagIdsRef.current;
      const added = newTagIds.filter((id) => !oldTagIds.includes(id));
      const removed = oldTagIds.filter((id) => !newTagIds.includes(id));

      if (added.length === 0 && removed.length === 0) return;

      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;

      try {
        for (const tagId of added) {
          await addPlanTag(planId, tagId);
        }
        for (const tagId of removed) {
          await removePlanTag(planId, tagId);
        }
      } catch (error) {
        console.error('Failed to update tags:', error);
        setSelectedTagIds(oldTagIds);
        selectedTagIdsRef.current = oldTagIds;
      }
    },
    [planId, addPlanTag, removePlanTag],
  );

  const handleRemoveTag = useCallback(
    async (tagId: string) => {
      if (!planId) return;

      const oldTagIds = selectedTagIdsRef.current;
      const newTagIds = oldTagIds.filter((id) => id !== tagId);

      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;

      try {
        await removePlanTag(planId, tagId);
      } catch (error) {
        console.error('Failed to remove tag:', error);
        setSelectedTagIds(oldTagIds);
        selectedTagIdsRef.current = oldTagIds;
      }
    },
    [planId, removePlanTag],
  );

  // 繰り返しプラン削除確認ハンドラー（ダイアログのコールバック）
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      if (!planId || !instanceDate) return;

      try {
        switch (scope) {
          case 'this':
            // この日のみ例外として削除（cancelled例外を作成）
            await createInstance.mutateAsync({
              planId,
              instanceDate,
              exceptionType: 'cancelled',
            });
            break;

          case 'thisAndFuture': {
            // この日以降を終了: 親プランの recurrence_end_date を更新
            // 前日を終了日にする（この日は含めない）
            const endDate = new Date(instanceDate);
            endDate.setDate(endDate.getDate() - 1);
            await updatePlan.mutateAsync({
              id: planId,
              data: {
                recurrence_end_date: endDate.toISOString().slice(0, 10),
              },
            });
            break;
          }

          case 'all':
            // 親プラン自体を削除
            await deletePlan.mutateAsync({ id: planId });
            break;
        }
        closeInspector();
      } catch (err) {
        console.error('Failed to delete recurring plan:', err);
      }
    },
    [planId, instanceDate, createInstance, updatePlan, deletePlan, closeInspector],
  );

  const handleDelete = useCallback(() => {
    if (!planId) return;

    // 繰り返しインスタンスの場合はスコープ選択ダイアログを表示
    if (recurringEdit.isRecurringInstance) {
      openRecurringDialog(plan?.title ?? '', 'delete', handleRecurringDeleteConfirm);
      return;
    }

    // 通常プラン: カスタム削除確認ダイアログを使用
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

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      autoSave('due_date', date ? format(date, 'yyyy-MM-dd') : undefined);
    },
    [autoSave],
  );

  const handleStartTimeChange = useCallback(
    (time: string) => {
      if (time && selectedDate && endTime) {
        // 新しい開始時刻を計算
        const [hours, minutes] = time.split(':').map(Number);
        const newStartDateTime = new Date(selectedDate);
        newStartDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);

        // 現在の終了時刻を取得
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const endDateTime = new Date(selectedDate);
        endDateTime.setHours(endHours ?? 0, endMinutes ?? 0, 0, 0);

        // 事前重複チェック
        if (checkTimeOverlap(newStartDateTime, endDateTime)) {
          // GAFA基準のフィードバック: ハプティック + トースト + 視覚的FB
          hapticError();
          calendarToast.error(t('calendar.toast.conflict'), {
            description: t('calendar.toast.conflictDescription'),
          });
          setTimeConflictError(true);
          setTimeout(() => setTimeConflictError(false), 500); // シェイクアニメーション後にリセット
          return; // 更新をキャンセル
        }

        setStartTime(time);
        autoSave('start_time', newStartDateTime.toISOString());
      } else if (time && selectedDate) {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        setStartTime(time);
        autoSave('start_time', dateTime.toISOString());
      } else {
        setStartTime(time);
        autoSave('start_time', undefined);
      }
    },
    [selectedDate, endTime, autoSave, checkTimeOverlap, hapticError, calendarToast, t],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      if (time && selectedDate && startTime) {
        // 現在の開始時刻を取得
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const startDateTime = new Date(selectedDate);
        startDateTime.setHours(startHours ?? 0, startMinutes ?? 0, 0, 0);

        // 新しい終了時刻を計算
        const [hours, minutes] = time.split(':').map(Number);
        const newEndDateTime = new Date(selectedDate);
        newEndDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);

        // 事前重複チェック
        if (checkTimeOverlap(startDateTime, newEndDateTime)) {
          // GAFA基準のフィードバック: ハプティック + トースト + 視覚的FB
          hapticError();
          calendarToast.error(t('calendar.toast.conflict'), {
            description: t('calendar.toast.conflictDescription'),
          });
          setTimeConflictError(true);
          setTimeout(() => setTimeConflictError(false), 500); // シェイクアニメーション後にリセット
          return; // 更新をキャンセル
        }

        setEndTime(time);
        autoSave('end_time', newEndDateTime.toISOString());
      } else if (time && selectedDate) {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        setEndTime(time);
        autoSave('end_time', dateTime.toISOString());
      } else {
        setEndTime(time);
        autoSave('end_time', undefined);
      }
    },
    [selectedDate, startTime, autoSave, checkTimeOverlap, hapticError, calendarToast, t],
  );

  // Menu handlers
  const handleCopyId = useCallback(() => {
    if (planId) navigator.clipboard.writeText(planId);
  }, [planId]);

  const handleOpenInNewTab = useCallback(() => {
    if (planId) window.open(`/plans/${planId}`, '_blank');
  }, [planId]);

  const handleDuplicate = useCallback(() => {
    // Stub: 複製機能は未実装
  }, []);

  const handleCopyLink = useCallback(() => {
    if (planId) {
      const url = `${window.location.origin}/plans/${planId}`;
      navigator.clipboard.writeText(url);
    }
  }, [planId]);

  const handleSaveAsTemplate = useCallback(() => {
    // Stub: テンプレート保存機能は未実装
  }, []);

  return {
    // Store state
    planId,
    plan,
    displayMode,
    setDisplayMode,
    closeInspector,

    // Navigation
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,

    // Activity state
    activityOrder,
    setActivityOrder,
    isHoveringSort,
    setIsHoveringSort,
    sortButtonRef,
    tooltipPosition,
    setTooltipPosition,

    // Tags state
    selectedTagIds,
    handleTagsChange,
    handleRemoveTag,

    // Form state
    titleRef,
    selectedDate,
    startTime,
    endTime,
    reminderType,
    setReminderType,
    timeConflictError,

    // Form handlers
    handleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    autoSave,
    updatePlan,

    // Menu handlers
    handleDelete,
    handleCopyId,
    handleOpenInNewTab,
    handleDuplicate,
    handleCopyLink,
    handleSaveAsTemplate,

    // Cache
    getCache,
  };
}
