import type React from 'react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

export interface DragState {
  /** マウスダウン後、移動前の準備状態 */
  isPending: boolean;
  isDragging: boolean;
  isResizing: boolean;
  draggedEventId: string | null;
  dragStartPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  originalPosition: { top: number; left: number; width: number; height: number } | null;
  snappedPosition: { top: number; height?: number; left?: number } | null;
  previewTime: { start: Date; end: Date } | null;
  recentlyDragged: boolean;
  recentlyResized: boolean;
  dragElement: HTMLElement | null;
  targetDateIndex?: number;
  originalDateIndex?: number;
  ghostElement: HTMLElement | null;
  /** ドラッグ中に重複が検出されたか */
  isOverlapping: boolean;
}

export interface DragHandlers {
  handleMouseDown: (
    eventId: string,
    e: React.MouseEvent,
    originalPosition: { top: number; left: number; width: number; height: number },
    dateIndex?: number,
  ) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
  handleEventDrop: (eventId: string, newStartTime: Date) => void;
  handleResizeStart: (
    eventId: string,
    direction: 'top' | 'bottom',
    e: React.MouseEvent,
    originalPosition: { top: number; left: number; width: number; height: number },
  ) => void;
}

export interface UseDragAndDropProps {
  onEventUpdate?:
    | ((
        eventId: string,
        updates: { startTime: Date; endTime: Date },
      ) => Promise<void | { skipToast: true }> | void)
    | undefined;
  onPlanUpdate?:
    | ((
        eventId: string,
        updates: { startTime: Date; endTime: Date },
      ) => Promise<void | { skipToast: true }> | void)
    | undefined;
  onEventClick?: ((plan: CalendarPlan) => void) | undefined;
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
  date: Date;
  events: CalendarPlan[];
  /** 重複チェック用の全イベント（週/複数日表示で別日への移動時に使用） */
  allEventsForOverlapCheck?: CalendarPlan[] | undefined;
  displayDates?: Date[] | undefined;
  viewMode?: 'day' | '3day' | '5day' | 'week' | 'agenda' | undefined;
  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined;
}

export interface DragDataRef {
  eventId: string;
  startX: number;
  startY: number;
  originalTop: number;
  eventDuration: number;
  hasMoved: boolean;
  originalElement: HTMLElement | null;
  originalDateIndex: number;
  columnWidth?: number;
  dragElement?: HTMLElement | null;
  initialRect?: DOMRect | null;
  /** mousedown時点での元要素のBoundingClientRect（ゴースト位置計算用） */
  originalElementRect?: DOMRect | null;
}

export const initialDragState: DragState = {
  isPending: false,
  isDragging: false,
  isResizing: false,
  draggedEventId: null,
  dragStartPosition: null,
  currentPosition: null,
  originalPosition: null,
  snappedPosition: null,
  previewTime: null,
  recentlyDragged: false,
  recentlyResized: false,
  dragElement: null,
  ghostElement: null,
  isOverlapping: false,
};
