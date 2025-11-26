import { useDragAndDrop as useSharedDragAndDrop } from '../../shared/hooks/useDragAndDrop'

import type { CalendarPlan } from '../../shared/types/plan.types'

export type { DragHandlers, DragState } from '../../shared/hooks/useDragAndDrop'

interface UseDragAndDropProps {
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  onEventClick?: (plan: CalendarPlan) => void
  date: Date
  events: CalendarPlan[]
}

/**
 * DayView用のドラッグ&ドロップフック
 * 共通のuseDragAndDropを使用
 */
export function useDragAndDrop(props: UseDragAndDropProps) {
  return useSharedDragAndDrop(props)
}
