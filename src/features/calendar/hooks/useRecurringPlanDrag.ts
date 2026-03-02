'use client';

/**
 * 繰り返しプランのドラッグ移動フック
 *
 * 繰り返しインスタンスのドラッグ移動時にスコープ選択ダイアログを表示し、
 * 選択に応じて適切な更新処理を行う（Googleカレンダー準拠）
 *
 * entries 統合: Plan/Record 区別なし、全エントリに同じ更新ロジックを適用
 */

import { useCallback, useRef } from 'react';

import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useRecurringScopeMutations } from '@/hooks/useRecurringScopeMutations';
import { logger } from '@/lib/logger';
import type { RecurringEditScope } from '@/stores/useRecurringEditConfirmStore';
import { useRecurringEditConfirmStore } from '@/stores/useRecurringEditConfirmStore';

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
  const { updateEntry } = useEntryMutations();
  const { applyEdit } = useRecurringScopeMutations();

  // 保留中のドラッグ更新（refで保持してダイアログのコールバックで参照）
  const pendingDragUpdateRef = useRef<PendingDragUpdate | null>(null);

  // グローバルストアのopenDialog
  const openDialog = useRecurringEditConfirmStore((state) => state.openDialog);

  /**
   * スコープ選択後の処理
   */
  const handleScopeConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const pendingDragUpdate = pendingDragUpdateRef.current;
      if (!pendingDragUpdate) return;

      const { plan, updates } = pendingDragUpdate;
      const parentPlanId = plan.originalPlanId!;
      const instanceDate = plan.instanceDate!;
      const newDate = updates.startTime.toISOString().slice(0, 10);

      try {
        await applyEdit({
          scope,
          planId: parentPlanId,
          instanceDate,
          changes: {
            start_time: updates.startTime.toISOString(),
            end_time: updates.endTime.toISOString(),
          },
          targetDate: newDate,
        });
      } catch (error) {
        logger.error('繰り返しプランの更新に失敗:', error);
      } finally {
        pendingDragUpdateRef.current = null;
      }
    },
    [applyEdit],
  );

  /**
   * エントリ更新ハンドラー（ドラッグ&ドロップ用）
   * 繰り返しインスタンスの場合はダイアログを表示
   */
  const handleUpdatePlan = useCallback(
    async (
      planIdOrPlan: string | CalendarPlan,
      updates?: { startTime: Date; endTime: Date },
    ): Promise<{ skipToast: true } | void> => {
      let plan: CalendarPlan | undefined;
      let resolvedUpdates: { startTime: Date; endTime: Date } | undefined;

      if (typeof planIdOrPlan === 'string' && updates) {
        plan = plans.find((p) => p.id === planIdOrPlan);
        resolvedUpdates = updates;
      } else if (typeof planIdOrPlan === 'object') {
        plan = planIdOrPlan;
        if (plan.startDate && plan.endDate) {
          resolvedUpdates = {
            startTime: plan.startDate,
            endTime: plan.endDate,
          };
        }
      }

      if (!plan) {
        logger.warn('Entry not found for update:', planIdOrPlan);
        return;
      }

      if (!resolvedUpdates) {
        logger.warn('No updates provided for entry:', plan.id);
        return;
      }

      // 繰り返しインスタンスかどうか判定
      const isRecurringInstance = plan.isRecurring && plan.originalPlanId && plan.instanceDate;

      if (isRecurringInstance) {
        pendingDragUpdateRef.current = { plan, updates: resolvedUpdates };
        openDialog(plan.title, 'edit', handleScopeConfirm);
        return { skipToast: true };
      } else {
        // 通常エントリ: 直接更新
        updateEntry.mutate({
          id: plan.id,
          data: {
            start_time: resolvedUpdates.startTime.toISOString(),
            end_time: resolvedUpdates.endTime.toISOString(),
          },
        });
      }
    },
    [plans, updateEntry, openDialog, handleScopeConfirm],
  );

  return {
    handleUpdatePlan,
  };
}
