import { useEventStyles } from '../../shared/hooks/useEventStyles'
import { useIsToday } from '../../shared/hooks/useIsToday'
import { useTimeSlots } from '../../shared/hooks/useTimeSlots'
import type { UseDayViewOptions, UseDayViewReturn } from '../DayView.types'

import { useDayEvents } from './useDayEvents'

export function useDayView({ date, events, onEventUpdate }: UseDayViewOptions): UseDayViewReturn {
  
  // イベントデータ処理
  const { dayEvents, eventPositions } = useDayEvents({ date, events })
  
  // 今日かどうかの判定
  const isTodayFlag = useIsToday(date)
  
  // 時間スロットの生成（0:00-23:45、15分間隔）
  const timeSlots = useTimeSlots()
  
  // イベントのCSSスタイルを計算
  const eventStyles = useEventStyles(eventPositions)
  
  // スクロール処理はScrollableCalendarLayoutに委譲
  
  return {
    dayEvents,
    eventStyles,
    isToday: isTodayFlag,
    timeSlots
  }
}