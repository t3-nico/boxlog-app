/**
 * TicketCard専用の型定義
 */

export interface TicketInteractionState {
  isHovered: boolean
  isSelected: boolean
  isDragging: boolean
  isResizing: boolean
}

// 後方互換性のためのエイリアス
export type EventInteractionState = TicketInteractionState

export interface TicketDragData {
  ticketId: string
  startPosition: { x: number; y: number }
  originalStart: Date
  originalEnd: Date
}

// 後方互換性のためのエイリアス
export type EventDragData = TicketDragData

export interface TicketResizeData {
  ticketId: string
  resizeDirection: 'top' | 'bottom'
  originalStart: Date
  originalEnd: Date
}

// 後方互換性のためのエイリアス
export type EventResizeData = TicketResizeData
