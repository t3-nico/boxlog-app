/**
 * プランデータ変換ユーティリティ
 * PlanStore形式 ↔ CalendarView形式の相互変換
 */

import { MS_PER_MINUTE } from '@/constants/time'
import type { Plan } from '@/features/plans/types/plan'
import {
  expandRecurrence,
  isRecurringPlan,
  type ExpandedOccurrence,
  type PlanInstanceException,
} from '@/features/plans/utils/recurrence'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import type { TimedPlan } from '../components/views/shared/types/plan.types'

// 後方互換性のためのエイリアス
type Event = CalendarPlan
type TimedEvent = TimedPlan

/**
 * データベースPlan型のステータスをCalendarPlan型のステータスに変換
 * 3段階ステータス: todo, doing, done
 */
function mapPlanStatusToCalendarStatus(status: string): 'todo' | 'doing' | 'done' {
  switch (status) {
    case 'todo':
      return 'todo'
    case 'doing':
      return 'doing'
    case 'done':
      return 'done'
    default:
      return 'todo'
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
    duration: Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_MINUTE), // minutes
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
    isReadOnly: plan.status === 'done',
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
    isReadOnly: plan.status === 'done',
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

/**
 * 繰り返しプランを展開してCalendarPlan配列に変換
 *
 * @param plans - プラン配列
 * @param rangeStart - 表示範囲の開始日
 * @param rangeEnd - 表示範囲の終了日
 * @param exceptions - DBから取得した例外情報のマップ（planId -> exceptions）
 * @returns 展開されたCalendarPlan配列
 */
export function expandRecurringPlansToCalendarPlans(
  plans: Plan[],
  rangeStart: Date,
  rangeEnd: Date,
  exceptionsMap: Map<string, PlanInstanceException[]> = new Map()
): CalendarPlan[] {
  const result: CalendarPlan[] = []

  for (const plan of plans) {
    if (isRecurringPlan(plan)) {
      // 繰り返しプランを展開
      const exceptions = exceptionsMap.get(plan.id) ?? []
      const occurrences = expandRecurrence(plan, rangeStart, rangeEnd, exceptions)

      for (const occurrence of occurrences) {
        // 各オカレンスをCalendarPlanに変換
        const calendarPlan = occurrenceToCalendarPlan(plan, occurrence)
        result.push(calendarPlan)
      }
    } else {
      // 通常プランはそのまま変換
      result.push(planToCalendarPlan(plan))
    }
  }

  return result
}

/**
 * オカレンスをCalendarPlanに変換
 */
function occurrenceToCalendarPlan(basePlan: Plan, occurrence: ExpandedOccurrence): CalendarPlan {
  const createdAt = basePlan.created_at ? new Date(basePlan.created_at) : new Date()
  const updatedAt = basePlan.updated_at ? new Date(basePlan.updated_at) : new Date()

  // オカレンスの日時を計算
  let startDate: Date
  let endDate: Date

  if (occurrence.startTime && occurrence.endTime) {
    // 時刻が指定されている場合
    const [startHour, startMin] = occurrence.startTime.split(':').map(Number)
    const [endHour, endMin] = occurrence.endTime.split(':').map(Number)

    startDate = new Date(occurrence.date)
    startDate.setHours(startHour ?? 0, startMin ?? 0, 0, 0)

    endDate = new Date(occurrence.date)
    endDate.setHours(endHour ?? 0, endMin ?? 0, 0, 0)
  } else {
    // 終日イベント
    startDate = new Date(occurrence.date)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(occurrence.date)
    endDate.setHours(23, 59, 59, 999)
  }

  // オーバーライドがある場合は適用
  const overrides = occurrence.overrides ?? {}
  const title = (overrides.title as string) ?? basePlan.title
  const description = (overrides.description as string) ?? basePlan.description

  // 一意のIDを生成（元プランID + 日付）
  const instanceId = `${basePlan.id}_${occurrence.date.toISOString().slice(0, 10)}`

  return {
    id: instanceId,
    title,
    description: description || undefined,
    startDate,
    endDate,
    status: mapPlanStatusToCalendarStatus(basePlan.status),
    color: '#3b82f6',
    plan_number: basePlan.plan_number,
    reminder_minutes: basePlan.reminder_minutes,
    tags: [],
    createdAt,
    updatedAt,
    displayStartDate: startDate,
    displayEndDate: endDate,
    duration: Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_MINUTE),
    isMultiDay: false,
    isRecurring: true,
    // 繰り返し用の追加プロパティ
    calendarId: basePlan.id, // 元プランIDを保持
  }
}

// 型をエクスポート
export type { ExpandedOccurrence, PlanInstanceException }
