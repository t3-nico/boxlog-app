// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import { useMemo } from 'react'

// import type { CalendarEvent } from '@/features/calendar/types/calendar.types'

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
  events = [], // デフォルト値を設定
}: UseDayEventLayoutOptions): UseDayEventLayoutReturn {
  // 共通のイベント位置計算フックを使用
  const {
    events: dayEvents,
    eventPositions: positionsInfo,
    maxConcurrentEvents,
  } = useEventPositioning({
    date,
    events: events as any, // TODO(#389): CalendarEvent型の統一が必要
    viewType: 'day',
  })

  // DayView固有のEventPosition形式に変換
  const eventPositions = useMemo(() => {
    return positionsInfo.map((info) => ({
      event: info.event as any, // TODO(#389): CalendarEvent型の統一が必要
      top: info.top,
      height: info.height,
      left: info.left,
      width: info.width,
      zIndex: info.zIndex,
      column: info.column,
      totalColumns: info.totalColumns,
      opacity: info.opacity,
    })) as EventPosition[]
  }, [positionsInfo])

  return {
    eventPositions,
    dayEvents: dayEvents as CalendarEvent[],
    maxConcurrentEvents,
  }
}
