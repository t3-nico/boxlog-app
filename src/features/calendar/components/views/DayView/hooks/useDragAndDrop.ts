import { useDragAndDrop as useSharedDragAndDrop } from '../../shared/hooks/useDragAndDrop'

import type { CalendarEvent } from '../../shared/types/event.types'

export type { DragState, DragHandlers } from '../../shared/hooks/useDragAndDrop'

interface UseDragAndDropProps {
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  date: Date
  events: CalendarEvent[]
}

/**
 * DayView用のドラッグ&ドロップフック
 * 共通のuseDragAndDropを使用
 */
export function useDragAndDrop(props: UseDragAndDropProps) {
  return useSharedDragAndDrop(props)
}