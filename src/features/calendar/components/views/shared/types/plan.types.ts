/**
 * プラン関連の型定義
 */

import type { CalendarPlan as BaseCalendarPlan } from '@/features/calendar/types/calendar.types'

// CalendarPlanを再エクスポート
export type CalendarPlan = BaseCalendarPlan

// 時間指定プラン（start/endを持つプラン）
// CalendarPlanの startDate/endDate を start/end に変換した型
export type TimedPlan = CalendarPlan & {
  start: Date // startDateのエイリアス
  end: Date // endDateのエイリアス
  isReadOnly?: boolean
}

// 後方互換性のためのエイリアス
/** @deprecated Use TimedPlan instead */
export type TimedEvent = TimedPlan

export interface PlanCardProps {
  plan: CalendarPlan
  position?: PlanCardPosition | undefined
  onClick?: ((plan: CalendarPlan) => void) | undefined
  onDoubleClick?: ((plan: CalendarPlan) => void) | undefined
  onContextMenu?: ((plan: CalendarPlan, e: React.MouseEvent) => void) | undefined
  onDragStart?:
    | ((
        plan: CalendarPlan,
        mouseEvent: React.MouseEvent,
        position: { top: number; left: number; width: number; height: number }
      ) => void)
    | undefined
  onDragEnd?: ((plan: CalendarPlan) => void) | undefined
  onResizeStart?:
    | ((
        plan: CalendarPlan,
        direction: 'top' | 'bottom',
        mouseEvent: React.MouseEvent,
        position: { top: number; left: number; width: number; height: number }
      ) => void)
    | undefined
  onResizeEnd?: ((plan: CalendarPlan) => void) | undefined
  isDragging?: boolean | undefined
  isSelected?: boolean | undefined
  isResizing?: boolean | undefined
  className?: string | undefined
  style?: React.CSSProperties | undefined
  previewTime?: ({ start: Date; end: Date } | null) | undefined
}

// 後方互換性のためのエイリアス
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
export type EventPosition = PlanCardPosition

export interface PlanGroup {
  plans: CalendarPlan[]
  columns: PlanColumn[]
}

// 後方互換性のためのエイリアス
/** @deprecated Use PlanGroup instead */
export type EventGroup = PlanGroup

export interface PlanColumn {
  plans: CalendarPlan[]
  columnIndex: number
  totalColumns: number
}

// 後方互換性のためのエイリアス
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
export type EventInteractionHandler = PlanInteractionHandler
