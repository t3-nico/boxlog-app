/**
 * プラン関連の型定義
 *
 * NOTE: CalendarEvent は @/features/calendar/types/calendar.types から直接インポートすること
 */

import type { CalendarEvent } from '../../../../types/calendar.types';

// 時間指定プラン（start/endを持つプラン）
// CalendarEventの startDate/endDate を start/end に変換した型
export type TimedPlan = CalendarEvent & {
  start: Date; // startDateのエイリアス
  end: Date; // endDateのエイリアス
  isReadOnly?: boolean;
};

export interface PlanCardProps {
  plan: CalendarEvent;
  position?: PlanCardPosition | undefined;
  onClick?: ((plan: CalendarEvent) => void) | undefined;
  onContextMenu?: ((plan: CalendarEvent, e: React.MouseEvent) => void) | undefined;
  onDragStart?:
    | ((
        plan: CalendarEvent,
        mouseEvent: React.MouseEvent,
        position: { top: number; left: number; width: number; height: number },
      ) => void)
    | undefined;
  /** モバイル用タッチ開始ハンドラー */
  onTouchStart?:
    | ((
        plan: CalendarEvent,
        touchEvent: React.TouchEvent,
        position: { top: number; left: number; width: number; height: number },
      ) => void)
    | undefined;
  onDragEnd?: ((plan: CalendarEvent) => void) | undefined;
  onResizeStart?:
    | ((
        plan: CalendarEvent,
        direction: 'top' | 'bottom',
        mouseEvent: React.MouseEvent,
        position: { top: number; left: number; width: number; height: number },
      ) => void)
    | undefined;
  onResizeEnd?: ((plan: CalendarEvent) => void) | undefined;
  isDragging?: boolean | undefined;
  isSelected?: boolean | undefined;
  isResizing?: boolean | undefined;
  /** Inspectorで開いているプランかどうか */
  isActive?: boolean | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  previewTime?: ({ start: Date; end: Date } | null) | undefined;
}

export interface PlanCardPosition {
  top: number; // px
  left: number; // %
  width: number; // %
  height: number; // px
  zIndex?: number;
}

export interface PlanGroup {
  plans: CalendarEvent[];
  columns: PlanColumn[];
}

export interface PlanColumn {
  plans: CalendarEvent[];
  columnIndex: number;
  totalColumns: number;
}

export type PlanInteractionHandler = {
  onClick?: (plan: CalendarEvent) => void;
  onContextMenu?: (plan: CalendarEvent, e: React.MouseEvent) => void;
  onDragStart?: (plan: CalendarEvent) => void;
  onDragEnd?: (plan: CalendarEvent) => void;
  onDragOver?: (plan: CalendarEvent, date: Date, time: Date) => void;
  onDrop?: (plan: CalendarEvent, date: Date, time: Date) => void;
  onResize?: (plan: CalendarEvent, newStart: Date, newEnd: Date) => void;
};
