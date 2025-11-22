/**
 * プランデータ変換ユーティリティ
 * PlanStore形式 ↔ CalendarView形式の相互変換
 */

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import type { TimedPlan } from '../components/views/shared/types/plan.types'

// 後方互換性のためのエイリアス
type Event = CalendarPlan
type TimedEvent = TimedPlan

/**
 * Plan形式のプランをCalendarView形式に変換
 */
export function planToTimedPlan(plan: CalendarPlan): TimedPlan {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    color: plan.color,
    start: plan.startDate || new Date(),
    end: plan.endDate || new Date(),
    isReadOnly: plan.status === 'completed' || plan.status === 'cancelled',
  }
}

// 後方互換性のためのエイリアス
/** @deprecated Use planToTimedPlan instead */
export function eventToTimedEvent(event: Event): TimedEvent {
  return planToTimedPlan(event)
}

/**
 * 複数のPlan形式プランをCalendarView形式に変換
 */
export function plansToTimedPlans(plans: CalendarPlan[]): TimedPlan[] {
  return plans
    .filter((plan) => !plan.isDeleted) // 削除済みプランを除外
    .map(planToTimedPlan)
}

// 後方互換性のためのエイリアス
/** @deprecated Use plansToTimedPlans instead */
export function eventsToTimedEvents(events: Event[]): TimedEvent[] {
  return plansToTimedPlans(events)
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
  }
}

// 後方互換性のためのエイリアス
/** @deprecated Use timedPlanToPlanUpdate instead */
export function timedEventToEventUpdate(timedEvent: TimedEvent): Partial<Event> {
  return timedPlanToPlanUpdate(timedEvent)
}

/**
 * カレンダービューで使用するための安全な変換
 * undefinedやnullの場合のフォールバック付き
 */
export function safePlanToTimedPlan(plan: Partial<CalendarPlan>): TimedPlan | null {
  if (!plan.id || !plan.title) {
    return null
  }

  const now = new Date()
  const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000) // 1時間後

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description || '',
    color: plan.color || '#3b82f6',
    start: plan.startDate || now,
    end: plan.endDate || defaultEnd,
    isReadOnly: plan.status === 'completed' || plan.status === 'cancelled',
  }
}

// 後方互換性のためのエイリアス
/** @deprecated Use safePlanToTimedPlan instead */
export function safeEventToTimedEvent(event: Partial<Event>): TimedEvent | null {
  return safePlanToTimedPlan(event)
}

/**
 * プランリストの安全な変換（nullを除外）
 */
export function safePlansToTimedPlans(plans: (CalendarPlan | Partial<CalendarPlan>)[]): TimedPlan[] {
  return plans.map(safePlanToTimedPlan).filter((plan): plan is TimedPlan => plan !== null)
}

// 後方互換性のためのエイリアス
/** @deprecated Use safePlansToTimedPlans instead */
export function safeEventsToTimedEvents(events: (Event | Partial<Event>)[]): TimedEvent[] {
  return safePlansToTimedPlans(events)
}
