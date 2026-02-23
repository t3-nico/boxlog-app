'use client';

/**
 * カレンダービュー共通のドラッグ&ドロップ機能（オーケストレーション）
 *
 * 責務を2つのサブフックに分割:
 * - useDragEvents: グローバルマウスイベント、ドラッグ完了ロジック
 * - useTouchHandlers: タッチ開始、ロングプレス、タッチ移動・終了
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';

import { useResponsiveHourHeight } from '../useResponsiveHourHeight';

import type { DragDataRef, DragState, UseDragAndDropProps } from './types';
import { initialDragState } from './types';
import { useDragEvents } from './useDragEvents';
import { useDragHandler } from './useDragHandler';
import { useResizeHandler } from './useResizeHandler';
import { useTouchHandlers } from './useTouchHandlers';

export function useDragAndDrop({
  onEventUpdate,
  onPlanUpdate,
  onEventClick,
  onPlanClick,
  date,
  events,
  allEventsForOverlapCheck,
  displayDates,
  viewMode = 'day',
  disabledPlanId,
}: UseDragAndDropProps) {
  const eventUpdateHandler = onEventUpdate || onPlanUpdate;
  const eventClickHandler = onEventClick || onPlanClick;

  // カレンダー設定のタイムゾーン
  const timezone = useCalendarSettingsStore((s) => s.timezone);

  // レスポンシブ対応の1時間あたり高さ（px）
  const hourHeight = useResponsiveHourHeight();

  // eventClickHandler の最新参照を保持（クロージャー問題を回避）
  const eventClickHandlerRef = useRef(eventClickHandler);
  eventClickHandlerRef.current = eventClickHandler;

  // events の最新参照を保持
  const eventsRef = useRef(events);
  eventsRef.current = events;

  // 重複チェック用の全イベント
  const allEventsRef = useRef(allEventsForOverlapCheck ?? events);
  allEventsRef.current = allEventsForOverlapCheck ?? events;

  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const dragDataRef = useRef<DragDataRef | null>(null);

  // Resize handler
  const {
    handleResizing,
    handleResize,
    handleResizeStart: originalHandleResizeStart,
  } = useResizeHandler({
    events,
    allEventsForOverlapCheck,
    eventUpdateHandler,
    dragDataRef,
    setDragState,
    hourHeight,
  });

  // handleResizeStart をラップして disabledPlanId をチェック
  const handleResizeStart = useCallback(
    (
      eventId: string,
      direction: 'top' | 'bottom',
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
    ) => {
      if (disabledPlanId && eventId === disabledPlanId) {
        return;
      }
      originalHandleResizeStart(eventId, direction, e, originalPosition);
    },
    [originalHandleResizeStart, disabledPlanId],
  );

  // Drag handler
  const { handleMouseDown, handleDragging, handleEventDrop, handleEventClick, executeEventUpdate } =
    useDragHandler({
      events,
      allEventsForOverlapCheck,
      date,
      displayDates,
      viewMode,
      timezone,
      hourHeight,
      eventUpdateHandler,
      eventClickHandler,
      dragDataRef,
      setDragState,
    });

  // --- サブフック: グローバルイベント処理 ---
  const {
    handleMouseMove,
    handleMouseUp,
    resetDragState,
    cleanupDrag,
    executeEventUpdateWithOverlapCheck,
    startDrag,
    updateDrag,
    endDrag,
  } = useDragEvents({
    dragState,
    setDragState,
    dragDataRef,
    eventsRef,
    allEventsRef,
    date,
    displayDates,
    viewMode,
    timezone,
    hourHeight,
    handleResizing,
    handleDragging,
    handleResize,
    handleEventClick,
    executeEventUpdate,
  });

  // --- サブフック: タッチハンドラー ---
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchHandlers({
    dragState,
    setDragState,
    dragDataRef,
    eventsRef,
    eventClickHandlerRef,
    viewMode,
    displayDates,
    disabledPlanId,
    handleDragging,
    resetDragState,
    cleanupDrag,
    executeEventUpdateWithOverlapCheck,
    startDrag,
    updateDrag: updateDrag as (update: {
      targetDateIndex: number | undefined;
      isDragging: boolean;
    }) => void,
    endDrag,
  });

  // handleMouseDown をラップして disabledPlanId をチェック
  const wrappedHandleMouseDown = useCallback(
    (
      eventId: string,
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex?: number,
    ) => {
      if (disabledPlanId && eventId === disabledPlanId) {
        const eventToClick = events.find((ev) => ev.id === eventId);
        if (eventToClick && eventClickHandler) {
          eventClickHandler(eventToClick);
        }
        return;
      }

      handleMouseDown(eventId, e, originalPosition, dateIndex);
    },
    [handleMouseDown, eventClickHandler, events, disabledPlanId],
  );

  // マウス/タッチイベントリスナーを設定
  useEffect(() => {
    if (dragState.isPending || dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      };
    }
    return undefined;
  }, [
    dragState.isPending,
    dragState.isDragging,
    dragState.isResizing,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return {
    dragState,
    disabledPlanId,
    handlers: {
      // マウスイベント
      handleMouseDown: wrappedHandleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleEventDrop,
      handleResizeStart,
      // タッチイベント
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    },
  };
}
