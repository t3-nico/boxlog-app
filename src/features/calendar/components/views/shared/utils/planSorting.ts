/**
 * イベントソートユーティリティ
 * 全ビューで共通使用される重複ソート処理をまとめる
 */

import type { CalendarPlan } from '../types/plan.types'

/**
 * イベントを時刻順でソート（基本パターン）
 * WeekView, ThreeDayView, FiveDayView で使用
 */
export function sortEventsByTime(events: CalendarPlan[]): CalendarPlan[] {
  return [...events].sort((a, b) => {
    const aTime = a.startDate ? a.startDate.getTime() : 0
    const bTime = b.startDate ? b.startDate.getTime() : 0
    return aTime - bTime
  })
}

/**
 * 日付キーごとのイベントをソート
 * Record<string, CalendarPlan[]>形式のデータで使用
 */
export function sortEventsByDateKeys(eventsByDate: Record<string, CalendarPlan[]>): Record<string, CalendarPlan[]> {
  const sorted = { ...eventsByDate }

  Object.keys(sorted).forEach((dateKey) => {
    sorted[dateKey] = sortEventsByTime(sorted[dateKey]!)
  })

  return sorted
}

/**
 * AgendaView用の高度なソート
 * 終日イベントを最初に、その後時刻順
 */
export function sortEventsForAgenda(events: CalendarPlan[]): CalendarPlan[] {
  return [...events].sort((a, b) => {
    // 終日イベントを最初に
    const aIsAllDay = !a.startDate || (a.startDate.getHours() === 0 && a.startDate.getMinutes() === 0)
    const bIsAllDay = !b.startDate || (b.startDate.getHours() === 0 && b.startDate.getMinutes() === 0)

    if (aIsAllDay && !bIsAllDay) return -1
    if (!aIsAllDay && bIsAllDay) return 1

    // 両方とも終日または両方とも時間指定の場合、時刻順でソート
    const aTime = a.startDate ? a.startDate.getTime() : 0
    const bTime = b.startDate ? b.startDate.getTime() : 0
    return aTime - bTime
  })
}

/**
 * 日付キーごとのイベントをAgenda用ソート
 */
export function sortAgendaEventsByDateKeys(
  eventsByDate: Record<string, CalendarPlan[]>
): Record<string, CalendarPlan[]> {
  const sorted = { ...eventsByDate }

  Object.keys(sorted).forEach((dateKey) => {
    sorted[dateKey] = sortEventsForAgenda(sorted[dateKey]!)
  })

  return sorted
}
