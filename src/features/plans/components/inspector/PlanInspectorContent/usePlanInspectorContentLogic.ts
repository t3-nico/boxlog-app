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
import { usePlanMutations } from '../../../hooks/usePlanMutations';
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
  const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
  const clearDraft = usePlanInspectorStore((state) => state.clearDraft);
  const updateDraft = usePlanInspectorStore((state) => state.updateDraft);
  const openInspector = usePlanInspectorStore((state) => state.openInspector);

  // ドラフトモード判定: draftPlanがあり、planIdがない場合
  const isDraftMode = draftPlan !== null && planId === null;

  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const openRecurringDialog = useRecurringEditConfirmStore((state) => state.openDialog);
  const getCache = usePlanCacheStore((state) => state.getCache);
  const { createInstance } = usePlanInstanceMutations();
  const { createPlan } = usePlanMutations();

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

  // ドラフトモード用の初回保存（DBに新規作成）
  const saveDraftToDb = useCallback(
    async (field: string, value: string | undefined): Promise<string | null> => {
      if (!draftPlan) return null;

      try {
        // ドラフトデータに変更を適用してDB保存
        // description は null を undefined に変換（API仕様に合わせる）
        // タイトルが空の場合も空のまま保存（Google Calendar準拠）
        const planData = {
          title: draftPlan.title.trim(),
          description: draftPlan.description ?? undefined,
          status: 'open' as const,
          due_date: draftPlan.due_date,
          start_time: draftPlan.start_time,
          end_time: draftPlan.end_time,
          [field]: value,
        };

        const newPlan = await createPlan.mutateAsync(planData);

        if (newPlan?.id) {
          // ドラフトをクリアして通常モードに切り替え
          clearDraft();
          openInspector(newPlan.id);
          // カレンダーのドラッグ選択をクリア（保存成功後）
          window.dispatchEvent(new CustomEvent('calendar-drag-cancel'));
          return newPlan.id;
        }
        return null;
      } catch (error) {
        console.error('Failed to create plan from draft:', error);
        return null;
      }
    },
    [draftPlan, createPlan, clearDraft, openInspector],
  );

  // 繰り返しインスタンス対応のautoSave
  // 時間変更の場合のみスコープダイアログを表示
  const autoSave = useCallback(
    async (field: string, value: string | undefined) => {
      // ドラフトモードの場合
      if (isDraftMode) {
        // タイトルを判定（今回の変更がtitleならその値、それ以外ならdraftPlanのtitle）
        const effectiveTitle = field === 'title' ? value : draftPlan?.title;
        const hasTitle = effectiveTitle && effectiveTitle.trim() !== '';

        // タイトルがなければドラフトをローカル更新のみ（DBには保存しない）
        if (!hasTitle) {
          // タイトル以外のフィールド変更はドラフトに保持
          if (field !== 'title' && field !== 'description') {
            updateDraft({ [field]: value } as Partial<typeof draftPlan>);
          }
          return;
        }

        // タイトルがあればDBに保存
        await saveDraftToDb(field, value);
        return;
      }

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
    [baseAutoSave, recurringEdit, isDraftMode, saveDraftToDb, draftPlan, updateDraft],
  );

  // Activity state
  const [activityOrder, setActivityOrder] = useState<'asc' | 'desc'>('desc');
  const [isHoveringSort, setIsHoveringSort] = useState(false);
  const sortButtonRef = useRef<HTMLSpanElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const selectedTagIdsRef = useRef<string[]>(selectedTagIds);
  // Flag to prevent server sync from overwriting optimistic updates during mutations
  const isTagMutationInProgressRef = useRef(false);
  const { setplanTags, removePlanTag } = usePlanTags();

  // UI state
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(); // スケジュール日（start_time/end_time用）
  const [dueDate, setDueDate] = useState<Date | undefined>(); // 期限日（due_date用）
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderType, setReminderType] = useState<string>('');

  // Sync tags from plan data (skip when mutation is in progress to preserve optimistic updates)
  useEffect(() => {
    // Skip sync if user has pending tag changes - prevents race condition
    // where refetch returns stale data before server processes all mutations
    if (isTagMutationInProgressRef.current) {
      return;
    }
    // データ未ロード時は何もしない（空配列をセットしない）
    // これにより、ローディング中にタグが消えるのを防ぐ
    if (planData === undefined) {
      return;
    }
    if (planData && 'tagIds' in planData && Array.isArray(planData.tagIds)) {
      setSelectedTagIds(planData.tagIds);
      selectedTagIdsRef.current = planData.tagIds;
    } else if (planData) {
      // planDataがnullの場合（存在しないプラン）のみ空にする
      setSelectedTagIds([]);
      selectedTagIdsRef.current = [];
    }
  }, [planData]);

  // Keep ref in sync
  useEffect(() => {
    selectedTagIdsRef.current = selectedTagIds;
  }, [selectedTagIds]);

  // Initialize state from plan data or draftPlan
  useEffect(() => {
    // ドラフトモードの場合はdraftPlanから初期化
    if (isDraftMode && draftPlan) {
      setDueDate(draftPlan.due_date ? parseDateString(draftPlan.due_date) : undefined);

      if (draftPlan.start_time) {
        const date = parseDatetimeString(draftPlan.start_time);
        setScheduleDate(date);
        setStartTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setScheduleDate(undefined);
        setStartTime('');
      }

      if (draftPlan.end_time) {
        const date = parseDatetimeString(draftPlan.end_time);
        setEndTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setEndTime('');
      }

      setReminderType('');
      return;
    }

    if (plan && 'id' in plan) {
      // 期限日（due_date）を設定
      setDueDate(plan.due_date ? parseDateString(plan.due_date) : undefined);

      // スケジュール日と時間を設定
      if (plan.start_time) {
        const date = parseDatetimeString(plan.start_time);
        setScheduleDate(date); // スケジュール日はstart_timeから取得
        setStartTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setScheduleDate(undefined);
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
        setScheduleDate(startDate);
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
      setScheduleDate(undefined);
      setDueDate(undefined);
      setStartTime('');
      setEndTime('');
      setReminderType('');
    }
  }, [plan, initialData, isDraftMode, draftPlan]);

  // Focus title on open
  useEffect(() => {
    if (titleRef.current) {
      const timer = setTimeout(() => {
        titleRef.current?.focus();
        titleRef.current?.select(); // input要素の全選択
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

      // 変更がない場合は何もしない
      if (
        newTagIds.length === oldTagIds.length &&
        newTagIds.every((id) => oldTagIds.includes(id))
      ) {
        return;
      }

      // Set flag to prevent server sync from overwriting optimistic updates
      isTagMutationInProgressRef.current = true;

      // ローカル状態を即座に更新（楽観的UI）
      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;

      try {
        // 一括設定API（setTags）を使用して安定した更新を実現
        await setplanTags(planId, newTagIds);
      } catch (error) {
        console.error('Failed to update tags:', error);
        // エラー時はロールバック
        setSelectedTagIds(oldTagIds);
        selectedTagIdsRef.current = oldTagIds;
      } finally {
        // Clear flag after mutation settles (small delay to handle any pending refetch)
        setTimeout(() => {
          isTagMutationInProgressRef.current = false;
        }, 100);
      }
    },
    [planId, setplanTags],
  );

  const handleRemoveTag = useCallback(
    async (tagId: string) => {
      if (!planId) return;

      const oldTagIds = selectedTagIdsRef.current;
      const newTagIds = oldTagIds.filter((id) => id !== tagId);

      // Set flag to prevent server sync from overwriting optimistic updates
      isTagMutationInProgressRef.current = true;

      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;

      try {
        await removePlanTag(planId, tagId);
      } catch (error) {
        console.error('Failed to remove tag:', error);
        setSelectedTagIds(oldTagIds);
        selectedTagIdsRef.current = oldTagIds;
      } finally {
        // Clear flag after mutation settles
        setTimeout(() => {
          isTagMutationInProgressRef.current = false;
        }, 100);
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

  // スケジュール日変更ハンドラー（start_time/end_timeの日付部分）
  const handleScheduleDateChange = useCallback(
    (date: Date | undefined) => {
      setScheduleDate(date);
      // スケジュール日が変更されたら、start_time/end_timeの日付部分を更新
      if (date && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const newStartDateTime = new Date(date);
        newStartDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        autoSave('start_time', newStartDateTime.toISOString());
      }
      if (date && endTime) {
        const [hours, minutes] = endTime.split(':').map(Number);
        const newEndDateTime = new Date(date);
        newEndDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        autoSave('end_time', newEndDateTime.toISOString());
      }
    },
    [autoSave, startTime, endTime],
  );

  // 期限日変更ハンドラー（due_date）
  const handleDueDateChange = useCallback(
    (date: Date | undefined) => {
      setDueDate(date);
      autoSave('due_date', date ? format(date, 'yyyy-MM-dd') : undefined);
    },
    [autoSave],
  );

  const handleStartTimeChange = useCallback(
    (time: string) => {
      if (time && scheduleDate && endTime) {
        // 新しい開始時刻を計算
        const [hours, minutes] = time.split(':').map(Number);
        const newStartDateTime = new Date(scheduleDate);
        newStartDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);

        // 現在の終了時刻を取得
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const endDateTime = new Date(scheduleDate);
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
      } else if (time && scheduleDate) {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(scheduleDate);
        dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        setStartTime(time);
        autoSave('start_time', dateTime.toISOString());
      } else {
        setStartTime(time);
        autoSave('start_time', undefined);
      }
    },
    [scheduleDate, endTime, autoSave, checkTimeOverlap, hapticError, calendarToast, t],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      if (time && scheduleDate && startTime) {
        // 現在の開始時刻を取得
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const startDateTime = new Date(scheduleDate);
        startDateTime.setHours(startHours ?? 0, startMinutes ?? 0, 0, 0);

        // 新しい終了時刻を計算
        const [hours, minutes] = time.split(':').map(Number);
        const newEndDateTime = new Date(scheduleDate);
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
      } else if (time && scheduleDate) {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(scheduleDate);
        dateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        setEndTime(time);
        autoSave('end_time', dateTime.toISOString());
      } else {
        setEndTime(time);
        autoSave('end_time', undefined);
      }
    },
    [scheduleDate, startTime, autoSave, checkTimeOverlap, hapticError, calendarToast, t],
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
    isDraftMode,

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
    scheduleDate, // スケジュール日（カレンダー配置用）
    dueDate, // 期限日
    startTime,
    endTime,
    reminderType,
    setReminderType,
    timeConflictError,

    // Form handlers
    handleScheduleDateChange, // スケジュール日変更
    handleDueDateChange, // 期限日変更
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
