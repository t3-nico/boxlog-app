/**
 * イベント関連の型定義
 */

export interface TimedEvent {
  id: string
  title: string
  description?: string
  color?: string
  start: Date
  end: Date
  isReadOnly?: boolean
}

export type CalendarEvent = TimedEvent

export interface EventBlockProps {
  event: CalendarEvent
  position: EventPosition
  onClick?: (event: CalendarEvent) => void
  onDoubleClick?: (event: CalendarEvent) => void
  onContextMenu?: (event: CalendarEvent, e: React.MouseEvent) => void
  onDragStart?: (event: CalendarEvent) => void
  onDragEnd?: (event: CalendarEvent) => void
  isDragging?: boolean
  isSelected?: boolean
  isResizing?: boolean
  className?: string
  style?: React.CSSProperties
}

export interface EventPosition {
  top: number // px
  left: number // %
  width: number // %
  height: number // px
  zIndex?: number
}

export interface EventGroup {
  events: CalendarEvent[]
  columns: EventColumn[]
}

export interface EventColumn {
  events: CalendarEvent[]
  columnIndex: number
  totalColumns: number
}


export type EventInteractionHandler = {
  onClick?: (event: CalendarEvent) => void
  onDoubleClick?: (event: CalendarEvent) => void
  onContextMenu?: (event: CalendarEvent, e: React.MouseEvent) => void
  onDragStart?: (event: CalendarEvent) => void
  onDragEnd?: (event: CalendarEvent) => void
  onDragOver?: (event: CalendarEvent, date: Date, time: Date) => void
  onDrop?: (event: CalendarEvent, date: Date, time: Date) => void
  onResize?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void
}