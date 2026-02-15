'use client';

import type React from 'react';
import { useCallback } from 'react';

import { MS_PER_MINUTE } from '@/constants/time';
import useCalendarToast from '@/features/calendar/lib/toast';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';

import { HOUR_HEIGHT } from '@/features/calendar/components/views/shared/constants/grid.constants';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';

import type { DragDataRef, DragState } from './types';
import { checkClientSideOverlap, snapToQuarterHour, updateDragElementOverlapStyle } from './utils';

interface UseResizeHandlerProps {
  events: CalendarPlan[];
  /** 重複チェック用の全イベント（週ビューなど複数日表示時に使用） */
  allEventsForOverlapCheck?: CalendarPlan[] | undefined;
  eventUpdateHandler:
    | ((
        eventId: string,
        updates: { startTime: Date; endTime: Date },
      ) => Promise<void | { skipToast: true }> | void)
    | undefined;
  dragDataRef: React.MutableRefObject<DragDataRef | null>;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
}

export function useResizeHandler({
  events,
  allEventsForOverlapCheck,
  eventUpdateHandler,
  dragDataRef,
  setDragState,
}: UseResizeHandlerProps) {
  const t = useTranslations();
  const calendarToast = useCalendarToast();
  const { error: hapticError } = useHapticFeedback();

  // 重複チェック用のイベント一覧
  const allEvents = allEventsForOverlapCheck ?? events;

  // リサイズ処理（下端リサイズのみ）
  const handleResizing = useCallback(
    (constrainedX: number, constrainedY: number, deltaY: number) => {
      const dragData = dragDataRef.current;
      if (!dragData) return;

      const event = events.find((e) => e.id === dragData.eventId);
      let previewTime = null;
      let isOverlapping = false;

      // 下端リサイズ: 終了時刻を変更（開始時刻は固定）
      const newHeight = Math.max(15, dragData.eventDuration + deltaY);
      const { snappedTop: snappedHeight } = snapToQuarterHour(newHeight);
      const finalHeight = Math.max(HOUR_HEIGHT / 4, snappedHeight);

      if (event?.startDate) {
        const newDurationMs = (finalHeight / HOUR_HEIGHT) * 60 * 60 * 1000;
        const previewEndTime = new Date(event.startDate.getTime() + newDurationMs);
        previewTime = { start: event.startDate, end: previewEndTime };

        // リアルタイム重複チェック
        isOverlapping = checkClientSideOverlap(
          allEvents,
          dragData.eventId,
          event.startDate,
          previewEndTime,
        );

        // 視覚的フィードバック（赤オーバーレイ + ⊘アイコン）
        const resizeElement = dragData.originalElement;
        if (resizeElement) {
          updateDragElementOverlapStyle(resizeElement, isOverlapping);
        }
      }

      // サイズが変更されたらhasMovedをtrueに設定（リサイズ完了時の更新に必要）
      if (Math.abs(deltaY) > 5) {
        dragData.hasMoved = true;
      }

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: constrainedX, y: constrainedY },
        snappedPosition: {
          top: dragData.originalTop,
          height: finalHeight,
        },
        previewTime,
        isOverlapping,
      }));
    },
    [events, allEvents, dragDataRef, setDragState],
  );

  // リサイズ完了処理（下端リサイズのみ）
  const handleResize = useCallback(
    (snappedHeight: number | undefined) => {
      if (!dragDataRef.current || !snappedHeight) {
        return;
      }

      if (!eventUpdateHandler || !dragDataRef.current?.hasMoved) {
        return;
      }

      const event = events.find((e) => e.id === dragDataRef.current?.eventId);
      if (!event?.startDate) {
        return;
      }

      const newDurationMs = (snappedHeight / HOUR_HEIGHT) * 60 * 60 * 1000;
      const newEndTime = new Date(event.startDate.getTime() + newDurationMs);

      // 重複チェック
      const isOverlapping = checkClientSideOverlap(
        allEvents,
        event.id,
        event.startDate,
        newEndTime,
      );

      if (isOverlapping) {
        // ハプティックフィードバック（視覚的フィードバックはドラッグ中に表示済み）
        hapticError();
        // 視覚的フィードバックをクリア
        const resizeElement = dragDataRef.current.originalElement;
        if (resizeElement) {
          updateDragElementOverlapStyle(resizeElement, false);
        }
        return; // 更新をキャンセル
      }

      const eventData: CalendarPlan = {
        id: event.id,
        title: event.title || t('calendar.event.title'),
        description: event.description,
        startDate: event.startDate,
        endDate: newEndTime,
        status: event.status,
        color: event.color,
        reminder_minutes: event.reminder_minutes,
        tagIds: event.tagIds,
        createdAt: event.createdAt,
        updatedAt: new Date(),
        displayStartDate: event.startDate,
        displayEndDate: newEndTime,
        duration: Math.round(newDurationMs / MS_PER_MINUTE),
        isMultiDay: event.startDate.toDateString() !== newEndTime.toDateString(),
        isRecurring: false,
        type: event.type,
        userId: event.userId,
        location: event.location,
        url: event.url,
        priority: event.priority,
        calendarId: event.calendarId,
      };

      try {
        const promise = eventUpdateHandler(dragDataRef.current.eventId, {
          startTime: event.startDate,
          endTime: newEndTime,
        });

        if (promise && typeof promise.then === 'function') {
          promise
            .then(() => {
              calendarToast.eventUpdated(eventData);
            })
            .catch((error: unknown) => {
              logger.error('Failed to resize event:', error);
              // TIME_OVERLAPエラー（重複防止）の場合はtoastなし
              const errorMessage = error instanceof Error ? error.message : '';
              if (!errorMessage.includes('TIME_OVERLAP') && !errorMessage.includes('既に')) {
                calendarToast.error(t('calendar.event.resizeFailed'));
              }
            });
        } else {
          calendarToast.eventUpdated(eventData);
        }
      } catch (error) {
        logger.error('Failed to resize event:', error);
        // TIME_OVERLAPエラー（重複防止）の場合はtoastなし
        const errorMessage = error instanceof Error ? error.message : '';
        if (!errorMessage.includes('TIME_OVERLAP') && !errorMessage.includes('既に')) {
          calendarToast.error(t('calendar.event.resizeFailed'));
        }
      }
    },
    [events, allEvents, eventUpdateHandler, dragDataRef, calendarToast, hapticError, t],
  );

  // リサイズ開始（下端リサイズのみ）
  const handleResizeStart = useCallback(
    (
      eventId: string,
      _direction: 'top' | 'bottom',
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
    ) => {
      if (e.button !== 0) return;

      const startPosition = { x: e.clientX, y: e.clientY };

      // リサイズ対象の要素を取得（視覚的フィードバック用）
      const originalElement =
        ((e.target as HTMLElement).closest('[data-event-wrapper="true"]') as HTMLElement) ||
        ((e.target as HTMLElement).closest('[data-plan-block="true"]') as HTMLElement) ||
        ((e.target as HTMLElement).closest('[data-event-block="true"]') as HTMLElement);

      dragDataRef.current = {
        eventId,
        startX: e.clientX,
        startY: e.clientY,
        originalTop: originalPosition.top,
        eventDuration: originalPosition.height,
        hasMoved: false,
        originalElement,
        originalDateIndex: 0,
      };

      setDragState({
        isPending: false,
        isDragging: false,
        isResizing: true,
        draggedEventId: eventId,
        dragStartPosition: startPosition,
        currentPosition: startPosition,
        originalPosition,
        snappedPosition: { top: originalPosition.top, height: originalPosition.height },
        previewTime: null,
        recentlyDragged: false,
        recentlyResized: false,
        dragElement: null,
        ghostElement: null,
        isOverlapping: false,
      });
    },
    [dragDataRef, setDragState],
  );

  return {
    handleResizing,
    handleResize,
    handleResizeStart,
  };
}
