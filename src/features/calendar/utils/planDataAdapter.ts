/**
 * プランデータ変換ユーティリティ
 * PlanStore形式 ↔ CalendarView形式の相互変換
 */

import type { Plan } from '@/features/plans/types/plan'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import type { TimedPlan } from '../components/views/shared/types/plan.types'

// 後方互換性のためのエイリアス
type Event = CalendarPlan
type TimedEvent = TimedPlan

/**
 * データベースPlan型のステータスをCalendarPlan型のステータスに変換
 */
function mapPlanStatusToCalendarStatus(
  status: string
): 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled' {
  switch (status) {
    case 'backlog':
      return 'inbox'
    case 'ready':
      return 'planned'
    case 'active':
      return 'in_progress'
    case 'done':
      return 'completed'
    case 'cancel':
      return 'cancelled'
    case 'wait':
      return 'planned' // 待ち状態は「計画済み」として扱う
    default:
      return 'inbox'
  }
}

/**
 * データベースPlan型をCalendarPlan型に変換
 */
export function planToCalendarPlan(plan: Plan): CalendarPlan {
  const startDate = plan.start_time ? new Date(plan.start_time) : new Date()
  const endDate = plan.end_time ? new Date(plan.end_time) : new Date()
  const createdAt = plan.created_at ? new Date(plan.created_at) : new Date()
  const updatedAt = plan.updated_at ? new Date(plan.updated_at) : new Date()

  // 複数日にまたがるかチェック
  const isMultiDay = (() => {
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    return endDay.getTime() > startDay.getTime()
  })()

  // 繰り返し設定があるかチェック
  const isRecurring = !!(plan.recurrence_type && plan.recurrence_type !== 'none')

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description || undefined,
    startDate,
    endDate,
    status: mapPlanStatusToCalendarStatus(plan.status),
    color: '#3b82f6', // デフォルトカラー
    plan_number: plan.plan_number,
    reminder_minutes: plan.reminder_minutes,
    tags: [], // タグは別途設定される
    createdAt,
    updatedAt,
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)), // minutes
    isMultiDay,
    isRecurring,
  }
}

/**
 * データベースPlan型の配列をCalendarPlan型の配列に変換
 */
export function plansToCalendarPlans(plans: Plan[]): CalendarPlan[] {
  return plans.map(planToCalendarPlan)
}

/**
 * Plan形式のプランをCalendarView形式に変換
 */
export function planToTimedPlan(plan: CalendarPlan): TimedPlan {
  return {
    ...plan,
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
  return plans.map(planToTimedPlan)
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
    ...plan,
    id: plan.id,
    title: plan.title,
    description: plan.description || '',
    color: plan.color || '#3b82f6',
    start: plan.startDate || now,
    end: plan.endDate || defaultEnd,
    isReadOnly: plan.status === 'completed' || plan.status === 'cancelled',
  } as TimedPlan
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
