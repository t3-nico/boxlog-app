'use client';

/**
 * 繰り返しプランのドラッグ移動ハンドラー
 *
 * 繰り返しインスタンスのドラッグ移動時に:
 * - moved例外を作成して特定インスタンスのみ移動
 * - 通常プランは従来通り更新
 */

import { useCallback } from 'react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { usePlanInstanceMutations } from '@/features/plans/hooks/usePlanInstances';
import { api } from '@/lib/trpc';

interface UseRecurringPlanDragHandlerOptions {
  /** プラン更新ハンドラー（通常プラン用） */
  onPlanUpdate?: (
    planId: string,
    updates: { startTime: Date; endTime: Date },
  ) => Promise<void> | void;
  /** カレンダープラン配列 */
  plans: CalendarPlan[];
}

export function useRecurringPlanDragHandler({
  onPlanUpdate,
  plans,
}: UseRecurringPlanDragHandlerOptions) {
  const utils = api.useUtils();
  const { createInstance } = usePlanInstanceMutations();

  /**
   * プランのドラッグ移動を処理
   * - 繰り返しインスタンス: moved例外を作成
   * - 通常プラン: onPlanUpdateを呼び出し
   */
  const handlePlanDragUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      // プランを取得
      const plan = plans.find((p) => p.id === planId);

      if (!plan) {
        // プランが見つからない場合は通常更新
        if (onPlanUpdate) {
          await onPlanUpdate(planId, updates);
        }
        return;
      }

      // 繰り返しインスタンスかどうかを判定
      // - isRecurringがtrue
      // - originalPlanIdが設定されている（親プランID）
      // - instanceDateが設定されている（インスタンス日付）
      const isRecurringInstance = plan.isRecurring && plan.originalPlanId && plan.instanceDate;

      if (isRecurringInstance) {
        // 繰り返しインスタンスの場合: moved例外を作成
        const parentPlanId = plan.originalPlanId!;
        const originalDate = plan.instanceDate!;
        const newDate = updates.startTime.toISOString().slice(0, 10);

        // 元の日付と新しい日付が同じ場合は時刻変更のみ（modified例外）
        const isSameDate = originalDate === newDate;

        await createInstance.mutateAsync({
          planId: parentPlanId,
          instanceDate: originalDate,
          exceptionType: isSameDate ? 'modified' : 'moved',
          overrides: {
            start_time: updates.startTime.toISOString(),
            end_time: updates.endTime.toISOString(),
          },
          // moved例外の場合、新しい日付も記録
          ...(isSameDate ? {} : { originalDate: newDate }),
        });

        // キャッシュを更新
        utils.plans.list.invalidate();
        utils.plans.getInstances.invalidate();
      } else {
        // 通常プランの場合: 従来通り更新
        if (onPlanUpdate) {
          await onPlanUpdate(planId, updates);
        }
      }
    },
    [plans, onPlanUpdate, createInstance, utils],
  );

  return {
    handlePlanDragUpdate,
  };
}
