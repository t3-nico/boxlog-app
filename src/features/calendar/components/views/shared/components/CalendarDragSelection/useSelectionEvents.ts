'use client';

/**
 * ドラッグ選択のマウス・タッチイベントハンドラー
 * グローバルイベントリスナーの登録・解除を含む
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';

import type { DateTimeSelection, TimeRange } from './types';
import { DRAG_CONSTANTS } from './types';

interface UseSelectionEventsOptions {
  date: Date;
  disabled: boolean;
  defaultDuration: number;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined;
  onDoubleClick?: ((selection: DateTimeSelection) => void) | undefined;
  pixelsToTime: (y: number) => { hour: number; minute: number };
  checkOverlap: (sel: TimeRange) => boolean;
}

interface UseSelectionEventsReturn {
  isSelecting: boolean;
  selection: TimeRange | null;
  showSelectionPreview: boolean;
  isOverlapping: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleDoubleClick: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
}

export function useSelectionEvents({
  date,
  disabled,
  defaultDuration,
  hourHeight,
  containerRef,
  onTimeRangeSelect,
  onDoubleClick: onDoubleClickProp,
  pixelsToTime,
  checkOverlap,
}: UseSelectionEventsOptions): UseSelectionEventsReturn {
  const { tap } = useHapticFeedback();

  // Refs
  const isDragging = useRef(false);
  const lastSelectionRef = useRef<{ startMinutes: number; endMinutes: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const touchStartTime = useRef<number | null>(null);

  // State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<TimeRange | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ hour: number; minute: number } | null>(
    null,
  );
  const [showSelectionPreview, setShowSelectionPreview] = useState(false);
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);

  // Helper: 長押しタイマーをクリア
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
    touchStartTime.current = null;
    setIsLongPressActive(false);
  }, []);

  // Helper: 状態をクリア
  const clearSelectionState = useCallback(() => {
    setIsSelecting(false);
    setSelection(null);
    setSelectionStart(null);
    setShowSelectionPreview(false);
    setIsOverlapping(false);
    isDragging.current = false;
    lastSelectionRef.current = null;
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  // Handler: ダブルクリック
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      const target = e.target as HTMLElement;
      const eventBlock =
        target.closest('[data-event-block]') || target.closest('[data-plan-block]');
      if (eventBlock) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const clickTime = pixelsToTime(y);

      const doubleClickHandler = onDoubleClickProp || onTimeRangeSelect;
      if (doubleClickHandler) {
        const startTotalMinutes = clickTime.hour * 60 + clickTime.minute;
        const endTotalMinutes = Math.min(startTotalMinutes + defaultDuration, 24 * 60 - 1);
        const endHour = Math.floor(endTotalMinutes / 60);
        const endMinute = endTotalMinutes % 60;

        const dateTimeSelection: DateTimeSelection = {
          date,
          startHour: clickTime.hour,
          startMinute: clickTime.minute,
          endHour,
          endMinute,
        };

        doubleClickHandler(dateTimeSelection);
      }

      e.preventDefault();
      e.stopPropagation();
    },
    [pixelsToTime, disabled, onDoubleClickProp, onTimeRangeSelect, date, defaultDuration],
  );

  // Handler: マウスダウン
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const target = e.target as HTMLElement;
      const eventBlock =
        target.closest('[data-event-block]') || target.closest('[data-plan-block]');

      if (eventBlock) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;

      const startTime = pixelsToTime(y);

      setSelectionStart(startTime);
      setSelection({
        startHour: startTime.hour,
        startMinute: startTime.minute,
        endHour: startTime.hour,
        endMinute: startTime.minute + 15,
      });
      setIsSelecting(true);
      isDragging.current = false;

      e.preventDefault();
      e.stopPropagation();
    },
    [pixelsToTime, disabled],
  );

  // Handler: タッチ開始
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;

      const touch = e.touches[0];
      if (!touch) return;

      const target = e.target as HTMLElement;
      const eventBlock =
        target.closest('[data-event-block]') || target.closest('[data-plan-block]');

      if (eventBlock) return;

      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      touchStartTime.current = Date.now();

      const rect = e.currentTarget.getBoundingClientRect();
      const y = touch.clientY - rect.top;
      const startTime = pixelsToTime(y);

      clearLongPressTimer();
      longPressTimer.current = setTimeout(() => {
        setIsLongPressActive(true);
        setSelectionStart(startTime);
        setSelection({
          startHour: startTime.hour,
          startMinute: startTime.minute,
          endHour: startTime.hour,
          endMinute: startTime.minute + 15,
        });
        setIsSelecting(true);
        isDragging.current = false;

        tap();
      }, DRAG_CONSTANTS.LONG_PRESS_DURATION);
    },
    [pixelsToTime, disabled, clearLongPressTimer, tap],
  );

  // Effect: グローバルマウス/タッチイベント（ドラッグ中）
  useEffect(() => {
    if (!isSelecting) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !selectionStart) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const currentTime = pixelsToTime(y);

      const startY = (selectionStart.hour * 60 + selectionStart.minute) * (hourHeight / 60);
      const deltaY = Math.abs(y - startY);
      if (deltaY > DRAG_CONSTANTS.MIN_DRAG_DISTANCE) {
        isDragging.current = true;
        setShowSelectionPreview(true);
      }

      const newSelection = calculateSelection(selectionStart, currentTime);

      // ハプティックフィードバック
      const newStartMinutes = newSelection.startHour * 60 + newSelection.startMinute;
      const newEndMinutes = newSelection.endHour * 60 + newSelection.endMinute;
      if (lastSelectionRef.current) {
        const { startMinutes: prevStart, endMinutes: prevEnd } = lastSelectionRef.current;
        if (newStartMinutes !== prevStart || newEndMinutes !== prevEnd) {
          tap();
        }
      }
      lastSelectionRef.current = { startMinutes: newStartMinutes, endMinutes: newEndMinutes };

      setSelection(newSelection);
      setIsOverlapping(checkOverlap(newSelection));
    };

    const handleGlobalMouseUp = () => {
      if (disabled) {
        clearSelectionState();
        return;
      }

      if (selection && selectionStart) {
        if (isDragging.current && onTimeRangeSelect) {
          if (isOverlapping) {
            clearSelectionState();
            return;
          }

          const dateTimeSelection: DateTimeSelection = {
            date,
            startHour: selection.startHour,
            startMinute: selection.startMinute,
            endHour: selection.endHour,
            endMinute: selection.endMinute,
          };

          onTimeRangeSelect(dateTimeSelection);
          setIsSelecting(false);
          setShowSelectionPreview(false);
          isDragging.current = false;
          return;
        }
      }

      clearSelectionState();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelectionState();
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      if (touchStartPos.current && !isLongPressActive) {
        const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

        if (
          deltaX > DRAG_CONSTANTS.LONG_PRESS_MOVE_THRESHOLD ||
          deltaY > DRAG_CONSTANTS.LONG_PRESS_MOVE_THRESHOLD
        ) {
          clearLongPressTimer();
          return;
        }
      }

      if (!containerRef.current || !selectionStart || !isLongPressActive) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = touch.clientY - rect.top;
      const currentTime = pixelsToTime(y);

      const startY = (selectionStart.hour * 60 + selectionStart.minute) * (hourHeight / 60);
      const deltaY = Math.abs(y - startY);
      if (deltaY > DRAG_CONSTANTS.MIN_DRAG_DISTANCE) {
        isDragging.current = true;
        setShowSelectionPreview(true);
        e.preventDefault();
      }

      const newSelection = calculateSelection(selectionStart, currentTime);

      const newStartMinutes = newSelection.startHour * 60 + newSelection.startMinute;
      const newEndMinutes = newSelection.endHour * 60 + newSelection.endMinute;
      if (lastSelectionRef.current) {
        const { startMinutes: prevStart, endMinutes: prevEnd } = lastSelectionRef.current;
        if (newStartMinutes !== prevStart || newEndMinutes !== prevEnd) {
          tap();
        }
      }
      lastSelectionRef.current = { startMinutes: newStartMinutes, endMinutes: newEndMinutes };

      setSelection(newSelection);
      setIsOverlapping(checkOverlap(newSelection));
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      const handler = onDoubleClickProp || onTimeRangeSelect;

      // シングルタップ検出
      if (!isLongPressActive && touchStartPos.current && touchStartTime.current) {
        const touchDuration = Date.now() - touchStartTime.current;
        const touch = e.changedTouches[0];

        if (touch && touchDuration <= DRAG_CONSTANTS.SINGLE_TAP_MAX_DURATION) {
          const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
          const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

          if (
            deltaX <= DRAG_CONSTANTS.LONG_PRESS_MOVE_THRESHOLD &&
            deltaY <= DRAG_CONSTANTS.LONG_PRESS_MOVE_THRESHOLD
          ) {
            if (handler && containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              const y = touch.clientY - rect.top;
              const tapTime = pixelsToTime(y);

              const startTotalMinutes = tapTime.hour * 60 + tapTime.minute;
              const endTotalMinutes = Math.min(startTotalMinutes + defaultDuration, 24 * 60 - 1);
              const endHour = Math.floor(endTotalMinutes / 60);
              const endMinute = endTotalMinutes % 60;

              const dateTimeSelection: DateTimeSelection = {
                date,
                startHour: tapTime.hour,
                startMinute: tapTime.minute,
                endHour,
                endMinute,
              };

              tap();
              handler(dateTimeSelection);
            }
          }
        }

        clearLongPressTimer();
        return;
      }

      if (!isLongPressActive) {
        clearLongPressTimer();
        return;
      }

      if (disabled) {
        clearSelectionState();
        return;
      }

      if (selection && selectionStart) {
        if (isDragging.current && onTimeRangeSelect) {
          if (isOverlapping) {
            clearSelectionState();
            return;
          }

          const dateTimeSelection: DateTimeSelection = {
            date,
            startHour: selection.startHour,
            startMinute: selection.startMinute,
            endHour: selection.endHour,
            endMinute: selection.endMinute,
          };
          onTimeRangeSelect(dateTimeSelection);
          setIsSelecting(false);
          setShowSelectionPreview(false);
          isDragging.current = false;
          clearLongPressTimer();
          return;
        } else if (handler) {
          const startTotalMinutes = selection.startHour * 60 + selection.startMinute;
          const endTotalMinutes = Math.min(startTotalMinutes + defaultDuration, 24 * 60 - 1);
          const endHour = Math.floor(endTotalMinutes / 60);
          const endMinute = endTotalMinutes % 60;

          const dateTimeSelection: DateTimeSelection = {
            date,
            startHour: selection.startHour,
            startMinute: selection.startMinute,
            endHour,
            endMinute,
          };
          handler(dateTimeSelection);
          setIsSelecting(false);
          setShowSelectionPreview(false);
          isDragging.current = false;
          clearLongPressTimer();
          return;
        }
      }

      clearSelectionState();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [
    isSelecting,
    selectionStart,
    selection,
    pixelsToTime,
    onTimeRangeSelect,
    onDoubleClickProp,
    date,
    disabled,
    isLongPressActive,
    clearLongPressTimer,
    clearSelectionState,
    defaultDuration,
    tap,
    checkOverlap,
    isOverlapping,
    hourHeight,
    containerRef,
  ]);

  // Effect: モーダルキャンセル時のカスタムイベント
  useEffect(() => {
    const handleCalendarDragCancel = () => {
      clearSelectionState();
    };

    window.addEventListener('calendar-drag-cancel', handleCalendarDragCancel);
    return () => window.removeEventListener('calendar-drag-cancel', handleCalendarDragCancel);
  }, [clearSelectionState]);

  // Effect: 外部からの選択範囲表示（サイドバーからの作成時）
  useEffect(() => {
    const handleShowSelection = (e: CustomEvent) => {
      const { date: eventDate, startHour, startMinute, endHour, endMinute } = e.detail;

      const eventDateStr = new Date(eventDate).toDateString();
      const columnDateStr = date.toDateString();

      if (eventDateStr === columnDateStr) {
        setSelection({
          startHour,
          startMinute,
          endHour,
          endMinute,
        });
        setShowSelectionPreview(true);
        setIsOverlapping(false);
      }
    };

    window.addEventListener('calendar-show-selection', handleShowSelection as EventListener);
    return () =>
      window.removeEventListener('calendar-show-selection', handleShowSelection as EventListener);
  }, [date]);

  return {
    isSelecting,
    selection,
    showSelectionPreview,
    isOverlapping,
    handleMouseDown,
    handleDoubleClick,
    handleTouchStart,
  };
}

/**
 * 選択範囲を計算するヘルパー関数
 */
function calculateSelection(
  selectionStart: { hour: number; minute: number },
  currentTime: { hour: number; minute: number },
): TimeRange {
  let startHour, startMinute, endHour, endMinute;

  if (
    currentTime.hour < selectionStart.hour ||
    (currentTime.hour === selectionStart.hour && currentTime.minute < selectionStart.minute)
  ) {
    startHour = currentTime.hour;
    startMinute = currentTime.minute;
    endHour = selectionStart.hour;
    endMinute = selectionStart.minute;
  } else {
    startHour = selectionStart.hour;
    startMinute = selectionStart.minute;
    endHour = currentTime.hour;
    endMinute = currentTime.minute;
  }

  // 最低15分の選択を保証
  if (endHour === startHour && endMinute <= startMinute) {
    endMinute = startMinute + 15;
    if (endMinute >= 60) {
      endHour += 1;
      endMinute = 0;
    }
  }

  return {
    startHour: Math.max(0, startHour),
    startMinute: Math.max(0, startMinute),
    endHour: Math.min(23, endHour),
    endMinute: Math.min(59, endMinute),
  };
}
