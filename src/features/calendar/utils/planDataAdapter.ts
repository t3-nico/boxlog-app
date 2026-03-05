/**
 * カレンダー固有のデータ変換ユーティリティ
 *
 * CalendarPlan のタイムゾーン適用やイベントタイプ判定を行う。
 */

import { convertToTimezone } from '@/lib/date/timezone';

import type { CalendarPlan } from '../types/calendar.types';

/**
 * CalendarPlan の displayStartDate/displayEndDate をユーザーTZに変換
 * Records は変換しない（壁時計時刻のため）
 */
export function applyTimezoneToDisplayDates(plan: CalendarPlan, timezone: string): CalendarPlan {
  if (plan.origin === 'unplanned' || !plan.startDate) {
    return plan;
  }
  return {
    ...plan,
    displayStartDate: convertToTimezone(plan.startDate, timezone),
    displayEndDate: plan.endDate ? convertToTimezone(plan.endDate, timezone) : plan.displayEndDate,
  };
}

/**
 * CalendarPlanがRecordかどうかを判定
 * type === 'record' の場合はRecord（origin='unplanned' に対応）
 */
export function isRecordEvent(event: Pick<CalendarPlan, 'type'> | null | undefined): boolean {
  if (!event) return false;
  return event.type === 'record';
}

/**
 * CalendarPlanのイベントタイプを取得
 * Record の場合は 'record'、それ以外は 'plan'
 */
export function getEventType(
  event: Pick<CalendarPlan, 'type'> | null | undefined,
): 'record' | 'plan' {
  return isRecordEvent(event) ? 'record' : 'plan';
}
