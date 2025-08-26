import { useMemo } from 'react'
import { isSaturday, isSunday, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { CalendarEvent } from '@/features/events/types/events'

/**
 * 週末のイベント数をカウントするフック
 * @param events 全イベントリスト
 * @param dateRange 表示中の日付範囲
 * @returns 週末に該当するイベント数
 */
export function useWeekendEventNotification(
  events: CalendarEvent[],
  dateRange: { start: Date; end: Date }
) {
  const hiddenWeekendEventCount = useMemo(() => {
    if (!events || events.length === 0) return 0
    
    const rangeStart = startOfDay(dateRange.start)
    const rangeEnd = endOfDay(dateRange.end)
    
    return events.filter(event => {
      if (!event.startDate) return false
      
      const eventDate = event.startDate
      
      // イベントが現在の表示範囲内にあるかチェック
      const isInRange = isWithinInterval(eventDate, {
        start: rangeStart,
        end: rangeEnd
      })
      
      if (!isInRange) return false
      
      // 週末（土曜・日曜）かチェック
      const isWeekend = isSaturday(eventDate) || isSunday(eventDate)
      
      return isWeekend
    }).length
  }, [events, dateRange.start, dateRange.end])

  return hiddenWeekendEventCount
}

/**
 * 週をまたぐイベントの詳細情報を取得するフック
 * @param events 全イベントリスト
 * @param dateRange 表示中の日付範囲
 * @returns 週をまたぐイベントの情報
 */
export function useCrossWeekEvents(
  events: CalendarEvent[],
  dateRange: { start: Date; end: Date }
) {
  const crossWeekEvents = useMemo(() => {
    return events.filter(event => {
      if (!event.startDate || !event.endDate) return false
      
      const eventStart = startOfDay(event.startDate)
      const eventEnd = startOfDay(event.endDate)
      
      // イベントが複数日にわたるかチェック
      const isMultiDay = eventStart.getTime() !== eventEnd.getTime()
      if (!isMultiDay) return false
      
      // 金曜から月曜、または週末を含む複数日イベント
      const startsOnFriday = event.startDate.getDay() === 5
      const endsOnMonday = event.endDate.getDay() === 1
      const includesWeekend = 
        isSaturday(event.startDate) || isSunday(event.startDate) ||
        isSaturday(event.endDate) || isSunday(event.endDate)
      
      return (startsOnFriday && endsOnMonday) || includesWeekend
    }).map(event => ({
      ...event,
      weekdayPortion: {
        // 平日部分のみを計算
        start: event.startDate,
        end: event.endDate
      }
    }))
  }, [events, dateRange])

  return crossWeekEvents
}