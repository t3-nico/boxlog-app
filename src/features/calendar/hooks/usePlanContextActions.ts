'use client';

import { useCallback, useRef } from 'react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { usePlanInstanceMutations } from '@/features/plans/hooks/usePlanInstances';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { usePlanTags } from '@/features/plans/hooks/usePlanTags';
import { useDeleteConfirmStore } from '@/features/plans/stores/useDeleteConfirmStore';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '@/features/plans/stores/useRecurringEditConfirmStore';
import { format } from 'date-fns';

export function usePlanContextActions() {
  const { openInspector } = usePlanInspectorStore();
  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const openRecurringDialog = useRecurringEditConfirmStore((state) => state.openDialog);
  const { createPlan, deletePlan, updatePlan } = usePlanMutations();
  const { createInstance } = usePlanInstanceMutations();
  const { addPlanTag } = usePlanTags();

  // 繰り返しプラン削除用のターゲットをrefで保持（ダイアログのコールバックで参照）
  const recurringDeleteTargetRef = useRef<CalendarPlan | null>(null);

  // 繰り返しプラン削除確認ハンドラー（ダイアログのコールバック）
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const target = recurringDeleteTargetRef.current;
      if (!target) return;

      try {
        // 親プランID（展開されたオカレンスの場合はcalendarIdが親ID）
        const parentPlanId = target.calendarId || target.id;

        // インスタンスの日付を取得（展開されたオカレンスのIDから抽出）
        // ID形式: {parentPlanId}_{YYYY-MM-DD}
        const instanceDate = target.id.includes('_')
          ? (target.id.split('_').pop() ?? '')
          : (target.startDate?.toISOString().slice(0, 10) ?? '');

        switch (scope) {
          case 'this':
            // この日のみ例外として削除（cancelled例外を作成）
            await createInstance.mutateAsync({
              planId: parentPlanId,
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
              id: parentPlanId,
              data: {
                recurrence_end_date: endDate.toISOString().slice(0, 10),
              },
            });
            break;
          }

          case 'all':
            // 親プラン自体を削除
            await deletePlan.mutateAsync({ id: parentPlanId });
            break;
        }
      } finally {
        recurringDeleteTargetRef.current = null;
      }
    },
    [deletePlan, createInstance, updatePlan],
  );

  const handleDeletePlan = useCallback(
    (plan: CalendarPlan) => {
      // 繰り返しプランの場合はスコープ選択ダイアログを表示
      if (plan.isRecurring) {
        recurringDeleteTargetRef.current = plan;
        openRecurringDialog(plan.title, 'delete', handleRecurringDeleteConfirm);
        return;
      }

      // 通常プラン: カスタム削除確認ダイアログを使用
      const planIdToDelete = plan.calendarId || plan.id;
      openDeleteDialog(planIdToDelete, plan.title, async () => {
        await deletePlan.mutateAsync({ id: planIdToDelete });
      });
    },
    [deletePlan, openDeleteDialog, openRecurringDialog, handleRecurringDeleteConfirm],
  );

  const handleEditPlan = useCallback(
    (plan: CalendarPlan) => {
      // planInspectorを開いて編集モードにする
      // 繰り返しプランの場合はインスタンス日付を渡す
      const instanceDateRaw =
        plan.isRecurring && plan.id.includes('_')
          ? plan.id.split('_').pop()
          : plan.startDate?.toISOString().slice(0, 10);
      // instanceDateがundefinedの場合は渡さない
      openInspector(
        plan.calendarId || plan.id,
        instanceDateRaw ? { instanceDate: instanceDateRaw } : undefined,
      );
    },
    [openInspector],
  );

  const handleDuplicatePlan = useCallback(
    async (plan: CalendarPlan) => {
      try {
        // 日付をフォーマット
        const dueDate = plan.startDate ? format(plan.startDate, 'yyyy-MM-dd') : undefined;
        const startTime = plan.startDate ? plan.startDate.toISOString() : undefined;
        const endTime = plan.endDate ? plan.endDate.toISOString() : undefined;

        // プランを複製（タイトルに「のコピー」を追加）
        // 繰り返しプランの場合は、その日のインスタンスを単発プランとして複製
        const newPlan = await createPlan.mutateAsync({
          title: `${plan.title}のコピー`,
          description: plan.description ?? undefined,
          status: 'open', // 複製時はopenにリセット
          due_date: dueDate,
          start_time: startTime,
          end_time: endTime,
          reminder_minutes: plan.reminder_minutes ?? undefined,
          // 繰り返し設定はコピーしない（単発プランとして複製）
        });

        // タグも複製
        if (plan.tagIds && plan.tagIds.length > 0) {
          for (const tagId of plan.tagIds) {
            await addPlanTag(newPlan.id, tagId);
          }
        }

        // 複製したプランをInspectorで開く
        openInspector(newPlan.id);
      } catch {
        // Error handled silently
      }
    },
    [createPlan, addPlanTag, openInspector],
  );

  const handleViewDetails = useCallback(
    (plan: CalendarPlan) => {
      // planInspectorを開いて詳細を表示
      // 繰り返しプランの場合はインスタンス日付を渡す
      const instanceDateRaw =
        plan.isRecurring && plan.id.includes('_')
          ? plan.id.split('_').pop()
          : plan.startDate?.toISOString().slice(0, 10);
      // instanceDateがundefinedの場合は渡さない
      openInspector(
        plan.calendarId || plan.id,
        instanceDateRaw ? { instanceDate: instanceDateRaw } : undefined,
      );
    },
    [openInspector],
  );

  return {
    handleDeletePlan,
    handleEditPlan,
    handleDuplicatePlan,
    handleViewDetails,
  };
}
