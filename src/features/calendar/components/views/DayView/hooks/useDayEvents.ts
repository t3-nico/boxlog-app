import type { CalendarEvent } from '@/features/events'
import type { UseDayEventsOptions, UseDayEventsReturn } from '../DayView.types'
import { useViewEvents } from '../../shared/hooks/useViewEvents'

/**
 * DayView用のイベント処理フック
 * 共通のuseViewEventsを使用
 */
export function useDayEvents({ date, events }: UseDayEventsOptions): UseDayEventsReturn {
  return useViewEvents({ date, events })
}