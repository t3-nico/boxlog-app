import { useDragAndDrop as useSharedDragAndDrop } from '../../shared/hooks/useDragAndDrop'

export type { DragState, DragHandlers } from '../../shared/hooks/useDragAndDrop'

interface UseDragAndDropProps {
  onEventUpdate?: (eventId: string, updates: { startTime: Date; endTime: Date }) => Promise<void> | void
  date: Date
  events: any[]
}

/**
 * DayView用のドラッグ&ドロップフック
 * 共通のuseDragAndDropを使用
 */
export function useDragAndDrop(props: UseDragAndDropProps) {
  return useSharedDragAndDrop(props)
}