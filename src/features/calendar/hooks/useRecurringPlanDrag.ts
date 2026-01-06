'use client';

/**
 * 繰り返しプランのドラッグ移動フック
 *
 * 繰り返しインスタンスのドラッグ移動時にスコープ選択ダイアログを表示し、
 * 選択に応じて適切な更新処理を行う（Googleカレンダー準拠）
 */

import { useCallback, useRef } from 'react';

import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { usePlanInstanceMutations } from '@/features/plans/hooks/usePlanInstances';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useRecurringEditConfirmStore } from '@/features/plans/stores/useRecurringEditConfirmStore';
import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';

import type { CalendarPlan } from '../types/calendar.types';

interface PendingDragUpdate {
  plan: CalendarPlan;
  updates: { startTime: Date; endTime: Date };
}

interface UseRecurringPlanDragOptions {
  /** 全プラン配列（繰り返しインスタンス情報を含む） */
  plans: CalendarPlan[];
}

export function useRecurringPlanDrag({ plans }: UseRecurringPlanDragOptions) {
  const utils = api.useUtils();
  const { updatePlan } = usePlanMutations();
  const { createInstance } = usePlanInstanceMutations();

  // 繰り返しプラン分割用mutation
  const splitRecurrence = api.plans.splitRecurrence.useMutation({
    onSuccess: () => {
      utils.plans.list.invalidate();
      utils.plans.getInstances.invalidate();
    },
  });

  // 保留中のドラッグ更新（refで保持してダイアログのコールバックで参照）
  const pendingDragUpdateRef = useRef<PendingDragUpdate | null>(null);

  // グローバルストアのopenDialog
  const openDialog = useRecurringEditConfirmStore((state) => state.openDialog);

  /**
   * スコープ選択後の処理
   * handleUpdatePlanより先に定義（依存関係のため）
   */
  const handleScopeConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const pendingDragUpdate = pendingDragUpdateRef.current;
      if (!pendingDragUpdate) return;

      const { plan, updates } = pendingDragUpdate;
      const parentPlanId = plan.originalPlanId!;
      const instanceDate = plan.instanceDate!;
      const newDate = updates.startTime.toISOString().slice(0, 10);
      const isSameDate = instanceDate === newDate;

      try {
        switch (scope) {
          case 'this': {
            // このイベントのみ: moved/modified例外を作成
            logger.log('🔄 繰り返しインスタンスの移動 (このイベントのみ):', {
              parentPlanId,
              instanceDate,
              newDate,
              isSameDate,
            });

            await createInstance.mutateAsync({
              planId: parentPlanId,
              instanceDate,
              exceptionType: isSameDate ? 'modified' : 'moved',
              overrides: {
                start_time: updates.startTime.toISOString(),
                end_time: updates.endTime.toISOString(),
              },
              ...(isSameDate ? {} : { originalDate: newDate }),
            });

            utils.plans.list.invalidate();
            utils.plans.getInstances.invalidate();
            break;
          }

          case 'thisAndFuture': {
            // この日以降: 親プランを分割して新しい日時で開始
            logger.log('🔄 繰り返しインスタンスの移動 (この日以降):', {
              parentPlanId,
              instanceDate,
            });

            await splitRecurrence.mutateAsync({
              planId: parentPlanId,
              splitDate: instanceDate,
              overrides: {
                start_time: updates.startTime.toISOString(),
                end_time: updates.endTime.toISOString(),
              },
            });
            break;
          }

          case 'all': {
            // すべてのイベント: 親プランを直接更新
            logger.log('🔄 繰り返しプランの更新 (すべて):', {
              parentPlanId,
            });

            updatePlan.mutate({
              id: parentPlanId,
              data: {
                start_time: updates.startTime.toISOString(),
                end_time: updates.endTime.toISOString(),
              },
            });
            break;
          }
        }
      } catch (error) {
        logger.error('繰り返しプランの更新に失敗:', error);
      } finally {
        pendingDragUpdateRef.current = null;
      }
    },
    [createInstance, updatePlan, splitRecurrence, utils],
  );

  /**
   * プラン更新ハンドラー（ドラッグ&ドロップ用）
   * 繰り返しインスタンスの場合はダイアログを表示
   *
   * BaseViewProps の onUpdatePlan と互換性のある型シグネチャ:
   * - (planId: string, updates: { startTime: Date; endTime: Date }) - ドラッグ用
   * - (plan: CalendarPlan) - カレンダーオブジェクト形式
   *
   * Note: 繰り返しプラン編集時は { skipToast: true } を返し、
   * 呼び出し元でtoast表示をスキップする（型はvoidだがランタイムで値を返す）
   */
  const handleUpdatePlan = useCallback(
    async (
      planIdOrPlan: string | CalendarPlan,
      updates?: { startTime: Date; endTime: Date },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> => {
      // プランIDとupdatesを取得
      let plan: CalendarPlan | undefined;
      let resolvedUpdates: { startTime: Date; endTime: Date } | undefined;

      if (typeof planIdOrPlan === 'string' && updates) {
        // (planId, updates) 形式
        plan = plans.find((p) => p.id === planIdOrPlan);
        resolvedUpdates = updates;
      } else if (typeof planIdOrPlan === 'object') {
        // (CalendarPlan) 形式
        plan = planIdOrPlan;
        if (plan.startDate && plan.endDate) {
          resolvedUpdates = {
            startTime: plan.startDate,
            endTime: plan.endDate,
          };
        }
      }

      if (!plan) {
        logger.warn('Plan not found for update:', planIdOrPlan);
        return;
      }

      if (!resolvedUpdates) {
        logger.warn('No updates provided for plan:', plan.id);
        return;
      }

      // 繰り返しインスタンスかどうか判定
      // - isRecurring が true
      // - originalPlanId が設定されている（親プランID）
      // - instanceDate が設定されている（インスタンス日付）
      const isRecurringInstance = plan.isRecurring && plan.originalPlanId && plan.instanceDate;

      if (isRecurringInstance) {
        // 繰り返しインスタンスの場合: ダイアログを表示
        logger.log('🔄 繰り返しインスタンスのドラッグ検出:', {
          planId: plan.id,
          originalPlanId: plan.originalPlanId,
          instanceDate: plan.instanceDate,
        });

        // refに保存してダイアログを開く
        pendingDragUpdateRef.current = { plan, updates: resolvedUpdates };
        openDialog(plan.title, 'edit', handleScopeConfirm);

        // ダイアログを表示するためtoastはスキップ
        return { skipToast: true };
      } else {
        // 通常プランの場合: 直接更新
        updatePlan.mutate({
          id: plan.id,
          data: {
            start_time: resolvedUpdates.startTime.toISOString(),
            end_time: resolvedUpdates.endTime.toISOString(),
          },
        });
      }
    },
    [plans, updatePlan, openDialog, handleScopeConfirm],
  );

  return {
    // 更新ハンドラー
    handleUpdatePlan,
  };
}
