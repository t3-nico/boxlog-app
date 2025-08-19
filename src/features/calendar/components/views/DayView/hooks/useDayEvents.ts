import { useMemo } from 'react'
import { isSameDay, isValid } from 'date-fns'
import type { CalendarEvent } from '@/features/events'
import type { UseDayEventsOptions, UseDayEventsReturn, EventPosition } from '../DayView.types'

const HOUR_HEIGHT = 72 // 1時間の高さ（px）
const EVENT_PADDING = 2 // イベント間のパディング
const MAX_COLUMNS = 5 // 最大同時イベント列数
const MIN_EVENT_HEIGHT = 20 // 最小イベント高さ

export function useDayEvents({ date, events }: UseDayEventsOptions): UseDayEventsReturn {
  const { dayEvents, eventPositions, maxConcurrentEvents } = useMemo(() => {
    // 当日のイベントのみフィルター
    const filteredEvents = events.filter(event => {
      if (!event.startDate || !isValid(new Date(event.startDate))) {
        return false
      }
      
      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })

    // イベントを開始時刻でソート
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const aStart = new Date(a.startDate!)
      const bStart = new Date(b.startDate!)
      return aStart.getTime() - bStart.getTime()
    })

    // イベントの位置を計算
    const positions: EventPosition[] = []
    const eventColumns: Array<{ endTime: number; column: number }> = []

    sortedEvents.forEach((event, index) => {
      const startDate = new Date(event.startDate!)
      const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000) // デフォルト1時間

      const startHour = startDate.getHours() + startDate.getMinutes() / 60
      const endHour = endDate.getHours() + endDate.getMinutes() / 60
      const duration = Math.max(endHour - startHour, 0.25) // 最小15分

      // 位置計算
      const top = startHour * HOUR_HEIGHT
      const height = Math.max(duration * HOUR_HEIGHT - EVENT_PADDING, MIN_EVENT_HEIGHT)
      
      // 重複する列を見つける
      const startTime = startDate.getTime()
      const endTime = endDate.getTime()
      
      // 使用可能な列を見つける
      let column = 0
      for (let i = 0; i < eventColumns.length; i++) {
        if (eventColumns[i].endTime <= startTime) {
          column = eventColumns[i].column
          eventColumns[i] = { endTime, column }
          break
        }
        if (i === eventColumns.length - 1) {
          column = eventColumns.length
          if (column < MAX_COLUMNS) {
            eventColumns.push({ endTime, column })
          }
        }
      }
      
      if (eventColumns.length === 0) {
        column = 0
        eventColumns.push({ endTime, column })
      }

      // 同時実行イベント数を計算
      const concurrentEvents = eventColumns.filter(col => col.endTime > startTime).length
      const totalColumns = Math.min(concurrentEvents, MAX_COLUMNS)
      
      // 幅と左位置を計算
      const widthPercentage = Math.min(95 / totalColumns, 95) // 最大95%幅
      const leftPercentage = (column * widthPercentage) + 2.5 // 2.5%のマージン

      positions.push({
        event,
        top,
        height,
        left: leftPercentage,
        width: widthPercentage,
        zIndex: 10 + index,
        column,
        totalColumns
      })
    })

    const maxConcurrent = Math.max(1, Math.min(eventColumns.length, MAX_COLUMNS))

    return {
      dayEvents: sortedEvents,
      eventPositions: positions,
      maxConcurrentEvents: maxConcurrent
    }
  }, [date, events])

  return {
    dayEvents,
    eventPositions,
    maxConcurrentEvents
  }
}