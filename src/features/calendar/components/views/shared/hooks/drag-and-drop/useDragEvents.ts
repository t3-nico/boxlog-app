'use client';

/**
 * ドラッグ中のグローバルイベントリスナー管理
 * mousemove/mouseup/touchmove/touchendの登録・クリーンアップ
 */

import { useCallback } from 'react';

import { useCalendarDragStore } from '../../../../../stores/useCalendarDragStore';

import type { CalendarPlan } from '../../../../../types/calendar.types';
import type { DragDataRef, DragState } from './types';
import { initialDragState } from './types';
import {
  animateSnapBack,
  calculateNewTime,
  calculateTargetDateIndex,
  checkClientSideOverlap,
  cleanupDragElements,
  createDragElement,
  getConstrainedPosition,
} from './utils';

interface UseDragEventsProps {
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  dragDataRef: React.MutableRefObject<DragDataRef | null>;
  eventsRef: React.MutableRefObject<CalendarPlan[]>;
  allEventsRef: React.MutableRefObject<CalendarPlan[]>;
  date: Date;
  displayDates: Date[] | undefined;
  viewMode: string;
  timezone: string;
  hourHeight: number;
  handleResizing: (clientX: number, clientY: number, deltaY: number) => void;
  handleDragging: (
    clientX: number,
    clientY: number,
    deltaX: number,
    deltaY: number,
    targetDateIndex: number | undefined,
  ) => void;
  handleResize: (snappedHeight: number | undefined) => void;
  handleEventClick: () => void;
  executeEventUpdate: (newStartTime: Date) => Promise<boolean>;
}

export function useDragEvents({
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
}: UseDragEventsProps) {
  const { startDrag, updateDrag, endDrag } = useCalendarDragStore();

  // 状態リセット
  const resetDragState = useCallback(() => {
    setDragState(initialDragState);
    dragDataRef.current = null;
  }, [setDragState, dragDataRef]);

  // ドラッグ要素のクリーンアップ
  const cleanupDrag = useCallback(() => {
    cleanupDragElements(dragState.dragElement, dragDataRef.current?.originalElement || null);
  }, [dragState.dragElement, dragDataRef]);

  // リサイズ完了処理
  const handleResizeComplete = useCallback(() => {
    handleResize(dragState.snappedPosition?.height);

    const actuallyResized = dragDataRef.current?.hasMoved ?? false;

    setDragState({
      ...initialDragState,
      recentlyDragged: actuallyResized,
      recentlyResized: actuallyResized,
    });

    dragDataRef.current = null;

    if (actuallyResized) {
      setTimeout(() => {
        setDragState((prev) => ({ ...prev, recentlyDragged: false, recentlyResized: false }));
      }, 1000);
    }
  }, [handleResize, dragState.snappedPosition?.height, setDragState, dragDataRef]);

  // ドラッグ完了後の状態リセット
  const completeDragOperation = useCallback(
    (actuallyDragged: boolean) => {
      setDragState({
        ...initialDragState,
        recentlyDragged: actuallyDragged,
      });
      dragDataRef.current = null;

      if (actuallyDragged) {
        setTimeout(() => {
          setDragState((prev) => ({
            ...prev,
            recentlyDragged: false,
          }));
        }, 1000);
      }
    },
    [setDragState, dragDataRef],
  );

  /**
   * ドラッグ終了時の共通処理（重複排除）
   * Mouse/Touch両方で使用
   */
  const executeEventUpdateWithOverlapCheck = useCallback(
    async (options: {
      currentPosition: { x: number; y: number };
      dragStartPosition: { x: number; y: number };
      targetDateIndex: number | undefined;
      onOverlapError?: () => void;
    }): Promise<boolean> => {
      if (!dragDataRef.current) {
        return false;
      }

      const deltaY = options.currentPosition.y - options.dragStartPosition.y;
      const newTop = dragDataRef.current.originalTop + deltaY;
      const finalTargetDateIndex =
        options.targetDateIndex !== undefined
          ? options.targetDateIndex
          : dragDataRef.current.originalDateIndex;

      const newStartTime = calculateNewTime(
        newTop,
        finalTargetDateIndex,
        date,
        viewMode,
        displayDates,
        dragDataRef.current,
        hourHeight,
        timezone,
      );

      // 重複チェック
      const draggedEvent = eventsRef.current.find((ev) => ev.id === dragDataRef.current?.eventId);
      if (draggedEvent) {
        const durationMs =
          draggedEvent.endDate && draggedEvent.startDate
            ? draggedEvent.endDate.getTime() - draggedEvent.startDate.getTime()
            : 60 * 60 * 1000;
        const newEndTime = new Date(newStartTime.getTime() + durationMs);

        const isOverlapping = checkClientSideOverlap(
          allEventsRef.current,
          dragDataRef.current.eventId,
          newStartTime,
          newEndTime,
        );

        if (isOverlapping) {
          const dragElement = dragDataRef.current.dragElement ?? null;
          const originalRect = dragDataRef.current.originalElementRect ?? null;

          options.onOverlapError?.();
          animateSnapBack(dragElement, originalRect, () => {
            completeDragOperation(false);
            endDrag();
          });
          return false;
        }
      }

      // サーバー側で更新を実行
      const success = await executeEventUpdate(newStartTime);

      if (!success) {
        const dragElement = dragDataRef.current.dragElement ?? null;
        const originalRect = dragDataRef.current.originalElementRect ?? null;

        options.onOverlapError?.();
        animateSnapBack(dragElement, originalRect, () => {
          completeDragOperation(false);
          endDrag();
        });
        return false;
      }

      const actuallyDragged = dragDataRef.current?.hasMoved || false;
      completeDragOperation(actuallyDragged);
      endDrag();
      return true;
    },
    [
      dragDataRef,
      date,
      viewMode,
      displayDates,
      timezone,
      hourHeight,
      eventsRef,
      allEventsRef,
      executeEventUpdate,
      completeDragOperation,
      endDrag,
    ],
  );

  // マウス移動処理
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        (!dragState.isPending && !dragState.isDragging && !dragState.isResizing) ||
        !dragDataRef.current
      )
        return;

      const dragData = dragDataRef.current;
      const { constrainedX, constrainedY } = getConstrainedPosition(e.clientX, e.clientY);
      const deltaX = constrainedX - dragData.startX;
      const deltaY = constrainedY - dragData.startY;

      // 5px以上移動したら hasMoved = true
      if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
        dragData.hasMoved = true;

        // isPending状態で5px移動したら、isDraggingに遷移
        if (dragState.isPending && !dragState.isDragging) {
          let dragElement: HTMLElement | null = null;
          let initialRect: DOMRect | null = null;
          if (dragData.originalElement && !dragData.dragElement) {
            const result = createDragElement(dragData.originalElement);
            dragElement = result.dragElement;
            initialRect = result.initialRect;
            dragData.dragElement = dragElement;
            dragData.initialRect = initialRect;
          }

          const draggedPlan = eventsRef.current.find((ev) => ev.id === dragData.eventId);
          if (draggedPlan) {
            startDrag(dragData.eventId, draggedPlan, dragData.originalDateIndex);
          }

          setDragState((prev) => ({
            ...prev,
            isPending: false,
            isDragging: true,
            dragElement: dragElement ?? prev.dragElement,
          }));
        }
      }

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

      if (dragState.isResizing) {
        handleResizing(constrainedX, constrainedY, deltaY);
      } else if ((dragState.isDragging || dragData.hasMoved) && targetDateIndex !== undefined) {
        handleDragging(constrainedX, constrainedY, deltaX, deltaY, targetDateIndex);

        updateDrag({
          targetDateIndex,
          isDragging: true,
        });
      }
    },
    [
      dragState.isPending,
      dragState.isDragging,
      dragState.isResizing,
      dragDataRef,
      eventsRef,
      viewMode,
      displayDates,
      handleResizing,
      handleDragging,
      setDragState,
      startDrag,
      updateDrag,
    ],
  );

  // ドラッグ終了
  const handleMouseUp = useCallback(async () => {
    cleanupDrag();

    // isPending状態（5px未移動）の場合はクリックとして処理
    if (dragState.isPending && !dragState.isDragging && !dragState.isResizing) {
      handleEventClick();
      resetDragState();
      endDrag();
      return;
    }

    if (
      (!dragState.isDragging && !dragState.isResizing) ||
      !dragDataRef.current ||
      !dragState.currentPosition ||
      !dragState.dragStartPosition
    ) {
      resetDragState();
      endDrag();
      return;
    }

    // リサイズ完了処理
    if (dragState.isResizing) {
      handleResizeComplete();
      endDrag();
      return;
    }

    // 共通のドラッグ終了処理（重複チェック + イベント更新）
    await executeEventUpdateWithOverlapCheck({
      currentPosition: dragState.currentPosition,
      dragStartPosition: dragState.dragStartPosition,
      targetDateIndex: dragState.targetDateIndex,
    });
  }, [
    dragState.isPending,
    dragState.isDragging,
    dragState.isResizing,
    dragState.currentPosition,
    dragState.dragStartPosition,
    dragState.targetDateIndex,
    dragDataRef,
    cleanupDrag,
    handleEventClick,
    resetDragState,
    handleResizeComplete,
    executeEventUpdateWithOverlapCheck,
    endDrag,
  ]);

  // グローバルイベントリスナーの登録・解除
  // 返却: touchMove/touchEnd ハンドラー（タッチ系からも使用）
  return {
    handleMouseMove,
    handleMouseUp,
    resetDragState,
    cleanupDrag,
    completeDragOperation,
    executeEventUpdateWithOverlapCheck,
    startDrag,
    updateDrag,
    endDrag,
  };
}
