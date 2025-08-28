import { useMemo } from 'react'
import { isSameDay, isValid } from 'date-fns'
import type { CalendarEvent } from '@/features/events'
import type { UseDayEventsOptions, UseDayEventsReturn, EventPosition } from '../DayView.types'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useEventLayoutCalculator } from '../../shared/hooks/useEventLayoutCalculator'
const EVENT_PADDING = 2 // イベント間のパディング
const MAX_COLUMNS = 6 // 最大同時イベント列数を拡張
const MIN_EVENT_HEIGHT = 20 // 最小イベント高さ

export function useDayEvents({ date, events }: UseDayEventsOptions): UseDayEventsReturn {
  // 当日のイベントのみフィルター
  const dayEvents = useMemo(() => {
    return events.filter(event => {
      if (!event.startDate || !isValid(new Date(event.startDate))) {
        return false
      }
      
      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })
  }, [date, events])

  // CalendarEventをuseEventLayoutCalculatorで期待される形式に変換
  const convertedEvents = useMemo(() => {
    return dayEvents.map(event => ({
      ...event,
      start: event.startDate!,
      end: event.endDate || new Date(new Date(event.startDate!).getTime() + 60 * 60 * 1000)
    }))
  }, [dayEvents])

  // 新しいレイアウト計算システムを使用
  const eventLayouts = useEventLayoutCalculator(convertedEvents, { notifyConflicts: true })

  // レイアウト情報をEventPositionに変換
  const eventPositions = useMemo(() => {
    return eventLayouts.map((layout, index) => {
      const startDate = new Date(layout.event.start)
      const endDate = new Date(layout.event.end)

      const startHour = startDate.getHours() + startDate.getMinutes() / 60
      const endHour = endDate.getHours() + endDate.getMinutes() / 60
      const duration = Math.max(endHour - startHour, 0.25) // 最小15分

      // 位置計算
      const top = startHour * HOUR_HEIGHT
      const height = Math.max(duration * HOUR_HEIGHT - EVENT_PADDING, MIN_EVENT_HEIGHT)

      console.log('🎨 イベント配置:', {
        タイトル: layout.event.title,
        カラム: layout.column,
        総カラム数: layout.totalColumns,
        幅: layout.width,
        左位置: layout.left,
        top,
        height
      })

      return {
        event: layout.event,
        top,
        height,
        left: layout.left,
        width: layout.width,
        zIndex: 10 + index,
        column: layout.column,
        totalColumns: layout.totalColumns,
        opacity: layout.totalColumns > 1 ? 0.95 : 1.0
      }
    })
  }, [eventLayouts])

  const maxConcurrentEvents = useMemo(() => {
    return Math.max(1, ...eventLayouts.map(layout => layout.totalColumns))
  }, [eventLayouts])

  return {
    dayEvents,
    eventPositions,
    maxConcurrentEvents,
    skippedEventsCount: 0 // 新しいシステムではスキップしない
  }
}