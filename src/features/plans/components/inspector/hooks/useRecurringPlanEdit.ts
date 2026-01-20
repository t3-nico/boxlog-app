'use client';

/**
 * 繰り返しプラン編集フック
 *
 * 繰り返しインスタンスの編集時にスコープ選択ダイアログを表示し、
 * 選択されたスコープに応じて適切な更新処理を行う
 *
 * グローバルダイアログ（RecurringEditConfirmDialog）を使用
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { usePlanInstanceMutations } from '@/features/plans/hooks/usePlanInstances';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useRecurringEditConfirmStore } from '@/features/plans/stores/useRecurringEditConfirmStore';
import { api } from '@/lib/trpc';

import type { Plan } from '../../../types/plan';

// オーバーライド可能なフィールド
type OverrideableField = 'title' | 'description' | 'start_time' | 'end_time';

interface PendingChanges {
  [key: string]: string | undefined;
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
}

interface UseRecurringPlanEditOptions {
  plan: Plan | null;
  planId: string | null;
  instanceDate: string | null;
}

export function useRecurringPlanEdit({ plan, planId, instanceDate }: UseRecurringPlanEditOptions) {
  const utils = api.useUtils();
  const { updatePlan } = usePlanMutations();
  const { createInstance } = usePlanInstanceMutations();

  // グローバルダイアログストア
  const openDialog = useRecurringEditConfirmStore((state) => state.openDialog);

  // 繰り返しプラン分割用mutation（楽観的更新付き）
  const splitRecurrence = api.plans.splitRecurrence.useMutation({
    // 楽観的更新: 分割直後に親プランの終了日を即座に更新
    onMutate: async (input) => {
      // 進行中のクエリをキャンセル
      await utils.plans.list.cancel();
      await utils.plans.getInstances.cancel();

      // 現在のキャッシュを保存（ロールバック用）
      const previousPlans = utils.plans.list.getData();

      // 親プランのrecurrence_end_dateを楽観的に更新（splitDateの前日）
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
      // 新プランが作成されるため、必ずinvalidateで最新データを取得
      void utils.plans.list.invalidate();
      void utils.plans.getInstances.invalidate();
    },
    onError: (_err, _input, context) => {
      // エラー時: ロールバック
      if (context?.previousPlans) {
        utils.plans.list.setData(undefined, context.previousPlans);
      }
      void utils.plans.getInstances.invalidate();
    },
  });

  // 繰り返しインスタンスかどうか
  const isRecurringInstance = useMemo(() => {
    if (!plan || !instanceDate) return false;
    // 繰り返し設定があり、かつインスタンス日付が指定されている
    return !!(plan.recurrence_type && plan.recurrence_type !== 'none');
  }, [plan, instanceDate]);

  // 保留中の変更
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});
  const pendingChangesRef = useRef<PendingChanges>({});
  const pendingFieldRef = useRef<{ field: string; value: string | undefined } | null>(null);

  // planIdが変わったときに状態をリセット
  useEffect(() => {
    setPendingChanges({});
    pendingChangesRef.current = {};
    pendingFieldRef.current = null;
  }, [planId]);

  // 変更があるかどうか
  const hasPendingChanges = useMemo(() => {
    return Object.keys(pendingChanges).length > 0;
  }, [pendingChanges]);

  /**
   * 繰り返しインスタンスへの変更を蓄積
   */
  const accumulateChange = useCallback((field: OverrideableField, value: string | undefined) => {
    setPendingChanges((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        delete next[field];
      } else {
        next[field] = value;
      }
      pendingChangesRef.current = next;
      return next;
    });
  }, []);

  /**
   * スコープ選択後の処理
   */
  const handleScopeConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      if (!planId || !instanceDate) return;

      // 単一フィールドの変更の場合
      const singleChange = pendingFieldRef.current;
      const changesToApply = singleChange
        ? { [singleChange.field]: singleChange.value }
        : pendingChangesRef.current;

      if (Object.keys(changesToApply).length === 0) {
        pendingFieldRef.current = null;
        return;
      }

      try {
        switch (scope) {
          case 'this': {
            // このイベントのみ: modified例外を作成
            await createInstance.mutateAsync({
              planId,
              instanceDate,
              exceptionType: 'modified',
              overrides: changesToApply,
            });
            break;
          }

          case 'thisAndFuture': {
            // この日以降: 親プランを分割して新プランを作成
            await splitRecurrence.mutateAsync({
              planId,
              splitDate: instanceDate,
              overrides: changesToApply,
            });
            break;
          }

          case 'all': {
            // すべてのイベント: 親プランを直接更新
            await updatePlan.mutateAsync({
              id: planId,
              data: changesToApply,
            });
            break;
          }
        }

        // 成功したら保留中の変更をクリア
        setPendingChanges({});
        pendingChangesRef.current = {};
        pendingFieldRef.current = null;
      } catch (error) {
        console.error('Failed to apply recurring edit:', error);
      }
    },
    [planId, instanceDate, createInstance, updatePlan, splitRecurrence],
  );

  /**
   * スコープ選択ダイアログを開く（グローバルダイアログを使用）
   */
  const openScopeDialog = useCallback(
    (field?: string, value?: string | undefined) => {
      if (field !== undefined) {
        pendingFieldRef.current = { field, value };
      }
      openDialog(plan?.title ?? '', 'edit', handleScopeConfirm);
    },
    [plan?.title, openDialog, handleScopeConfirm],
  );

  /**
   * 保留中の変更をキャンセル
   */
  const clearPendingChanges = useCallback(() => {
    setPendingChanges({});
    pendingChangesRef.current = {};
  }, []);

  return {
    // 状態
    isRecurringInstance,
    hasPendingChanges,
    pendingChanges,

    // アクション
    accumulateChange,
    openScopeDialog,
    clearPendingChanges,
  };
}
