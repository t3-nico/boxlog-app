// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import { useDragAndDrop as useSharedDragAndDrop } from '../../shared/hooks/useDragAndDrop'

import type { CalendarEvent } from '../../shared/types/event.types'

export type { DragHandlers, DragState } from '../../shared/hooks/useDragAndDrop'

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
