/**
 * イベント日付グループ化統一フック
 * 6箇所で重複していた80-90行のロジックを統合
 */

import { useMemo } from 'react'

import { isSameDay } from 'date-fns'

import type { CalendarPlan } from '../types/base.types'
import { getDateKey, isValidEvent } from '../utils/dateHelpers'
import { sortAgendaEventsByDateKeys, sortEventsByDateKeys } from '../utils/planSorting'

export interface UseEventsByDateOptions {
  dates: Date[]
  events: CalendarPlan[]
  sortType?: 'standard' | 'agenda' // agenda = 終日イベント優先
}

export interface UseEventsByDateReturn {
  eventsByDate: Record<string, CalendarPlan[]>
  totalEvents: number
  hasEvents: boolean
}

/**
 * イベントを日付ごとにグループ化する統一フック
 *
 * @description
 * 以前は各ビューで80-90行の重複ロジックがあったが、これで統一
 * - WeekView, ThreeDayView, FiveDayView, AgendaView で共通使用
 * - マルチデイイベント対応
 * - 無効イベントの自動フィルタリング
 * - 時刻ソート（標準 or Agenda用）
 */
export function useEventsByDate({
  dates,
  events = [],
  sortType = 'standard',
}: UseEventsByDateOptions): UseEventsByDateReturn {
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarPlan[]> = {}

    // Step 1: 各日付のキーを初期化
    dates.forEach((date) => {
      const dateKey = getDateKey(date)
      grouped[dateKey] = []
    })

    // Step 2: イベントを適切な日付に配置
    events.forEach((event) => {
      if (!isValidEvent(event)) {
        return
      }

      // startDateがnullまたはundefinedの場合はスキップ
      if (!event.startDate) {
        return
      }

      // より柔軟な日付正規化
      const eventStart = event.startDate instanceof Date ? event.startDate : new Date(event.startDate)

      // 無効な日付は除外
      if (isNaN(eventStart.getTime())) {
        return
      }

      // マルチデイイベントの場合は複数日にまたがって表示
      if (event.isMultiDay && event.endDate) {
        const eventEnd = event.endDate instanceof Date ? event.endDate : new Date(event.endDate)

        if (!isNaN(eventEnd.getTime())) {
          // 期間内の日付のみ処理
          dates.forEach((date) => {
            if (date >= eventStart && date <= eventEnd) {
              const dateKey = getDateKey(date)
              if (grouped[dateKey]) {
                grouped[dateKey].push(event)
              }
            }
          })
          return
        }
      }

      // 単日イベントの場合
      dates.forEach((date) => {
        if (isSameDay(eventStart, date)) {
          const dateKey = getDateKey(date)
          if (grouped[dateKey]) {
            grouped[dateKey].push(event)
          }
        }
      })
    })

    // Step 3: 各日のイベントを適切にソート
    const sortedResult = sortType === 'agenda' ? sortAgendaEventsByDateKeys(grouped) : sortEventsByDateKeys(grouped)

    return sortedResult
  }, [dates, events, sortType])

  // 統計情報も提供
  const totalEvents = useMemo(() => {
    return Object.values(eventsByDate).reduce((total, dayEvents) => total + dayEvents.length, 0)
  }, [eventsByDate])

  const hasEvents = totalEvents > 0

  return {
    eventsByDate,
    totalEvents,
    hasEvents,
  }
}
