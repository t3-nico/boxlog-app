import { useCallback, useEffect, useRef } from 'react';

import { usePlanInstanceMutations } from '@/features/plans/hooks/usePlanInstances';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { logger } from '@/lib/logger';
import { api } from '@/lib/trpc';

import type { CalendarPlan } from '../types/calendar.types';

/**
 * プラン操作（CRUD）を提供するフック
 * プランの削除、復元、更新、自動クリーンアップを管理
 * 繰り返しインスタンスのドラッグ移動にも対応
 */
export const usePlanOperations = () => {
  const utils = api.useUtils();
  const { updatePlan, deletePlan } = usePlanMutations();
  const { createInstance } = usePlanInstanceMutations();

  // プランリストをキャッシュ経由で参照
  const plansCache = utils.plans.list.getData();
  const plansCacheRef = useRef(plansCache);
  plansCacheRef.current = plansCache;

  // プラン削除ハンドラー
  const handlePlanDelete = useCallback(
    async (planId: string) => {
      try {
        deletePlan.mutate({ id: planId });
      } catch (error) {
        logger.error('プラン削除に失敗:', error);
      }
    },
    [deletePlan],
  );

  // プラン復元ハンドラー
  const handlePlanRestore = useCallback(async (_plan: CalendarPlan) => {
    // noop - planにはソフトデリート機能がないため、復元は未実装
  }, []);

  /**
   * 繰り返しインスタンスかどうかを判定し、必要な情報を抽出
   * ID形式: {parentPlanId}_{YYYY-MM-DD}
   */
  const parseRecurringInstanceId = useCallback((planId: string) => {
    // IDに_が含まれていて、最後の部分が日付形式かチェック
    const parts = planId.split('_');
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      // YYYY-MM-DD形式かチェック
      if (lastPart && /^\d{4}-\d{2}-\d{2}$/.test(lastPart)) {
        return {
          isRecurringInstance: true,
          parentPlanId: parts.slice(0, -1).join('_'),
          instanceDate: lastPart,
        };
      }
    }
    return {
      isRecurringInstance: false,
      parentPlanId: planId,
      instanceDate: null,
    };
  }, []);

  // プラン更新ハンドラー（ドラッグ&ドロップ用）
  // 繰り返しインスタンスの場合はmoved/modified例外を作成
  const handleUpdatePlan = useCallback(
    async (planIdOrPlan: string | CalendarPlan, updates?: { startTime: Date; endTime: Date }) => {
      try {
        // ドラッグ&ドロップからの呼び出し（planId + updates形式）
        if (typeof planIdOrPlan === 'string' && updates) {
          const planId = planIdOrPlan;
          const { isRecurringInstance, parentPlanId, instanceDate } =
            parseRecurringInstanceId(planId);

          if (isRecurringInstance && instanceDate) {
            // 繰り返しインスタンスの移動: moved/modified例外を作成
            const newDate = updates.startTime.toISOString().slice(0, 10);
            const isSameDate = instanceDate === newDate;

            logger.log('🔄 繰り返しインスタンスの移動:', {
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
              // moved例外の場合、新しい日付を記録
              ...(isSameDate ? {} : { originalDate: newDate }),
            });

            // キャッシュを更新
            utils.plans.list.invalidate();
            utils.plans.getInstances.invalidate();
          } else {
            // 通常プランの更新
            updatePlan.mutate({
              id: planId,
              data: {
                start_time: updates.startTime.toISOString(),
                end_time: updates.endTime.toISOString(),
              },
            });
          }
        }
        // CalendarPlanオブジェクト形式
        else if (typeof planIdOrPlan === 'object') {
          const updatedPlan = planIdOrPlan;

          // startDateがnullの場合は早期リターン
          if (!updatedPlan.startDate) {
            logger.error('❌ startDateがnullのため更新できません:', updatedPlan.id);
            return;
          }

          // 繰り返しインスタンスの判定
          const { isRecurringInstance, parentPlanId, instanceDate } = parseRecurringInstanceId(
            updatedPlan.id,
          );

          if (isRecurringInstance && instanceDate) {
            // 繰り返しインスタンスの移動
            const newDate = updatedPlan.startDate.toISOString().slice(0, 10);
            const isSameDate = instanceDate === newDate;

            logger.log('🔄 繰り返しインスタンスの移動 (CalendarPlan形式):', {
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
                start_time: updatedPlan.startDate.toISOString(),
                end_time: updatedPlan.endDate?.toISOString(),
              },
              ...(isSameDate ? {} : { originalDate: newDate }),
            });

            utils.plans.list.invalidate();
            utils.plans.getInstances.invalidate();
          } else {
            // 通常プランの更新
            logger.log('🔧 プラン更新 (CalendarPlan形式):', {
              planId: updatedPlan.id,
              newStartDate: updatedPlan.startDate.toISOString(),
              newEndDate: updatedPlan.endDate?.toISOString(),
            });

            updatePlan.mutate({
              id: updatedPlan.id,
              data: {
                start_time: updatedPlan.startDate.toISOString(),
                end_time: updatedPlan.endDate?.toISOString(),
              },
            });
          }
        }
      } catch (error) {
        logger.error('プラン更新に失敗:', error);
      }
    },
    [updatePlan, createInstance, parseRecurringInstanceId, utils],
  );

  // 30日経過したプランを自動削除
  useEffect(() => {
    // noop - Plans統合後に実装予定
  }, []);

  return {
    handlePlanDelete,
    handlePlanRestore,
    handleUpdatePlan,
  };
};
