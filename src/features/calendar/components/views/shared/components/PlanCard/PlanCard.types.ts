/**
 * PlanCard専用の型定義
 */

export interface PlanInteractionState {
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

export interface PlanDragData {
  planId: string;
  startPosition: { x: number; y: number };
  originalStart: Date;
  originalEnd: Date;
}

export interface PlanResizeData {
  planId: string;
  resizeDirection: 'top' | 'bottom';
  originalStart: Date;
  originalEnd: Date;
}
