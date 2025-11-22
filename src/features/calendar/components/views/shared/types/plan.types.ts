/**
 * チケット関連の型定義
 */

export interface CalendarTicket {
  id: string
  title: string
  description?: string
  color?: string
  start: Date
  end: Date
  // Aliases for backward compatibility
  startDate?: Date
  endDate?: Date
  // Extended properties to match CalendarEvent
  displayStartDate?: Date
  displayEndDate?: Date
  duration?: number
  isRecurring?: boolean
  status?: 'inbox' | 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'urgent' | 'important' | 'necessary' | 'delegate' | 'optional'
  location?: string
  url?: string
  createdAt?: Date
  updatedAt?: Date
  isMultiDay?: boolean
  isReadOnly?: boolean
  ticket_number?: string // チケット番号（#123 形式）
  reminder_minutes?: number | null // 通知タイミング（開始時刻の何分前か）
  tags?: Array<{
    id: string
    name: string
    color: string
    icon?: string
    parent_id?: string
  }>
  items?: Array<{
    id: string
    text: string
    completed: boolean
    duration?: number
  }>
  isDeleted?: boolean
}

// 後方互換性のためのエイリアス
export type CalendarEvent = CalendarTicket
export type TimedEvent = CalendarTicket

export interface TicketCardProps {
  event: CalendarTicket
  position?: TicketCardPosition
  onClick?: (event: CalendarTicket) => void
  onDoubleClick?: (event: CalendarTicket) => void
  onContextMenu?: (event: CalendarTicket, e: React.MouseEvent) => void
  onDragStart?: (
    event: CalendarTicket,
    mouseEvent: React.MouseEvent,
    position: { top: number; left: number; width: number; height: number }
  ) => void
  onDragEnd?: (event: CalendarTicket) => void
  onResizeStart?: (
    event: CalendarTicket,
    direction: 'top' | 'bottom',
    mouseEvent: React.MouseEvent,
    position: { top: number; left: number; width: number; height: number }
  ) => void
  onResizeEnd?: (event: CalendarTicket) => void
  isDragging?: boolean
  isSelected?: boolean
  isResizing?: boolean
  className?: string
  style?: React.CSSProperties
  previewTime?: { start: Date; end: Date } | null
}

// 後方互換性のためのエイリアス
export type EventBlockProps = TicketCardProps

export interface TicketCardPosition {
  top: number // px
  left: number // %
  width: number // %
  height: number // px
  zIndex?: number
}

// 後方互換性のためのエイリアス
export type EventPosition = TicketCardPosition

export interface TicketGroup {
  events: CalendarTicket[]
  columns: TicketColumn[]
}

// 後方互換性のためのエイリアス
export type EventGroup = TicketGroup

export interface TicketColumn {
  events: CalendarTicket[]
  columnIndex: number
  totalColumns: number
}

// 後方互換性のためのエイリアス
export type EventColumn = TicketColumn

export type TicketInteractionHandler = {
  onClick?: (event: CalendarTicket) => void
  onDoubleClick?: (event: CalendarTicket) => void
  onContextMenu?: (event: CalendarTicket, e: React.MouseEvent) => void
  onDragStart?: (event: CalendarTicket) => void
  onDragEnd?: (event: CalendarTicket) => void
  onDragOver?: (event: CalendarTicket, date: Date, time: Date) => void
  onDrop?: (event: CalendarTicket, date: Date, time: Date) => void
  onResize?: (event: CalendarTicket, newStart: Date, newEnd: Date) => void
}

// 後方互換性のためのエイリアス
export type EventInteractionHandler = TicketInteractionHandler
