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

import { useEntryMutations } from '@/hooks/useEntryMutations';
import { usePlanInstanceMutations } from '@/hooks/usePlanInstances';
import { api } from '@/lib/trpc';
import type { RecurringEditScope } from '@/stores/useModalStore';

interface ApplyEditParams {
  scope: RecurringEditScope;
  planId: string;
  instanceDate: string;
  changes: {
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
  };
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
  const { updateEntry, deleteEntry } = useEntryMutations();
  const { createInstance } = usePlanInstanceMutations();

  // splitRecurrence mutation（楽観的更新付き）- 1箇所で定義
  const splitRecurrence = api.entries.splitRecurrence.useMutation({
    onMutate: async (input) => {
      await utils.entries.list.cancel();
      await utils.entries.getInstances.cancel();

      const previousPlans = utils.entries.list.getData();

      // 親プランの recurrence_end_date を楽観的に更新（splitDate の前日）
      const splitDate = new Date(input.splitDate);
      splitDate.setDate(splitDate.getDate() - 1);
      const endDateString = splitDate.toISOString().slice(0, 10);

      utils.entries.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((p) => {
          if (p.id === input.entryId) {
            return { ...p, recurrence_end_date: endDateString };
          }
          return p;
        });
      });

      return { previousPlans };
    },
    onSuccess: () => {
      void utils.entries.list.invalidate();
      void utils.entries.getInstances.invalidate();
    },
    onError: (_err, _input, context) => {
      if (context?.previousPlans) {
        utils.entries.list.setData(undefined, context.previousPlans);
      }
      void utils.entries.getInstances.invalidate();
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
    async ({ scope, planId, instanceDate, changes, targetDate }: ApplyEditParams) => {
      switch (scope) {
        case 'this': {
          const isSameDate = !targetDate || targetDate === instanceDate;
          await createInstance.mutateAsync({
            entryId: planId,
            instanceDate,
            exceptionType: isSameDate ? 'modified' : 'moved',
            title: changes.title,
            description: changes.description,
            instanceStart: changes.start_time,
            instanceEnd: changes.end_time,
            ...(isSameDate ? {} : { originalDate: targetDate }),
          });
          break;
        }

        case 'thisAndFuture': {
          await splitRecurrence.mutateAsync({
            entryId: planId,
            splitDate: instanceDate,
            overrides: changes,
          });
          break;
        }

        case 'all': {
          await updateEntry.mutateAsync({
            id: planId,
            data: changes,
          });
          break;
        }
      }
    },
    [createInstance, splitRecurrence, updateEntry],
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
            entryId: planId,
            instanceDate,
            exceptionType: 'cancelled',
          });
          break;
        }

        case 'thisAndFuture': {
          const endDate = new Date(instanceDate);
          endDate.setDate(endDate.getDate() - 1);
          await updateEntry.mutateAsync({
            id: planId,
            data: {
              recurrence_end_date: endDate.toISOString().slice(0, 10),
            },
          });
          break;
        }

        case 'all': {
          await deleteEntry.mutateAsync({ id: planId });
          break;
        }
      }
    },
    [createInstance, updateEntry, deleteEntry],
  );

  return {
    applyEdit,
    applyDelete,
  };
}
