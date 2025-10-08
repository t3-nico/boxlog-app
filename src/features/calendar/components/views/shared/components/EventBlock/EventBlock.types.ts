/**
 * EventBlock専用の型定義
 */

export interface EventInteractionState {
  isHovered: boolean
  isSelected: boolean
  isDragging: boolean
  isResizing: boolean
}

export interface EventDragData {
  eventId: string
  startPosition: { x: number; y: number }
  originalStart: Date
  originalEnd: Date
}

export interface EventResizeData {
  eventId: string
  resizeDirection: 'top' | 'bottom'
  originalStart: Date
  originalEnd: Date
}
