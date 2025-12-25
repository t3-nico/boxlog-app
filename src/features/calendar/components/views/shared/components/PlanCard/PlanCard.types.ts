/**
 * PlanCard専用の型定義
 */

export interface planInteractionState {
  isHovered: boolean;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

// 後方互換性のためのエイリアス
export type EventInteractionState = planInteractionState;

export interface planDragData {
  planId: string;
  startPosition: { x: number; y: number };
  originalStart: Date;
  originalEnd: Date;
}

// 後方互換性のためのエイリアス
export type EventDragData = planDragData;

export interface planResizeData {
  planId: string;
  resizeDirection: 'top' | 'bottom';
  originalStart: Date;
  originalEnd: Date;
}

// 後方互換性のためのエイリアス
export type EventResizeData = planResizeData;
