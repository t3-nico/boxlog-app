/**
 * プランデータ変換ユーティリティ
 * PlanStore形式 ↔ CalendarView形式の相互変換
 *
 * Plan→CalendarEvent / Record→CalendarEvent の変換は各featureのアダプターに移動済み。
 * このファイルはCalendar固有の変換（TimedPlan変換、タイムゾーン適用等）を保持し、
 * 後方互換性のために移動した関数を再エクスポートする。
 */

import { convertToTimezone } from '@/lib/date/timezone';

import type { CalendarPlan } from '../types/calendar.types';

import type { TimedPlan } from '../components/views/shared/types/plan.types';

// ========================================
// Plans feature アダプターからの再エクスポート（後方互換性）
// ========================================
export {
  expandRecurringPlansToCalendarPlans,
  plansToCalendarPlans,
  planToCalendarPlan,
} from '@/lib/plan-adapter';

export type { ExpandedOccurrence, PlanInstanceException } from '@/lib/plan-adapter';

// ========================================
// Records feature アダプターからの再エクスポート（後方互換性）
// ========================================
export {
  recordsToCalendarEvents as recordsToCalendarPlans,
  recordToCalendarEvent as recordToCalendarPlan,
} from '@/lib/record-adapter';

export type { RecordWithPlanInfo } from '@/lib/record-adapter';

// ========================================
// Calendar固有の変換ロジック
// ========================================

/**
 * Plan形式のプランをCalendarView形式に変換
 */
export function planToTimedPlan(plan: CalendarPlan): TimedPlan {
  return {
    ...plan,
    start: plan.startDate || new Date(),
    end: plan.endDate || new Date(),
    isReadOnly: plan.status === 'closed',
  };
}

/**
 * 複数のPlan形式プランをCalendarView形式に変換
 */
export function plansToTimedPlans(plans: CalendarPlan[]): TimedPlan[] {
  return plans.map(planToTimedPlan);
}

/**
 * CalendarView形式のプランをPlan形式に変換（部分的）
 */
export function timedPlanToPlanUpdate(timedPlan: TimedPlan): Partial<CalendarPlan> {
  return {
    id: timedPlan.id,
    title: timedPlan.title,
    description: timedPlan.description,
    startDate: timedPlan.start,
    endDate: timedPlan.end,
    color: timedPlan.color,
  };
}

/**
 * カレンダービューで使用するための安全な変換
 * undefinedやnullの場合のフォールバック付き
 */
export function safePlanToTimedPlan(plan: Partial<CalendarPlan>): TimedPlan | null {
  if (!plan.id || !plan.title) {
    return null;
  }

  const now = new Date();
  const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000); // 1時間後

  return {
    ...plan,
    id: plan.id,
    title: plan.title,
    description: plan.description || '',
    color: plan.color || '#3b82f6',
    start: plan.startDate || now,
    end: plan.endDate || defaultEnd,
    isReadOnly: plan.status === 'closed',
  } as TimedPlan;
}

/**
 * プランリストの安全な変換（nullを除外）
 */
export function safePlansToTimedPlans(
  plans: (CalendarPlan | Partial<CalendarPlan>)[],
): TimedPlan[] {
  return plans.map(safePlanToTimedPlan).filter((plan): plan is TimedPlan => plan !== null);
}

/**
 * CalendarPlan の displayStartDate/displayEndDate をユーザーTZに変換
 * Records は変換しない（壁時計時刻のため）
 */
export function applyTimezoneToDisplayDates(plan: CalendarPlan, timezone: string): CalendarPlan {
  if (isRecordEvent(plan) || !plan.startDate) {
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
 * type === 'record' または recordId が存在する場合はRecord
 */
export function isRecordEvent(
  event: Pick<CalendarPlan, 'type' | 'recordId'> | null | undefined,
): boolean {
  if (!event) return false;
  return event.type === 'record' || !!event.recordId;
}

/**
 * CalendarPlanのイベントタイプを取得
 * Record の場合は 'record'、それ以外は 'plan'
 */
export function getEventType(
  event: Pick<CalendarPlan, 'type' | 'recordId'> | null | undefined,
): 'record' | 'plan' {
  return isRecordEvent(event) ? 'record' : 'plan';
}
