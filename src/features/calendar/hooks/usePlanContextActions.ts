'use client';

import { useCallback, useRef } from 'react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useRecurringScopeMutations } from '@/features/plans/hooks/useRecurringScopeMutations';
import { useDeleteConfirmStore } from '@/features/plans/stores/useDeleteConfirmStore';
import { usePlanClipboardStore } from '@/features/plans/stores/usePlanClipboardStore';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '@/features/plans/stores/useRecurringEditConfirmStore';
import { getInstanceRef } from '@/features/plans/utils/instanceId';
import { toast } from 'sonner';

export function usePlanContextActions() {
  const { openInspector, openInspectorWithDraft } = usePlanInspectorStore();
  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const openRecurringDialog = useRecurringEditConfirmStore((state) => state.openDialog);
  const { deletePlan, updatePlan } = usePlanMutations();
  const { applyDelete } = useRecurringScopeMutations();

  // 繰り返しプラン削除用のターゲットをrefで保持（ダイアログのコールバックで参照）
  const recurringDeleteTargetRef = useRef<CalendarPlan | null>(null);

  // 繰り返しプラン削除確認ハンドラー（ダイアログのコールバック）
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const target = recurringDeleteTargetRef.current;
      if (!target) return;

      try {
        const ref = getInstanceRef(target);
        if (!ref) return;

        await applyDelete({
          scope,
          planId: ref.parentPlanId,
          instanceDate: ref.instanceDate,
        });
      } finally {
        recurringDeleteTargetRef.current = null;
      }
    },
    [applyDelete],
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
      const ref = plan.isRecurring ? getInstanceRef(plan) : null;
      const instanceDate = ref?.instanceDate ?? plan.startDate?.toISOString().slice(0, 10);

      openInspector(plan.calendarId || plan.id, instanceDate ? { instanceDate } : undefined);
    },
    [openInspector],
  );

  const handleDuplicatePlan = useCallback(
    (plan: CalendarPlan) => {
      const startTime = plan.startDate ? plan.startDate.toISOString() : null;
      const endTime = plan.endDate ? plan.endDate.toISOString() : null;

      // ドラフトモードで開く（複製元の情報をプリフィル）
      // ユーザーが時間を変更してから保存できる
      openInspectorWithDraft({
        title: `${plan.title} (copy)`,
        description: plan.description ?? null,
        start_time: startTime,
        end_time: endTime,
      });
    },
    [openInspectorWithDraft],
  );

  const handleCopyPlan = useCallback((plan: CalendarPlan) => {
    const startHour = plan.startDate?.getHours() ?? 0;
    const startMinute = plan.startDate?.getMinutes() ?? 0;
    const duration =
      plan.endDate && plan.startDate
        ? (plan.endDate.getTime() - plan.startDate.getTime()) / 60000
        : 60;

    usePlanClipboardStore.getState().copyPlan({
      title: plan.title,
      description: plan.description ?? null,
      duration,
      startHour,
      startMinute,
      tagIds: plan.tagIds,
    });

    toast.success('コピーしました');
  }, []);

  /**
   * コピーしたプランをペースト
   * @param targetDate ペースト先の日付
   * @param targetHour ペースト先の時（指定しない場合はコピー元の時刻を使用）
   * @param targetMinute ペースト先の分（指定しない場合はコピー元の分を使用）
   */
  const handlePastePlan = useCallback(
    (targetDate: Date, targetHour?: number, targetMinute?: number) => {
      const clipboard = usePlanClipboardStore.getState();
      const copiedPlan = clipboard.copiedPlan;
      if (!copiedPlan) return;

      // ペースト先の日付 + 指定時刻（なければコピー元の時刻）
      const startTime = new Date(targetDate);
      const hour = targetHour ?? copiedPlan.startHour;
      const minute = targetMinute ?? copiedPlan.startMinute;
      startTime.setHours(hour, minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + copiedPlan.duration);

      openInspectorWithDraft({
        title: copiedPlan.title,
        description: copiedPlan.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });
    },
    [openInspectorWithDraft],
  );

  const handleCompletePlan = useCallback(
    (plan: CalendarPlan) => {
      const planId = plan.calendarId || plan.id;
      const newStatus = plan.status === 'closed' ? 'open' : 'closed';
      updatePlan.mutate({ id: planId, data: { status: newStatus } });
    },
    [updatePlan],
  );

  const handleCompleteWithRecord = useCallback(
    (plan: CalendarPlan) => {
      const planId = plan.calendarId || plan.id;
      // Plan を完了にする
      updatePlan.mutate({ id: planId, data: { status: 'closed' } });
      // Record 作成フォームを開く（Plan のデータをプリフィル）
      openInspectorWithDraft(
        {
          title: plan.title,
          plan_id: planId,
          start_time: plan.startDate?.toISOString() ?? null,
          end_time: plan.endDate?.toISOString() ?? null,
          tagIds: plan.tagIds ?? [],
        },
        'record',
      );
    },
    [updatePlan, openInspectorWithDraft],
  );

  return {
    handleDeletePlan,
    handleEditPlan,
    handleDuplicatePlan,
    handleCopyPlan,
    handlePastePlan,
    handleCompletePlan,
    handleCompleteWithRecord,
  };
}
