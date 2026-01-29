'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useCalendarDragStore } from '@/features/calendar/stores/useCalendarDragStore';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

import type { DragDataRef, DragState, UseDragAndDropProps } from './types';
import { initialDragState } from './types';
import { useDragHandler } from './useDragHandler';
import { useResizeHandler } from './useResizeHandler';
import {
  animateSnapBack,
  calculateColumnWidth,
  calculateNewTime,
  calculateTargetDateIndex,
  checkClientSideOverlap,
  cleanupDragElements,
  createDragElement,
  getConstrainedPosition,
} from './utils';

/**
 * カレンダービュー共通のドラッグ&ドロップ機能
 * 全てのビュー（Day, Week, ThreeDay等）で利用可能
 * 高機能版：ゴースト要素、詳細な状態管理、5px移動閾値、日付間移動を含む
 */
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

  // グローバルドラッグ状態（日付間移動用）
  const { startDrag, updateDrag, endDrag } = useCalendarDragStore();

  // ハプティックフィードバック
  const { tap, impact, error: hapticError } = useHapticFeedback();

  // 長押しタイマー（モバイル用）
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressActiveRef = useRef(false);

  // eventClickHandler の最新参照を保持（クロージャー問題を回避）
  // 重要: useRef の初期値として eventClickHandler を設定し、毎回の render で同期更新も行う
  const eventClickHandlerRef = useRef(eventClickHandler);
  // 同期的に毎レンダリングで最新値に更新（useEffect は非同期なので遅れる可能性がある）
  eventClickHandlerRef.current = eventClickHandler;

  // events の最新参照を保持
  const eventsRef = useRef(events);
  eventsRef.current = events;

  // 重複チェック用の全イベント（提供されていればそれを使用、なければeventsを使用）
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
  });

  // handleResizeStart をラップして disabledPlanId をチェック
  const handleResizeStart = useCallback(
    (
      eventId: string,
      direction: 'top' | 'bottom',
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
    ) => {
      // 無効化されたプランの場合はリサイズを開始しない
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
      eventUpdateHandler,
      eventClickHandler,
      dragDataRef,
      setDragState,
    });

  // 状態リセット
  const resetDragState = useCallback(() => {
    setDragState(initialDragState);
    dragDataRef.current = null;
  }, []);

  // ドラッグ要素のクリーンアップ
  const cleanupDrag = useCallback(() => {
    cleanupDragElements(dragState.dragElement, dragDataRef.current?.originalElement || null);
  }, [dragState.dragElement]);

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
  }, [handleResize, dragState.snappedPosition?.height]);

  // ドラッグ完了後の状態リセット
  const completeDragOperation = useCallback((actuallyDragged: boolean) => {
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
  }, []);

  /**
   * ドラッグ終了時の共通処理（重複排除）
   * Mouse/Touch両方で使用
   * 注意: クロージャー問題を避けるため、状態は引数として渡す
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
            // 視覚的フィードバックはドラッグ中に表示済み
            completeDragOperation(false);
            endDrag();
          });
          return false;
        }
      }

      // サーバー側で更新を実行（重複チェックはサーバー側で行う）
      const success = await executeEventUpdate(newStartTime);

      if (!success) {
        // サーバーエラー時（重複等）はスナップバック
        const dragElement = dragDataRef.current.dragElement ?? null;
        const originalRect = dragDataRef.current.originalElementRect ?? null;

        options.onOverlapError?.(); // ハプティックフィードバック
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
    [date, viewMode, displayDates, executeEventUpdate, completeDragOperation, endDrag],
  );

  // マウス移動処理
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // isPending（準備状態）、isDragging、isResizing のいずれかでなければ終了
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
          // ゴースト要素を作成（ドラッグ開始時に初めて作成）
          let dragElement: HTMLElement | null = null;
          let initialRect: DOMRect | null = null;
          if (dragData.originalElement && !dragData.dragElement) {
            const result = createDragElement(dragData.originalElement);
            dragElement = result.dragElement;
            initialRect = result.initialRect;
            dragData.dragElement = dragElement;
            dragData.initialRect = initialRect;
          }

          // グローバルストアにドラッグ開始を通知（日付間移動用）
          const draggedPlan = eventsRef.current.find((e) => e.id === dragData.eventId);
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
      } else if (dragState.isDragging || dragData.hasMoved) {
        // dragState.isDragging がまだ false でも hasMoved が true ならドラッグ処理を実行
        // （isPending → isDragging 遷移直後は dragState がまだ更新されていないため）
        handleDragging(constrainedX, constrainedY, deltaX, deltaY, targetDateIndex);

        // グローバルストアを更新（日付間移動の状態共有）
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

    // ドラッグ/リサイズ中でない場合はリセットのみ
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
    cleanupDrag,
    handleEventClick,
    resetDragState,
    handleResizeComplete,
    executeEventUpdateWithOverlapCheck,
    endDrag,
  ]);

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
    [disabledPlanId, viewMode, displayDates, clearLongPressTimer, impact, startDrag],
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
    // タッチ操作時はエラー時にハプティックフィードバックを追加
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
    cleanupDrag,
    resetDragState,
    clearLongPressTimer,
    executeEventUpdateWithOverlapCheck,
    hapticError,
    endDrag,
  ]);

  // handleMouseDown をラップして disabledPlanId をチェック
  // クリック処理は handleMouseUp で isPending 状態をチェックして行う
  const wrappedHandleMouseDown = useCallback(
    (
      eventId: string,
      e: React.MouseEvent,
      originalPosition: { top: number; left: number; width: number; height: number },
      dateIndex?: number,
    ) => {
      // 無効化されたプランの場合はDnDを開始せず、クリックのみ処理
      if (disabledPlanId && eventId === disabledPlanId) {
        // クリックハンドラーがあれば呼び出す
        const eventToClick = events.find((ev) => ev.id === eventId);
        if (eventToClick && eventClickHandler) {
          eventClickHandler(eventToClick);
        }
        return;
      }

      // 元の handleMouseDown を呼び出し
      // クリック判定は handleMouseUp で行う（isPending状態かつhasMoved=falseの場合）
      handleMouseDown(eventId, e, originalPosition, dateIndex);
    },
    [handleMouseDown, eventClickHandler, events, disabledPlanId],
  );

  // マウス/タッチイベントリスナーを設定（ドラッグ/リサイズ用）
  // isPending状態でもリスナーを登録（5px移動検知のため）
  useEffect(() => {
    if (dragState.isPending || dragState.isDragging || dragState.isResizing) {
      // マウスイベント
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      // タッチイベント
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
