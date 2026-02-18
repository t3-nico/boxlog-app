'use client';

/**
 * 繰り返しプランのドラッグ移動フック
 *
 * 繰り返しインスタンスのドラッグ移動時にスコープ選択ダイアログを表示し、
 * 選択に応じて適切な更新処理を行う（Googleカレンダー準拠）
 */

import { useCallback, useRef } from 'react';

import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useRecurringScopeMutations } from '@/features/plans/hooks/useRecurringScopeMutations';
import { useRecurringEditConfirmStore } from '@/features/plans/stores/useRecurringEditConfirmStore';
import { useRecordMutations } from '@/features/records/hooks/useRecordMutations';
import { logger } from '@/lib/logger';

import type { CalendarPlan } from '../types/calendar.types';
import { isRecordEvent } from '../utils/planDataAdapter';

interface PendingDragUpdate {
  plan: CalendarPlan;
  updates: { startTime: Date; endTime: Date };
}

interface UseRecurringPlanDragOptions {
  /** 全プラン配列（繰り返しインスタンス情報を含む） */
  plans: CalendarPlan[];
}

export function useRecurringPlanDrag({ plans }: UseRecurringPlanDragOptions) {
  const { updatePlan } = usePlanMutations();
  const { updateRecord } = useRecordMutations();
  const { applyEdit } = useRecurringScopeMutations();

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

      try {
        await applyEdit({
          scope,
          planId: parentPlanId,
          instanceDate,
          overrides: {
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
   * プラン更新ハンドラー（ドラッグ&ドロップ用）
   * 繰り返しインスタンスの場合はダイアログを表示
   *
   * BaseViewProps の onUpdatePlan と互換性のある型シグネチャ:
   * - (planId: string, updates: { startTime: Date; endTime: Date }) - ドラッグ用
   * - (plan: CalendarPlan) - カレンダーオブジェクト形式
   *
   * Note: 繰り返しプラン編集時は { skipToast: true } を返し、
   * 呼び出し元でtoast表示をスキップする
   */
  const handleUpdatePlan = useCallback(
    async (
      planIdOrPlan: string | CalendarPlan,
      updates?: { startTime: Date; endTime: Date },
    ): Promise<{ skipToast: true } | void> => {
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

      // Recordかどうか判定
      const isRecord = isRecordEvent(plan);

      if (isRecord) {
        // Recordの場合: Record更新mutationを使用
        const recordId = plan.recordId;
        if (!recordId) {
          logger.warn('Record ID not found for update:', plan.id);
          return;
        }

        // worked_at は startTime から取得（YYYY-MM-DD）
        const workedAt = resolvedUpdates.startTime.toISOString().slice(0, 10);
        // start_time, end_time は HH:MM:SS 形式
        const startTime = resolvedUpdates.startTime.toTimeString().slice(0, 8);
        const endTime = resolvedUpdates.endTime.toTimeString().slice(0, 8);
        // duration_minutes を計算
        const durationMs = resolvedUpdates.endTime.getTime() - resolvedUpdates.startTime.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));

        updateRecord.mutate({
          id: recordId,
          data: {
            worked_at: workedAt,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: durationMinutes,
          },
        });
        return;
      }

      // 繰り返しインスタンスかどうか判定
      const isRecurringInstance = plan.isRecurring && plan.originalPlanId && plan.instanceDate;

      if (isRecurringInstance) {
        // 繰り返しインスタンスの場合: ダイアログを表示
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
    [plans, updatePlan, updateRecord, openDialog, handleScopeConfirm],
  );

  return {
    // 更新ハンドラー
    handleUpdatePlan,
  };
}
