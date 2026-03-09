import { useDragAndDrop as useSharedDragAndDrop } from '../../shared/hooks/useDragAndDrop';

import type { CalendarEvent } from '../../../../types/calendar.types';

export type { DragHandlers, DragState } from '../../shared/hooks/useDragAndDrop';

interface UseDragAndDropProps {
  onEventUpdate?: (
    eventId: string,
    updates: { startTime: Date; endTime: Date },
  ) => Promise<void | { skipToast: true }> | void;
  onEventClick?: (plan: CalendarEvent) => void;
  date: Date;
  events: CalendarEvent[];
  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined;
}

/**
 * DayView用のドラッグ&ドロップフック
 * 共通のuseDragAndDropを使用
 */
export function useDragAndDrop(props: UseDragAndDropProps) {
  return useSharedDragAndDrop(props);
}
