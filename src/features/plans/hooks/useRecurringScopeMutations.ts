'use client';

/**
 * 繰り返しスコープ付きmutationフック
 *
 * 繰り返しプランの編集・削除における3スコープ（this / thisAndFuture / all）の
 * 処理ロジックを一元管理する。
 *
 * 以前は useRecurringPlanEdit, useRecurringPlanDrag, usePlanContextActions,
 * usePlanInspectorContentLogic の4箇所に重複していたスコープ分岐と
 * splitRecurrence の楽観的更新を集約。
 */

import { useCallback } from 'react';

import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { usePlanInstanceMutations } from '@/features/plans/hooks/usePlanInstances';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { api } from '@/lib/trpc';

interface ApplyEditParams {
  scope: RecurringEditScope;
  planId: string;
  instanceDate: string;
  overrides: Record<string, string | undefined>;
  /** ドラッグ移動で日付が変わる場合の移動先日付（YYYY-MM-DD） */
  targetDate?: string;
}

interface ApplyDeleteParams {
  scope: RecurringEditScope;
  planId: string;
  instanceDate: string;
}

export function useRecurringScopeMutations() {
  const utils = api.useUtils();
  const { updatePlan, deletePlan } = usePlanMutations();
  const { createInstance } = usePlanInstanceMutations();

  // splitRecurrence mutation（楽観的更新付き）- 1箇所で定義
  const splitRecurrence = api.plans.splitRecurrence.useMutation({
    onMutate: async (input) => {
      await utils.plans.list.cancel();
      await utils.plans.getInstances.cancel();

      const previousPlans = utils.plans.list.getData();

      // 親プランの recurrence_end_date を楽観的に更新（splitDate の前日）
      const splitDate = new Date(input.splitDate);
      splitDate.setDate(splitDate.getDate() - 1);
      const endDateString = splitDate.toISOString().slice(0, 10);

      utils.plans.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((p) => {
          if (p.id === input.planId) {
            return { ...p, recurrence_end_date: endDateString };
          }
          return p;
        });
      });

      return { previousPlans };
    },
    onSuccess: () => {
      void utils.plans.list.invalidate();
      void utils.plans.getInstances.invalidate();
    },
    onError: (_err, _input, context) => {
      if (context?.previousPlans) {
        utils.plans.list.setData(undefined, context.previousPlans);
      }
      void utils.plans.getInstances.invalidate();
    },
  });

  /**
   * スコープ付き編集を実行
   *
   * - this: このインスタンスのみ変更（modified/moved 例外を作成）
   * - thisAndFuture: この日以降を分割して新プランを作成
   * - all: 親プランを直接更新
   */
  const applyEdit = useCallback(
    async ({ scope, planId, instanceDate, overrides, targetDate }: ApplyEditParams) => {
      switch (scope) {
        case 'this': {
          const isSameDate = !targetDate || targetDate === instanceDate;
          await createInstance.mutateAsync({
            planId,
            instanceDate,
            exceptionType: isSameDate ? 'modified' : 'moved',
            overrides,
            ...(isSameDate ? {} : { originalDate: targetDate }),
          });
          break;
        }

        case 'thisAndFuture': {
          await splitRecurrence.mutateAsync({
            planId,
            splitDate: instanceDate,
            overrides,
          });
          break;
        }

        case 'all': {
          await updatePlan.mutateAsync({
            id: planId,
            data: overrides,
          });
          break;
        }
      }
    },
    [createInstance, splitRecurrence, updatePlan],
  );

  /**
   * スコープ付き削除を実行
   *
   * - this: このインスタンスのみ削除（cancelled 例外を作成）
   * - thisAndFuture: この日以降を終了（recurrence_end_date を設定）
   * - all: 親プランを削除
   */
  const applyDelete = useCallback(
    async ({ scope, planId, instanceDate }: ApplyDeleteParams) => {
      switch (scope) {
        case 'this': {
          await createInstance.mutateAsync({
            planId,
            instanceDate,
            exceptionType: 'cancelled',
          });
          break;
        }

        case 'thisAndFuture': {
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

        case 'all': {
          await deletePlan.mutateAsync({ id: planId });
          break;
        }
      }
    },
    [createInstance, updatePlan, deletePlan],
  );

  return {
    applyEdit,
    applyDelete,
  };
}
