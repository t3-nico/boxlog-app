'use client';

import type React from 'react';
import { useCallback } from 'react';

import { MS_PER_MINUTE } from '@/constants/time';
import useCalendarToast from '@/features/calendar/lib/toast';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';

import type { DragDataRef, DragState } from './types';
import {
  calculateColumnWidth,
  calculateEventDuration,
  calculatePreviewTime,
  calculateSnappedPosition,
  checkClientSideOverlap,
  updateDragElementOverlapStyle,
  updateDragElementPosition,
  updateTimeDisplay,
} from './utils';

interface UseDragHandlerProps {
  events: CalendarPlan[];
  /** 重複チェック用の全イベント（週/複数日表示で別日への移動時に使用） */
  allEventsForOverlapCheck?: CalendarPlan[] | undefined;
  date: Date;
  displayDates: Date[] | undefined;
  viewMode: string;
  eventUpdateHandler:
    | ((
        eventId: string,
        updates: { startTime: Date; endTime: Date },
      ) => Promise<void | { skipToast: true }> | void)
    | undefined;
  eventClickHandler: ((plan: CalendarPlan) => void) | undefined;
  dragDataRef: React.MutableRefObject<DragDataRef | null>;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
}

export function useDragHandler({
  events,
  allEventsForOverlapCheck,
  date,
  displayDates,
  viewMode,
  eventUpdateHandler,
  eventClickHandler,
  dragDataRef,
  setDragState,
}: UseDragHandlerProps) {
  const t = useTranslations();
  const calendarToast = useCalendarToast();

  // ドラッグ開始
  const handleMouseDown = useCallback(
    (
      eventId: string,
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex: number = 0,
    ) => {
      if (e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      const startPosition = { x: e.clientX, y: e.clientY };
      // 外側のポジショニング用divを優先して取得
      // DayView: data-event-wrapper / data-event-block
      // WeekView/ThreeDayView/FiveDayView: data-plan-block
      const originalElement =
        ((e.target as HTMLElement).closest('[data-event-wrapper="true"]') as HTMLElement) ||
        ((e.target as HTMLElement).closest('[data-plan-block="true"]') as HTMLElement) ||
        ((e.target as HTMLElement).closest('[data-event-block="true"]') as HTMLElement);
      const columnWidth = calculateColumnWidth(originalElement, viewMode, displayDates);

      // mousedown時点での元要素の位置を保存（ゴースト位置計算用）
      const originalElementRect = originalElement?.getBoundingClientRect() ?? null;

      // 注意: ゴースト要素（dragElement）は5px移動後に作成する
      // mousedown時点では作成しない（クリックと区別するため）

      dragDataRef.current = {
        eventId,
        startX: e.clientX,
        startY: e.clientY,
        originalTop: originalPosition.top,
        eventDuration: originalPosition.height,
        hasMoved: false,
        originalElement,
        originalDateIndex: dateIndex,
        columnWidth,
        dragElement: null, // 5px移動後に作成
        initialRect: null, // 5px移動後に設定
        originalElementRect, // mousedown時点の位置
      };

      setDragState({
        isPending: true, // まず準備状態に入る（5px移動後にisDraggingになる）
        isDragging: false,
        isResizing: false,
        draggedEventId: eventId,
        dragStartPosition: startPosition,
        currentPosition: startPosition,
        originalPosition,
        snappedPosition: {
          top: originalPosition.top,
          height: originalPosition.height,
        },
        previewTime: null,
        recentlyDragged: false,
        recentlyResized: false,
        dragElement: null, // 5px移動後に作成
        originalDateIndex: dateIndex,
        targetDateIndex: dateIndex,
        ghostElement: null,
        isOverlapping: false,
      });
    },
    [viewMode, displayDates, dragDataRef, setDragState],
  );

  // ドラッグ処理
  const handleDragging = useCallback(
    (
      constrainedX: number,
      constrainedY: number,
      deltaX: number,
      deltaY: number,
      targetDateIndex: number,
    ) => {
      const dragData = dragDataRef.current;
      if (!dragData) return;

      const { snappedTop, snappedLeft, hour, minute } = calculateSnappedPosition(
        dragData.originalTop,
        dragData.originalDateIndex,
        deltaY,
        targetDateIndex,
        viewMode,
        displayDates,
      );

      // originalElementRect（mousedown時点の位置）を基準に計算
      // initialRectは5px移動後に取得されるため、deltaX/deltaYとずれる
      updateDragElementPosition(
        dragData.dragElement || null,
        dragData.originalElementRect || null,
        deltaX,
        deltaY,
      );

      const { previewStartTime, previewEndTime } = calculatePreviewTime(
        events,
        dragData.eventId,
        dragData.originalDateIndex,
        dragData.eventDuration,
        hour,
        minute,
        targetDateIndex,
        date,
        viewMode,
        displayDates,
      );

      updateTimeDisplay(dragData.dragElement || null, previewStartTime, previewEndTime);

      // クライアント側で重複チェック（全イベントを使用して別日への移動もチェック）
      const eventsToCheck = allEventsForOverlapCheck ?? events;
      const isOverlapping = checkClientSideOverlap(
        eventsToCheck,
        dragData.eventId,
        previewStartTime,
        previewEndTime,
      );

      // ゴースト要素のスタイルを重複状態に応じて更新
      updateDragElementOverlapStyle(dragData.dragElement || null, isOverlapping);

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: constrainedX, y: constrainedY },
        snappedPosition: {
          top: snappedTop,
          ...(snappedLeft !== undefined && { left: snappedLeft }),
        },
        previewTime: { start: previewStartTime, end: previewEndTime },
        targetDateIndex,
        isOverlapping,
      }));
    },
    [events, allEventsForOverlapCheck, date, viewMode, displayDates, dragDataRef, setDragState],
  );

  // プランドロップのヘルパー
  const handleEventDrop = useCallback(
    (eventId: string, newStartTime: Date) => {
      if (eventUpdateHandler) {
        const { durationMs } = calculateEventDuration(events, eventId, dragDataRef.current);
        const newEndTime = new Date(newStartTime.getTime() + durationMs);
        eventUpdateHandler(eventId, { startTime: newStartTime, endTime: newEndTime });
      }
    },
    [eventUpdateHandler, events, dragDataRef],
  );

  // クリック処理
  const handleEventClick = useCallback(() => {
    if (!dragDataRef.current || dragDataRef.current.hasMoved || !eventClickHandler) {
      return false;
    }

    const eventToClick = events.find((e) => e.id === dragDataRef.current!.eventId);
    if (eventToClick) {
      eventClickHandler(eventToClick);
      return true;
    }
    return false;
  }, [events, eventClickHandler, dragDataRef]);

  // Toast通知を処理する
  const handleEventUpdateToast = useCallback(
    async (promise: Promise<void>, plan: CalendarPlan, newStartTime: Date, durationMs: number) => {
      if (!plan) return;

      const previousStartTime = plan.startDate || date;
      const timeChanged = Math.abs(newStartTime.getTime() - previousStartTime.getTime()) > 1000;

      if (!timeChanged) {
        return;
      }

      const eventData: CalendarPlan = {
        id: plan.id,
        title: plan.title || t('calendar.event.title'),
        description: plan.description,
        startDate: newStartTime,
        endDate: new Date(newStartTime.getTime() + durationMs),
        status: plan.status,
        color: plan.color,
        reminder_minutes: plan.reminder_minutes,
        tagIds: plan.tagIds,
        createdAt: plan.createdAt,
        updatedAt: new Date(),
        displayStartDate: newStartTime,
        displayEndDate: new Date(newStartTime.getTime() + durationMs),
        duration: Math.round(durationMs / MS_PER_MINUTE),
        isMultiDay: false,
        isRecurring: false,
        type: plan.type,
        userId: plan.userId,
        location: plan.location,
        url: plan.url,
        priority: plan.priority,
        calendarId: plan.calendarId,
      };

      if (promise && typeof promise.then === 'function') {
        promise
          .then(() => {
            calendarToast.eventMoved(eventData, newStartTime, {
              undoAction: async () => {
                try {
                  const originalEndTime = new Date(previousStartTime.getTime() + durationMs);
                  await eventUpdateHandler!(dragDataRef.current!.eventId, {
                    startTime: previousStartTime,
                    endTime: originalEndTime,
                  });
                  calendarToast.success(t('calendar.event.undoMove'));
                } catch {
                  calendarToast.error(t('calendar.event.undoFailed'));
                }
              },
            });
          })
          .catch((error: unknown) => {
            logger.error('Failed to update event time:', error);
            calendarToast.error(t('calendar.event.moveFailed'));
          });
      } else {
        calendarToast.eventMoved(eventData, newStartTime);
      }
    },
    [date, calendarToast, eventUpdateHandler, dragDataRef, t],
  );

  // プラン更新処理を実行する
  // @returns true: 成功, false: エラー（スナップバック必要）
  const executeEventUpdate = useCallback(
    async (newStartTime: Date): Promise<boolean> => {
      if (!eventUpdateHandler || !dragDataRef.current?.eventId || !dragDataRef.current?.hasMoved) {
        return true; // 更新不要なので成功扱い
      }

      const { event, durationMs } = calculateEventDuration(
        events,
        dragDataRef.current.eventId,
        dragDataRef.current,
      );

      if (!event) {
        logger.warn('Plan not found for update');
        return true; // プランが見つからない場合も成功扱い
      }

      const newEndTime = new Date(newStartTime.getTime() + durationMs);

      if (newEndTime <= newStartTime) {
        newEndTime.setTime(newStartTime.getTime() + 60 * 60 * 1000);
      }

      try {
        // eventUpdateHandler は { skipToast: true } を返す可能性がある（繰り返しプランのダイアログ表示時）
        const result = (await eventUpdateHandler(dragDataRef.current.eventId, {
          startTime: newStartTime,
          endTime: newEndTime,
        })) as { skipToast?: boolean } | void;

        // ダイアログが表示された場合はtoastをスキップ
        if (result && typeof result === 'object' && result.skipToast) {
          return true;
        }

        await handleEventUpdateToast(Promise.resolve(), event, newStartTime, durationMs);
        return true;
      } catch (error) {
        logger.error('Failed to update event time:', error);
        // TIME_OVERLAPエラー（重複防止）の場合はtoastなし（スナップバックで対応）
        const errorMessage = error instanceof Error ? error.message : '';
        if (!errorMessage.includes('TIME_OVERLAP') && !errorMessage.includes('既に')) {
          calendarToast.error(t('calendar.event.moveFailed'));
        }
        return false; // エラー時はスナップバック必要
      }
    },
    [eventUpdateHandler, events, dragDataRef, handleEventUpdateToast, calendarToast, t],
  );

  return {
    handleMouseDown,
    handleDragging,
    handleEventDrop,
    handleEventClick,
    executeEventUpdate,
  };
}
