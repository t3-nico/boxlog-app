/**
 * プラン関連の型定義
 */

export interface CalendarPlan {
  id: string
  title: string
  description?: string
  color?: string
  start: Date
  end: Date
  // Aliases for backward compatibility
  startDate?: Date
  endDate?: Date
  // Extended properties to match CalendarPlan
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
  plan_number?: string // プラン番号（#123 形式）
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

// 時間指定プラン（start/endを持つプラン）
export type TimedPlan = CalendarPlan

// 後方互換性のためのエイリアス
/** @deprecated Use CalendarPlan instead */
export type CalendarTicket = CalendarPlan
/** @deprecated Use CalendarPlan instead */
export type CalendarEvent = CalendarPlan
/** @deprecated Use TimedPlan instead */
export type TimedEvent = TimedPlan

export interface PlanCardProps {
  plan: CalendarPlan
  position?: PlanCardPosition
  onClick?: (plan: CalendarPlan) => void
  onDoubleClick?: (plan: CalendarPlan) => void
  onContextMenu?: (plan: CalendarPlan, e: React.MouseEvent) => void
  onDragStart?: (
    plan: CalendarPlan,
    mouseEvent: React.MouseEvent,
    position: { top: number; left: number; width: number; height: number }
  ) => void
  onDragEnd?: (plan: CalendarPlan) => void
  onResizeStart?: (
    plan: CalendarPlan,
    direction: 'top' | 'bottom',
    mouseEvent: React.MouseEvent,
    position: { top: number; left: number; width: number; height: number }
  ) => void
  onResizeEnd?: (plan: CalendarPlan) => void
  isDragging?: boolean
  isSelected?: boolean
  isResizing?: boolean
  className?: string
  style?: React.CSSProperties
  previewTime?: { start: Date; end: Date } | null
}

// 後方互換性のためのエイリアス
/** @deprecated Use PlanCardProps instead */
export type TicketCardProps = PlanCardProps
/** @deprecated Use PlanCardProps instead */
export type EventBlockProps = PlanCardProps

export interface PlanCardPosition {
  top: number // px
  left: number // %
  width: number // %
  height: number // px
  zIndex?: number
}

// 後方互換性のためのエイリアス
/** @deprecated Use PlanCardPosition instead */
export type TicketCardPosition = PlanCardPosition
/** @deprecated Use PlanCardPosition instead */
export type EventPosition = PlanCardPosition

export interface PlanGroup {
  plans: CalendarPlan[]
  columns: PlanColumn[]
}

// 後方互換性のためのエイリアス
/** @deprecated Use PlanGroup instead */
export type TicketGroup = PlanGroup
/** @deprecated Use PlanGroup instead */
export type EventGroup = PlanGroup

export interface PlanColumn {
  plans: CalendarPlan[]
  columnIndex: number
  totalColumns: number
}

// 後方互換性のためのエイリアス
/** @deprecated Use PlanColumn instead */
export type TicketColumn = PlanColumn
/** @deprecated Use PlanColumn instead */
export type EventColumn = PlanColumn

export type PlanInteractionHandler = {
  onClick?: (plan: CalendarPlan) => void
  onDoubleClick?: (plan: CalendarPlan) => void
  onContextMenu?: (plan: CalendarPlan, e: React.MouseEvent) => void
  onDragStart?: (plan: CalendarPlan) => void
  onDragEnd?: (plan: CalendarPlan) => void
  onDragOver?: (plan: CalendarPlan, date: Date, time: Date) => void
  onDrop?: (plan: CalendarPlan, date: Date, time: Date) => void
  onResize?: (plan: CalendarPlan, newStart: Date, newEnd: Date) => void
}

// 後方互換性のためのエイリアス
/** @deprecated Use PlanInteractionHandler instead */
export type TicketInteractionHandler = PlanInteractionHandler
/** @deprecated Use PlanInteractionHandler instead */
export type EventInteractionHandler = PlanInteractionHandler
