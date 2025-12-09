import { useMemo } from 'react'

import { useEventPositioning, type EventPositionInfo } from '../../shared/hooks/usePlanPositioning'
import type { CalendarPlan, EventPosition } from '../../shared/types/plan.types'

interface UseDayEventLayoutOptions {
  date: Date
  events: CalendarPlan[]
}

interface UseDayEventLayoutReturn {
  eventPositions: EventPosition[]
  dayEvents: CalendarPlan[]
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
    events,
    viewType: 'day',
  })

  // DayView固有のEventPosition形式に変換
  const eventPositions = useMemo(() => {
    return positionsInfo.map((info: EventPositionInfo) => ({
      event: info.event as CalendarPlan,
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
    dayEvents: dayEvents as CalendarPlan[],
    maxConcurrentEvents,
  }
}
