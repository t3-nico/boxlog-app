import { useViewEvents } from '../../shared/hooks/useViewPlans'
import type { UseDayEventsOptions, UseDayEventsReturn } from '../DayView.types'

/**
 * DayView用のイベント処理フック
 * 共通のuseViewEventsを使用
 */
export function useDayEvents({ date, events }: UseDayEventsOptions): UseDayEventsReturn {
  return useViewEvents({ date, events })
}
