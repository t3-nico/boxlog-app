'use client';

/**
 * PlanInspectorContent のロジックを管理するカスタムフック
 */

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  localTimeToUTCISO,
  parseDateString,
  parseDatetimeString,
  parseISOToUserTimezone,
} from '@/features/calendar/utils/dateUtils';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { api } from '@/lib/trpc';
import type { RecurringEditScope } from '../../../components/RecurringEditConfirmDialog';
import { usePlan } from '../../../hooks/usePlan';
import { usePlanInstanceMutations } from '../../../hooks/usePlanInstances';
import { usePlanMutations } from '../../../hooks/usePlanMutations';
import { usePlanTags } from '../../../hooks/usePlanTags';
import { useDeleteConfirmStore } from '../../../stores/useDeleteConfirmStore';
import { usePlanCacheStore } from '../../../stores/usePlanCacheStore';
import { usePlanInspectorStore, type DraftPlan } from '../../../stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '../../../stores/useRecurringEditConfirmStore';
import type { Plan } from '../../../types/plan';
import { minutesToReminderType } from '../../../utils/reminder';
import { useInspectorAutoSave, useInspectorNavigation, useRecurringPlanEdit } from '../hooks';

// スコープダイアログを表示するフィールド（日付・時間）
// title/descriptionは即座に保存（Googleカレンダー準拠）
const SCOPE_DIALOG_FIELDS = ['due_date', 'start_time', 'end_time'] as const;

export function usePlanInspectorContentLogic() {
  const utils = api.useUtils();
  const queryClient = useQueryClient();

  // ユーザーのタイムゾーン設定
  const timezone = useCalendarSettingsStore((state) => state.timezone);

  // 時間重複エラー状態（視覚的フィードバック用）
  const [timeConflictError, setTimeConflictError] = useState(false);

  const planId = usePlanInspectorStore((state) => state.planId);
  const instanceDate = usePlanInspectorStore((state) => state.instanceDate);
  const initialData = usePlanInspectorStore((state) => state.initialData);
  const closeInspector = usePlanInspectorStore((state) => state.closeInspector);
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);
  const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
  const clearDraft = usePlanInspectorStore((state) => state.clearDraft);
  const updateDraft = usePlanInspectorStore((state) => state.updateDraft);
  const addPendingChange = usePlanInspectorStore((state) => state.addPendingChange);
  const clearPendingChanges = usePlanInspectorStore((state) => state.clearPendingChanges);
  const pendingChanges = usePlanInspectorStore((state) => state.pendingChanges);

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

  // Custom hooks
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId);
  const { updatePlan, deletePlan } = useInspectorAutoSave({ planId, plan });

  // 繰り返しインスタンス対応のautoSave
  // 時間変更の場合のみスコープダイアログを表示
  const autoSave = useCallback(
    async (field: string, value: string | undefined) => {
      // ストアから最新の状態を取得（クロージャの古い値を避ける）
      const { draftPlan: currentDraft, planId: currentPlanId } = usePlanInspectorStore.getState();
      const currentIsDraftMode = currentDraft !== null && currentPlanId === null;

      // ドラフトモードの場合: ローカル更新のみ（DBには保存しない）
      // 保存は saveAndClose() で行う
      if (currentIsDraftMode) {
        updateDraft({ [field]: value } as Partial<DraftPlan>);
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
      // 通常の場合: pendingChanges にバッファリング（保存ボタンで一括保存）
      addPendingChange({ [field]: value });
    },
    [addPendingChange, recurringEdit, updateDraft],
  );

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const selectedTagIdsRef = useRef<string[]>(selectedTagIds);
  // 元のタグID（キャンセル時のロールバック用）
  const originalTagIdsRef = useRef<string[]>([]);
  // タグが変更されたか（保存時のチェック用 + UI更新用）
  const [hasTagChanges, setHasTagChanges] = useState(false);
  const { setplanTags } = usePlanTags();

  // UI state
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(); // スケジュール日（start_time/end_time用）
  const [dueDate, setDueDate] = useState<Date | undefined>(); // 期限日（due_date用）
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reminderType, setReminderType] = useState<string>('');

  // planIdが変わったらタグ選択をリセット（別のPlanを開いた時）
  useEffect(() => {
    // ドラフトモードでは何もしない
    if (isDraftMode) return;
    // 新しいplanIdが設定された時点で空配列にリセット
    // planDataがロードされたら正しいタグで上書きされる
    setSelectedTagIds([]);
    selectedTagIdsRef.current = [];
    originalTagIdsRef.current = [];
    setHasTagChanges(false);
  }, [planId, isDraftMode]);

  // Sync tags from plan data
  useEffect(() => {
    // タグ変更中はサーバーからの同期をスキップ（楽観的更新を保持）
    if (hasTagChanges) {
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
      originalTagIdsRef.current = planData.tagIds;
    } else if (planData) {
      // planDataがnullの場合（存在しないプラン）のみ空にする
      setSelectedTagIds([]);
      selectedTagIdsRef.current = [];
      originalTagIdsRef.current = [];
    }
  }, [planData, hasTagChanges]);

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

      // スケジュール日と時間を設定（タイムゾーン対応）
      if (plan.start_time) {
        const date = parseISOToUserTimezone(plan.start_time, timezone);
        setScheduleDate(date); // スケジュール日はstart_timeから取得
        setStartTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setScheduleDate(undefined);
        setStartTime('');
      }

      if (plan.end_time) {
        const date = parseISOToUserTimezone(plan.end_time, timezone);
        setEndTime(
          `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        );
      } else {
        setEndTime('');
      }

      if ('reminder_minutes' in plan && plan.reminder_minutes !== null) {
        setReminderType(minutesToReminderType(plan.reminder_minutes));
      } else {
        setReminderType('');
      }
    } else if (!plan && initialData) {
      if (initialData.start_time) {
        const startDate = parseISOToUserTimezone(initialData.start_time, timezone);
        setScheduleDate(startDate);
        setStartTime(
          `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
        );
      }
      if (initialData.end_time) {
        const endDate = parseISOToUserTimezone(initialData.end_time, timezone);
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
  }, [plan, initialData, isDraftMode, draftPlan, timezone]);

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

  /**
   * キャッシュのtagIdsを楽観的に更新（CalendarCard等での即時表示用）
   */
  const updateTagsInCache = useCallback(
    (targetPlanId: string, newTagIds: string[]) => {
      // plans.list のすべてのキャッシュを更新（CalendarCard用）
      // tRPC v11 のクエリキー形式: [procedurePath, { input, type }]
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const key = query.queryKey;
            return (
              Array.isArray(key) &&
              key.length >= 1 &&
              Array.isArray(key[0]) &&
              key[0][0] === 'plans' &&
              key[0][1] === 'list'
            );
          },
        },
        (oldData: unknown) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((plan: { id: string; tagIds?: string[] }) =>
            plan.id === targetPlanId ? { ...plan, tagIds: newTagIds } : plan,
          );
        },
      );

      // plans.getById のキャッシュを更新
      utils.plans.getById.setData({ id: targetPlanId }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tagIds: newTagIds };
      });
      utils.plans.getById.setData({ id: targetPlanId, include: { tags: true } }, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, tagIds: newTagIds };
      });
    },
    [queryClient, utils.plans.getById],
  );

  // Handlers
  const handleTagsChange = useCallback(
    (newTagIds: string[]) => {
      if (!planId) return;

      const oldTagIds = selectedTagIdsRef.current;

      // 変更がない場合は何もしない
      if (
        newTagIds.length === oldTagIds.length &&
        newTagIds.every((id) => oldTagIds.includes(id))
      ) {
        return;
      }

      // ローカル状態を即座に更新（楽観的UI）
      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;
      setHasTagChanges(true);

      // キャッシュも更新（CalendarCard等での即時表示用）
      updateTagsInCache(planId, newTagIds);
    },
    [planId, updateTagsInCache],
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      if (!planId) return;

      const newTagIds = selectedTagIdsRef.current.filter((id) => id !== tagId);

      setSelectedTagIds(newTagIds);
      selectedTagIdsRef.current = newTagIds;
      setHasTagChanges(true);

      // キャッシュも更新
      updateTagsInCache(planId, newTagIds);
    },
    [planId, updateTagsInCache],
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

      // ドラフトモードの場合はローカル更新のみ
      if (isDraftMode) {
        if (date && startTime) {
          const [hours, minutes] = startTime.split(':').map(Number);
          updateDraft({ start_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone) });
        }
        if (date && endTime) {
          const [hours, minutes] = endTime.split(':').map(Number);
          updateDraft({ end_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone) });
        }
        return;
      }

      // 通常モード: ローカルにバッファリング（Google Calendar準拠: 閉じる時に保存）
      if (date && startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        // 両フィールドを一度にバッファリング（タイムゾーン対応）
        addPendingChange({
          start_time: localTimeToUTCISO(date, startHours ?? 0, startMinutes ?? 0, timezone),
          end_time: localTimeToUTCISO(date, endHours ?? 0, endMinutes ?? 0, timezone),
        });
      } else if (date && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        addPendingChange({
          start_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone),
        });
      } else if (date && endTime) {
        const [hours, minutes] = endTime.split(':').map(Number);
        addPendingChange({
          end_time: localTimeToUTCISO(date, hours ?? 0, minutes ?? 0, timezone),
        });
      }
    },
    [isDraftMode, startTime, endTime, addPendingChange, updateDraft, timezone],
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
      // 時間変更時に既存のエラーをクリア
      setTimeConflictError(false);

      // 時刻をパース
      const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];

      setStartTime(time);

      // タイムゾーン対応のISO文字列を生成
      const isoValue =
        time && scheduleDate
          ? localTimeToUTCISO(scheduleDate, hours ?? 0, minutes ?? 0, timezone)
          : null;

      // ドラフトモード
      if (isDraftMode) {
        updateDraft({ start_time: isoValue });
        return;
      }

      // 繰り返しインスタンス → スコープダイアログ
      if (recurringEdit.isRecurringInstance) {
        recurringEdit.openScopeDialog('start_time', isoValue ?? undefined);
        return;
      }

      // 通常モード → ローカルにバッファリング（Google Calendar準拠: 閉じる時に保存）
      if (isoValue) {
        addPendingChange({ start_time: isoValue });
      }
    },
    [scheduleDate, isDraftMode, recurringEdit, updateDraft, addPendingChange, timezone],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      // 時間変更時に既存のエラーをクリア
      setTimeConflictError(false);

      // 時刻をパース
      const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];

      setEndTime(time);

      // タイムゾーン対応のISO文字列を生成
      const isoValue =
        time && scheduleDate
          ? localTimeToUTCISO(scheduleDate, hours ?? 0, minutes ?? 0, timezone)
          : null;

      // ドラフトモード
      if (isDraftMode) {
        updateDraft({ end_time: isoValue });
        return;
      }

      // 繰り返しインスタンス → スコープダイアログ
      if (recurringEdit.isRecurringInstance) {
        recurringEdit.openScopeDialog('end_time', isoValue ?? undefined);
        return;
      }

      // 通常モード → ローカルにバッファリング（Google Calendar準拠: 閉じる時に保存）
      if (isoValue) {
        addPendingChange({ end_time: isoValue });
      }
    },
    [scheduleDate, isDraftMode, recurringEdit, updateDraft, addPendingChange, timezone],
  );

  // Menu handlers
  const handleCopyId = useCallback(() => {
    if (planId) navigator.clipboard.writeText(planId);
  }, [planId]);

  const handleOpenInNewTab = useCallback(() => {
    if (planId) window.open(`/plans/${planId}`, '_blank');
  }, [planId]);

  const handleDuplicate = useCallback(() => {
    if (!plan || !('id' in plan)) return;

    // 現在のインスペクターを閉じる
    closeInspector();

    // 少し遅延してから新規作成モードで開く（閉じるアニメーション後）
    setTimeout(() => {
      openInspectorWithDraft({
        title: `${plan.title} (copy)`,
        description: plan.description ?? null,
        due_date: plan.due_date ?? null,
        start_time: plan.start_time ?? null,
        end_time: plan.end_time ?? null,
      });
    }, 100);
  }, [plan, closeInspector, openInspectorWithDraft]);

  const handleCopyLink = useCallback(() => {
    if (planId) {
      const url = `${window.location.origin}/plans/${planId}`;
      navigator.clipboard.writeText(url);
    }
  }, [planId]);

  const handleSaveAsTemplate = useCallback(() => {
    // Stub: テンプレート保存機能は未実装
  }, []);

  /**
   * クライアント側で即時重複チェック（サーバー呼び出し前）
   */
  const checkPlanOverlap = useCallback(
    (startTimeISO: string, endTimeISO: string): boolean => {
      const plans = utils.plans.list.getData();
      if (!plans || plans.length === 0) return false;

      const newStart = new Date(startTimeISO);
      const newEnd = new Date(endTimeISO);

      return plans.some((p) => {
        // 編集時は自分自身を除外
        if (planId && p.id === planId) return false;
        if (!p.start_time || !p.end_time) return false;

        const pStart = new Date(p.start_time);
        const pEnd = new Date(p.end_time);

        return pStart < newEnd && pEnd > newStart;
      });
    },
    [planId, utils.plans.list],
  );

  /**
   * 未保存の変更を保存してからInspectorを閉じる（Google Calendar準拠）
   */
  const saveAndClose = useCallback(async () => {
    // ストアから最新の状態を取得（クロージャの古い値を避ける）
    const {
      draftPlan: currentDraft,
      planId: currentPlanId,
      consumePendingChanges: consume,
    } = usePlanInspectorStore.getState();
    const currentIsDraftMode = currentDraft !== null && currentPlanId === null;

    // ドラフトモードの場合: 新規作成
    if (currentIsDraftMode && currentDraft) {
      // クライアント側で即時重複チェック
      if (currentDraft.start_time && currentDraft.end_time) {
        if (checkPlanOverlap(currentDraft.start_time, currentDraft.end_time)) {
          setTimeConflictError(true);
          return; // サーバーを呼ばずに即座にエラー表示
        }
      }

      try {
        const newPlan = await createPlan.mutateAsync({
          title: currentDraft.title.trim(), // 空の場合はUI側で「(タイトルなし)」を表示
          description: currentDraft.description ?? undefined,
          status: 'open',
          due_date: currentDraft.due_date,
          start_time: currentDraft.start_time,
          end_time: currentDraft.end_time,
        });
        if (newPlan?.id) {
          clearDraft();
          // カレンダーのドラッグ選択をクリア（保存成功後）
          window.dispatchEvent(new CustomEvent('calendar-drag-cancel'));
        }
      } catch (error) {
        console.error('Failed to create plan:', error);
        // TIME_OVERLAPエラーの場合はフィールドにエラー表示
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
          setTimeConflictError(true);
          return; // 閉じない
        }
      }
      closeInspector();
      return;
    }

    // 編集モードの場合: 既存の処理
    const changes = consume();

    // 変更があればサーバーに保存
    if (changes && currentPlanId && Object.keys(changes).length > 0) {
      // 時間変更がある場合はクライアント側チェック
      const startTime = (changes as { start_time?: string }).start_time;
      const endTime = (changes as { end_time?: string }).end_time;
      if (startTime && endTime) {
        if (checkPlanOverlap(startTime, endTime)) {
          setTimeConflictError(true);
          return; // サーバーを呼ばずに即座にエラー表示
        }
      }

      try {
        await updatePlan.mutateAsync({
          id: currentPlanId,
          data: changes,
        });
      } catch (error) {
        console.error('Failed to save pending changes:', error);
        // TIME_OVERLAPエラーの場合はフィールドにエラー表示
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
          setTimeConflictError(true);
          return; // 閉じない
        }
      }
    }

    // タグ変更があればサーバーに保存
    if (hasTagChanges && currentPlanId) {
      try {
        await setplanTags(currentPlanId, selectedTagIdsRef.current);
      } catch (error) {
        console.error('Failed to save tags:', error);
        // タグ保存エラーは閉じることを妨げない（キャッシュは既に更新済み）
      }
    }

    closeInspector();
  }, [
    updatePlan,
    closeInspector,
    createPlan,
    clearDraft,
    checkPlanOverlap,
    setplanTags,
    hasTagChanges,
  ]);

  /**
   * 変更を破棄してInspectorを閉じる（キャンセル）
   */
  const cancelAndClose = useCallback(() => {
    clearPendingChanges();

    // タグ変更があった場合はキャッシュを元に戻す
    if (hasTagChanges && planId) {
      updateTagsInCache(planId, originalTagIdsRef.current);
    }

    closeInspector();
  }, [clearPendingChanges, closeInspector, planId, updateTagsInCache, hasTagChanges]);

  // 未保存の変更があるか判定（タグ変更も含む）
  const hasPendingChanges =
    (pendingChanges && Object.keys(pendingChanges).length > 0) || hasTagChanges;

  return {
    // Store state
    planId,
    plan,
    closeInspector, // 直接閉じる（変更を破棄）
    saveAndClose, // 変更を保存して閉じる
    cancelAndClose, // 変更を破棄して閉じる
    hasPendingChanges, // 未保存の変更があるか
    isDraftMode,

    // Navigation
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,

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
