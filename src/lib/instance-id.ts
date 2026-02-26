/**
 * 繰り返しインスタンスID ユーティリティ
 *
 * CalendarPlan の合成ID（{parentPlanId}_{YYYY-MM-DD}）の
 * エンコード・デコードを型安全に行う。
 */

import type { CalendarPlan } from '@/core/types/calendar-event';

export interface RecurrenceInstanceRef {
  parentPlanId: string;
  instanceDate: string; // YYYY-MM-DD
}

const SEPARATOR = '_';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 親プランIDとインスタンス日付から合成IDを生成
 */
export function encodeInstanceId(parentPlanId: string, instanceDate: string): string {
  return `${parentPlanId}${SEPARATOR}${instanceDate}`;
}

/**
 * 合成IDから親プランIDとインスタンス日付を復元
 * 合成IDでない場合は null を返す
 */
export function decodeInstanceId(compositeId: string): RecurrenceInstanceRef | null {
  const lastSepIndex = compositeId.lastIndexOf(SEPARATOR);
  if (lastSepIndex === -1) return null;

  const datePart = compositeId.slice(lastSepIndex + 1);
  if (!DATE_PATTERN.test(datePart)) return null;

  const parentPlanId = compositeId.slice(0, lastSepIndex);
  if (!parentPlanId) return null;

  return { parentPlanId, instanceDate: datePart };
}

/**
 * CalendarPlan からインスタンス情報を安全に取得
 *
 * 以下の優先順位で解決:
 * 1. originalPlanId + instanceDate（明示的フィールド）
 * 2. calendarId + ID末尾の日付パース（後方互換）
 * 3. calendarId + startDate（最終フォールバック）
 */
export function getInstanceRef(plan: CalendarPlan): RecurrenceInstanceRef | null {
  // 1. 明示的フィールドから取得
  if (plan.originalPlanId && plan.instanceDate) {
    return {
      parentPlanId: plan.originalPlanId,
      instanceDate: plan.instanceDate,
    };
  }

  // 2. 合成IDからデコード
  const decoded = decodeInstanceId(plan.id);
  if (decoded) {
    return {
      parentPlanId: plan.calendarId || decoded.parentPlanId,
      instanceDate: decoded.instanceDate,
    };
  }

  // 3. calendarId + startDate フォールバック
  const parentId = plan.calendarId || plan.originalPlanId;
  if (parentId && plan.startDate) {
    return {
      parentPlanId: parentId,
      instanceDate: plan.startDate.toISOString().slice(0, 10),
    };
  }

  return null;
}
