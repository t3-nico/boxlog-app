'use client';

/**
 * タッチ操作のハンドラー
 * タッチ開始、ロングプレス、タッチ移動、タッチ終了
 */

import { useCallback, useRef } from 'react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

import type { DragDataRef, DragState } from './types';
import {
  calculateColumnWidth,
  calculateTargetDateIndex,
  createDragElement,
  getConstrainedPosition,
} from './utils';

interface UseTouchHandlersProps {
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  dragDataRef: React.MutableRefObject<DragDataRef | null>;
  eventsRef: React.MutableRefObject<CalendarPlan[]>;
  eventClickHandlerRef: React.MutableRefObject<((plan: CalendarPlan) => void) | undefined>;
  viewMode: string;
  displayDates: Date[] | undefined;
  disabledPlanId: string | null | undefined;
  handleDragging: (
    clientX: number,
    clientY: number,
    deltaX: number,
    deltaY: number,
    targetDateIndex: number | undefined,
  ) => void;
  // Functions from useDragEvents
  resetDragState: () => void;
  cleanupDrag: () => void;
  executeEventUpdateWithOverlapCheck: (options: {
    currentPosition: { x: number; y: number };
    dragStartPosition: { x: number; y: number };
    targetDateIndex: number | undefined;
    onOverlapError?: () => void;
  }) => Promise<boolean>;
  startDrag: (eventId: string, plan: CalendarPlan, dateIndex: number) => void;
  updateDrag: (update: { targetDateIndex: number | undefined; isDragging: boolean }) => void;
  endDrag: () => void;
}

export function useTouchHandlers({
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
  updateDrag,
  endDrag,
}: UseTouchHandlersProps) {
  const { tap, impact, error: hapticError } = useHapticFeedback();

  // 長押しタイマー（モバイル用）
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressActiveRef = useRef(false);

  // 長押しタイマーをクリア
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartPosRef.current = null;
    isLongPressActiveRef.current = false;
  }, []);

  // タッチ開始（長押しでドラッグ開始）
  const handleTouchStart = useCallback(
    (
      eventId: string,
      e: React.TouchEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex: number = 0,
    ) => {
      // 無効化されたプランの場合はDnDを開始しない
      if (disabledPlanId && eventId === disabledPlanId) {
        return;
      }

      const touch = e.touches[0];
      if (!touch) return;

      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

      // 長押しタイマーを設定（500ms）
      clearLongPressTimer();
      longPressTimerRef.current = setTimeout(() => {
        isLongPressActiveRef.current = true;
        impact(); // 長押し開始時にハプティックフィードバック

        // ドラッグを開始
        const originalElement =
          ((e.target as HTMLElement).closest('[data-event-wrapper="true"]') as HTMLElement) ||
          ((e.target as HTMLElement).closest('[data-plan-block="true"]') as HTMLElement) ||
          ((e.target as HTMLElement).closest('[data-event-block="true"]') as HTMLElement);

        const columnWidth = calculateColumnWidth(originalElement, viewMode, displayDates);
        const originalElementRect = originalElement?.getBoundingClientRect() ?? null;

        // ゴースト要素を作成
        let dragElement: HTMLElement | null = null;
        let initialRect: DOMRect | null = null;
        if (originalElement) {
          const result = createDragElement(originalElement);
          dragElement = result.dragElement;
          initialRect = result.initialRect;
        }

        dragDataRef.current = {
          eventId,
          startX: touch.clientX,
          startY: touch.clientY,
          originalTop: originalPosition.top,
          eventDuration: originalPosition.height,
          hasMoved: false,
          originalElement,
          originalDateIndex: dateIndex,
          columnWidth,
          dragElement,
          initialRect,
          originalElementRect,
        };

        // グローバルストアにドラッグ開始を通知
        const draggedPlan = eventsRef.current.find((ev) => ev.id === eventId);
        if (draggedPlan) {
          startDrag(eventId, draggedPlan, dateIndex);
        }

        setDragState({
          isPending: false,
          isDragging: true,
          isResizing: false,
          draggedEventId: eventId,
          dragStartPosition: { x: touch.clientX, y: touch.clientY },
          currentPosition: { x: touch.clientX, y: touch.clientY },
          originalPosition,
          snappedPosition: {
            top: originalPosition.top,
            height: originalPosition.height,
          },
          previewTime: null,
          recentlyDragged: false,
          recentlyResized: false,
          dragElement,
          originalDateIndex: dateIndex,
          targetDateIndex: dateIndex,
          ghostElement: null,
          isOverlapping: false,
        });
      }, 500);
    },
    [
      disabledPlanId,
      viewMode,
      displayDates,
      clearLongPressTimer,
      impact,
      startDrag,
      dragDataRef,
      eventsRef,
      setDragState,
    ],
  );

  // タッチ移動
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      // 長押し前の移動はタイマーをキャンセル
      if (!isLongPressActiveRef.current && touchStartPosRef.current) {
        const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

        if (deltaX > 10 || deltaY > 10) {
          clearLongPressTimer();
          return;
        }
      }

      // ドラッグ中でなければ終了
      if (!dragState.isDragging || !dragDataRef.current) return;

      e.preventDefault(); // スクロールを防止

      const dragData = dragDataRef.current;
      const { constrainedX, constrainedY } = getConstrainedPosition(touch.clientX, touch.clientY);
      const deltaX = constrainedX - dragData.startX;
      const deltaY = constrainedY - dragData.startY;

      dragData.hasMoved = true;

      const targetDateIndex = calculateTargetDateIndex(
        constrainedX,
        dragData.originalDateIndex,
        dragData.hasMoved,
        dragData.originalElement,
        dragData.columnWidth,
        deltaX,
        viewMode,
        displayDates,
      );

      handleDragging(constrainedX, constrainedY, deltaX, deltaY, targetDateIndex);

      // グローバルストアを更新
      updateDrag({
        targetDateIndex,
        isDragging: true,
      });

      // ハプティックフィードバック（15分ごとにtap）
      tap();
    },
    [
      dragState.isDragging,
      dragDataRef,
      viewMode,
      displayDates,
      clearLongPressTimer,
      handleDragging,
      updateDrag,
      tap,
    ],
  );

  // タッチ終了
  const handleTouchEnd = useCallback(async () => {
    clearLongPressTimer();

    // ドラッグ中でなければ終了
    if (!dragState.isDragging || !dragDataRef.current) {
      // クリックとして処理
      if (!dragDataRef.current?.hasMoved && dragDataRef.current?.eventId) {
        const eventToClick = eventsRef.current.find((ev) => ev.id === dragDataRef.current?.eventId);
        if (eventToClick && eventClickHandlerRef.current) {
          eventClickHandlerRef.current(eventToClick);
        }
      }
      resetDragState();
      endDrag();
      return;
    }

    cleanupDrag();

    if (!dragState.currentPosition || !dragState.dragStartPosition) {
      resetDragState();
      endDrag();
      return;
    }

    // 共通のドラッグ終了処理（重複チェック + イベント更新）
    await executeEventUpdateWithOverlapCheck({
      currentPosition: dragState.currentPosition,
      dragStartPosition: dragState.dragStartPosition,
      targetDateIndex: dragState.targetDateIndex,
      onOverlapError: hapticError,
    });
  }, [
    dragState.isDragging,
    dragState.currentPosition,
    dragState.dragStartPosition,
    dragState.targetDateIndex,
    dragDataRef,
    eventsRef,
    eventClickHandlerRef,
    cleanupDrag,
    resetDragState,
    clearLongPressTimer,
    executeEventUpdateWithOverlapCheck,
    hapticError,
    endDrag,
  ]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
