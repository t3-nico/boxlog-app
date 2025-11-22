// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import { useMemo } from 'react'

import { isSameDay, isValid } from 'date-fns'

// import type { CalendarEvent } from '@/features/calendar/types/calendar.types'

import { HOUR_HEIGHT } from '../constants/grid.constants'

import { useEventLayoutCalculator } from './usePlanLayoutCalculator'

const EVENT_PADDING = 2 // イベント間のパディング
const MIN_EVENT_HEIGHT = 20 // 最小イベント高さ

interface UseViewEventsOptions {
  date: Date
  events: CalendarEvent[]
}

export interface EventPosition {
  event: CalendarEvent // CalendarEventを拡張した形式
  top: number
  height: number
  left: number
  width: number
  zIndex: number
  column: number
  totalColumns: number
  opacity?: number
}

interface UseViewEventsReturn {
  dayEvents: CalendarEvent[]
  eventPositions: EventPosition[]
  maxConcurrentEvents: number
  skippedEventsCount: number
}

/**
 * 汎用的なビューイベント処理フック
 * DayView, WeekView等で共通利用可能
 */
export function useViewEvents({ date, events }: UseViewEventsOptions): UseViewEventsReturn {
  // 指定日のイベントのみフィルター
  const dayEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event.startDate || !isValid(new Date(event.startDate))) {
        return false
      }

      const eventDate = new Date(event.startDate)
      return isSameDay(eventDate, date)
    })
  }, [date, events])

  // CalendarEventをuseEventLayoutCalculatorで期待される形式に変換
  const convertedEvents = useMemo(() => {
    return dayEvents.map((event) => ({
      ...event,
      start: event.startDate!,
      end: event.endDate || new Date(new Date(event.startDate!).getTime() + 60 * 60 * 1000),
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
        height,
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
        opacity: layout.totalColumns > 1 ? 0.95 : 1.0,
      }
    })
  }, [eventLayouts])

  const maxConcurrentEvents = useMemo(() => {
    return Math.max(1, ...eventLayouts.map((layout) => layout.totalColumns))
  }, [eventLayouts])

  return {
    dayEvents,
    eventPositions,
    maxConcurrentEvents,
    skippedEventsCount: 0, // 新しいシステムではスキップしない
  }
}
