import { useMemo } from 'react'
import type { CalendarEvent } from '@/features/events'
import { useEventPositioning } from '../../shared/hooks/useEventPositioning'
import type { EventPosition } from '../DayView.types'

interface UseDayEventLayoutOptions {
  date: Date
  events: CalendarEvent[]
}

interface UseDayEventLayoutReturn {
  eventPositions: EventPosition[]
  dayEvents: CalendarEvent[]
  maxConcurrentEvents: number
}

/**
 * DayView専用のイベントレイアウト計算フック
 * 共通のuseEventPositioningをDayView用にカスタマイズ
 */
export function useDayEventLayout({ 
  date, 
  events = [] // デフォルト値を設定
}: UseDayEventLayoutOptions): UseDayEventLayoutReturn {
  
  // 共通のイベント位置計算フックを使用
  const { 
    events: dayEvents, 
    eventPositions: positionsInfo,
    maxConcurrentEvents 
  } = useEventPositioning({
    date,
    events,
    viewType: 'day'
  })

  // DayView固有のEventPosition形式に変換
  const eventPositions = useMemo(() => {
    return positionsInfo.map(info => ({
      event: info.event,
      top: info.top,
      height: info.height,
      left: info.left,
      width: info.width,
      zIndex: info.zIndex,
      column: info.column,
      totalColumns: info.totalColumns,
      opacity: info.opacity
    }))
  }, [positionsInfo])

  return {
    eventPositions,
    dayEvents,
    maxConcurrentEvents
  }
}