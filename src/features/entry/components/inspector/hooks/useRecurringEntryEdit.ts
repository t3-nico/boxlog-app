'use client';

/**
 * 繰り返しエントリ編集フック
 *
 * 繰り返しインスタンスの編集時にスコープ選択ダイアログを表示し、
 * 選択されたスコープに応じて適切な更新処理を行う
 *
 * グローバルダイアログ（RecurringEditConfirmDialog）を使用
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import { isRecurringEntry } from '@/lib/entry-recurrence';
import { logger } from '@/lib/logger';
import { openRecurringEditConfirm, type RecurringEditScope } from '@/stores/useModalStore';
import { useRecurringScopeMutations } from '../../../hooks/useRecurringScopeMutations';

import type { EntryWithTags } from '@/types/entry';

// オーバーライド可能なフィールド
type OverrideableField = 'title' | 'description' | 'start_time' | 'end_time';

interface PendingChanges {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
}

interface UseRecurringEntryEditOptions {
  plan: EntryWithTags | null;
  planId: string | null;
  instanceDate: string | null;
}

export function useRecurringEntryEdit({
  plan,
  planId,
  instanceDate,
}: UseRecurringEntryEditOptions) {
  const { applyEdit } = useRecurringScopeMutations();

  // 繰り返しインスタンスかどうか
  const isRecurringInstance = useMemo(() => {
    if (!plan || !instanceDate) return false;
    // 繰り返し設定があり、かつインスタンス日付が指定されている
    return isRecurringEntry(plan);
  }, [plan, instanceDate]);

  // 保留中の変更
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});
  const pendingChangesRef = useRef<PendingChanges>({});
  const pendingFieldRef = useRef<{ field: OverrideableField; value: string | undefined } | null>(
    null,
  );

  // planIdが変わったときに状態をリセット（React推奨: レンダー中のstate調整）
  const [prevPlanId, setPrevPlanId] = useState(planId);
  if (planId !== prevPlanId) {
    setPrevPlanId(planId);
    setPendingChanges({});
    // eslint-disable-next-line react-hooks/refs -- React推奨のrender中state調整に伴うref同期
    pendingChangesRef.current = {};
    // eslint-disable-next-line react-hooks/refs
    pendingFieldRef.current = null;
  }

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
      const changesToApply: PendingChanges = singleChange
        ? ({ [singleChange.field]: singleChange.value } as PendingChanges)
        : pendingChangesRef.current;

      if (Object.keys(changesToApply).length === 0) {
        pendingFieldRef.current = null;
        return;
      }

      try {
        await applyEdit({
          scope,
          planId,
          instanceDate,
          changes: changesToApply,
        });

        // 成功したら保留中の変更をクリア
        setPendingChanges({});
        pendingChangesRef.current = {};
        pendingFieldRef.current = null;
      } catch (error) {
        logger.error('Failed to apply recurring edit:', error);
      }
    },
    [planId, instanceDate, applyEdit],
  );

  /**
   * スコープ選択ダイアログを開く（グローバルダイアログを使用）
   */
  const openScopeDialog = useCallback(
    (field?: OverrideableField, value?: string | undefined) => {
      if (field !== undefined) {
        pendingFieldRef.current = { field, value };
      }
      openRecurringEditConfirm(plan?.title ?? '', 'edit', handleScopeConfirm);
    },
    [plan?.title, handleScopeConfirm],
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
