// PlanCard用ハンドラーhook

import { useCallback, useRef, useState } from 'react';

import { parseDateString, parseDatetimeString } from '@/features/calendar/utils/dateUtils';
import type { PlanItem } from '@/features/inbox/hooks/useInboxData';
import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useplanTags } from '@/features/plans/hooks/usePlanTags';
import { useDeleteConfirmStore } from '@/features/plans/stores/useDeleteConfirmStore';
import { useplanCacheStore } from '@/features/plans/stores/usePlanCacheStore';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '@/features/plans/stores/useRecurringEditConfirmStore';
import { toLocalISOString } from '@/features/plans/utils/datetime';
import { minutesToReminderType, reminderTypeToMinutes } from '@/features/plans/utils/reminder';
import { useTagsMap } from '@/features/tags/hooks/useTagsMap';
import { format } from 'date-fns';

import { useBoardFocusStore } from '../../stores/useBoardFocusStore';

interface UsePlanCardHandlersProps {
  item: PlanItem;
}

interface PendingDateTimeEdit {
  type: 'change' | 'clear';
  data?: {
    due_date: string | undefined;
    start_time: string | undefined;
    end_time: string | undefined;
    reminder_minutes: number | null | undefined;
  };
}

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays';

export function usePlanCardHandlers({ item }: UsePlanCardHandlersProps) {
  const { openInspector, planId } = usePlanInspectorStore();
  const { focusedId, setFocusedId } = useBoardFocusStore();
  const { addplanTag, removeplanTag } = useplanTags();
  const { updatePlan, deletePlan } = usePlanMutations();
  const { getTagsByIds } = useTagsMap();
  const { getCache } = useplanCacheStore();
  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const openRecurringDialog = useRecurringEditConfirmStore((state) => state.openDialog);

  const isActive = planId === item.id;
  const isFocused = focusedId === item.id;

  // 繰り返しプラン削除用のターゲットをrefで保持
  const recurringDeleteTargetRef = useRef<PlanItem | null>(null);

  // 繰り返しプラン日時編集用のペンディングデータをrefで保持
  const pendingDateTimeEditRef = useRef<PendingDateTimeEdit | null>(null);

  // 日時編集用の状態
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    item.due_date ? parseDateString(item.due_date) : undefined,
  );
  const [startTime, setStartTime] = useState(
    item.start_time ? format(parseDatetimeString(item.start_time), 'HH:mm') : '',
  );
  const [endTime, setEndTime] = useState(
    item.end_time ? format(parseDatetimeString(item.end_time), 'HH:mm') : '',
  );
  const [reminderType, setReminderType] = useState<string>(
    minutesToReminderType(item.reminder_minutes),
  );

  // 繰り返し設定（Zustandキャッシュから取得、なければitemから）
  const cache = getCache(item.id);
  const recurrenceType = ((): RecurrenceType => {
    if (cache?.recurrence_type !== undefined) {
      return cache.recurrence_type === 'none' || !cache.recurrence_type
        ? 'none'
        : (cache.recurrence_type as RecurrenceType);
    }
    return item.recurrence_type === 'none' || !item.recurrence_type
      ? 'none'
      : (item.recurrence_type as RecurrenceType);
  })();
  const recurrenceRule =
    cache?.recurrence_rule !== undefined ? cache.recurrence_rule : (item.recurrence_rule ?? null);

  // タグ情報をtagIdsから取得
  const tags = getTagsByIds(item.tagIds ?? []);

  // 繰り返しプラン日時編集確認ハンドラー
  const handleRecurringDateTimeEditConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const pending = pendingDateTimeEditRef.current;
      if (!pending) return;

      try {
        switch (scope) {
          case 'this':
          case 'thisAndFuture':
          case 'all':
            if (pending.type === 'clear') {
              await updatePlan.mutateAsync({
                id: item.id,
                data: {
                  due_date: undefined,
                  start_time: undefined,
                  end_time: undefined,
                  reminder_minutes: null,
                  recurrence_type: 'none',
                  recurrence_rule: null,
                },
              });
              setSelectedDate(undefined);
              setStartTime('');
              setEndTime('');
              setReminderType('');
              setDateTimeOpen(false);
            } else if (pending.data) {
              await updatePlan.mutateAsync({
                id: item.id,
                data: pending.data,
              });
            }
            break;
        }
      } catch (err) {
        console.error('Failed to update recurring plan datetime:', err);
      } finally {
        pendingDateTimeEditRef.current = null;
      }
    },
    [updatePlan, item.id],
  );

  // タグ変更ハンドラー
  const handleTagsChange = async (newTagIds: string[]) => {
    const currentTagIds = item.tagIds ?? [];
    const addedTagIds = newTagIds.filter((id) => !currentTagIds.includes(id));
    const removedTagIds = currentTagIds.filter((id) => !newTagIds.includes(id));

    for (const tagId of addedTagIds) {
      await addplanTag(item.id, tagId);
    }
    for (const tagId of removedTagIds) {
      await removeplanTag(item.id, tagId);
    }
  };

  // 日時データ変更ハンドラー
  const handleDateTimeChange = () => {
    const isRecurring =
      item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;

    const updateData = {
      due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
      start_time:
        selectedDate && startTime
          ? toLocalISOString(format(selectedDate, 'yyyy-MM-dd'), startTime)
          : undefined,
      end_time:
        selectedDate && endTime
          ? toLocalISOString(format(selectedDate, 'yyyy-MM-dd'), endTime)
          : undefined,
      reminder_minutes: reminderTypeToMinutes(reminderType),
    };

    if (isRecurring) {
      pendingDateTimeEditRef.current = { type: 'change', data: updateData };
      openRecurringDialog(item.title, 'edit', handleRecurringDateTimeEditConfirm);
      return;
    }

    updatePlan.mutate({ id: item.id, data: updateData });
  };

  // 日時クリアハンドラー
  const handleDateTimeClear = () => {
    const isRecurring =
      item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;

    if (isRecurring) {
      pendingDateTimeEditRef.current = { type: 'clear' };
      openRecurringDialog(item.title, 'edit', handleRecurringDateTimeEditConfirm);
      return;
    }

    updatePlan.mutate({
      id: item.id,
      data: {
        due_date: undefined,
        start_time: undefined,
        end_time: undefined,
        reminder_minutes: null,
        recurrence_type: 'none',
        recurrence_rule: null,
      },
    });
    setSelectedDate(undefined);
    setStartTime('');
    setEndTime('');
    setReminderType('');
    setDateTimeOpen(false);
  };

  const handleClick = () => {
    if (item.type === 'plan') {
      openInspector(item.id);
    }
  };

  // 繰り返しプラン削除確認ハンドラー
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const target = recurringDeleteTargetRef.current;
      if (!target) return;

      try {
        const parentPlanId = target.id;
        switch (scope) {
          case 'this':
          case 'thisAndFuture':
          case 'all':
            await deletePlan.mutateAsync({ id: parentPlanId });
            break;
        }
      } catch (err) {
        console.error('Failed to delete recurring plan:', err);
      } finally {
        recurringDeleteTargetRef.current = null;
      }
    },
    [deletePlan],
  );

  // コンテキストメニューアクション
  const handleEdit = (item: PlanItem) => {
    openInspector(item.id);
  };

  const handleDuplicate = (_item: PlanItem) => {
    // Stub: 複製機能は未実装
  };

  const handleAddTags = (_item: PlanItem) => {
    // Stub: タグ追加機能は未実装
  };

  const handleChangeDueDate = (_item: PlanItem) => {
    // Stub: 期限変更機能は未実装
  };

  const handleArchive = (_item: PlanItem) => {
    // Stub: アーカイブ機能は未実装
  };

  const handleDelete = useCallback(
    (item: PlanItem) => {
      const isRecurring =
        item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;

      if (isRecurring) {
        recurringDeleteTargetRef.current = item;
        openRecurringDialog(item.title, 'delete', handleRecurringDeleteConfirm);
        return;
      }

      openDeleteDialog(item.id, item.title, async () => {
        try {
          await deletePlan.mutateAsync({ id: item.id });
        } catch (err) {
          console.error('Failed to delete plan:', err);
        }
      });
    },
    [deletePlan, openDeleteDialog, openRecurringDialog, handleRecurringDeleteConfirm],
  );

  const handleRepeatTypeChange = (type: string) => {
    const typeMap: Record<string, 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'> =
      {
        '': 'none',
        毎日: 'daily',
        毎週: 'weekly',
        毎月: 'monthly',
        毎年: 'yearly',
        平日: 'weekdays',
      };
    const recurrenceType = typeMap[type] || 'none';

    updatePlan.mutate({
      id: item.id,
      data: { recurrence_type: recurrenceType, recurrence_rule: null },
    });
  };

  const handleRecurrenceRuleChange = (rrule: string | null) => {
    updatePlan.mutate({
      id: item.id,
      data: { recurrence_rule: rrule },
    });
  };

  return {
    // State
    isActive,
    isFocused,
    dateTimeOpen,
    setDateTimeOpen,
    selectedDate,
    setSelectedDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    reminderType,
    setReminderType,
    recurrenceType,
    recurrenceRule,
    tags,

    // Handlers
    handleTagsChange,
    handleDateTimeChange,
    handleDateTimeClear,
    handleClick,
    handleEdit,
    handleDuplicate,
    handleAddTags,
    handleChangeDueDate,
    handleArchive,
    handleDelete,
    handleRepeatTypeChange,
    handleRecurrenceRuleChange,

    // Store actions
    setFocusedId,
    updatePlan,
  };
}
