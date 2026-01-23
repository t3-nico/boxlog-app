'use client';

/**
 * ドラッグ選択ロジックを管理するカスタムフック
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { format } from 'date-fns';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

import { HOUR_HEIGHT } from '../../constants/grid.constants';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import type { DateTimeSelection, TimeRange } from './types';
import { DRAG_CONSTANTS } from './types';

interface UseDragSelectionOptions {
  date: Date;
  disabled?: boolean | undefined;
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined;
  onDoubleClick?: ((selection: DateTimeSelection) => void) | undefined;
  /** 重複チェック用のプラン一覧 */
  plans?: CalendarPlan[] | undefined;
}

interface UseDragSelectionReturn {
  // State
  isSelecting: boolean;
  selection: TimeRange | null;
  showSelectionPreview: boolean;
  dropTime: string | null;
  isOver: boolean;
  /** 選択範囲が既存プランと重複しているか */
  isOverlapping: boolean;

  // Refs
  containerRef: React.RefObject<HTMLDivElement | null>;

  // Handlers
  handleMouseDown: (e: React.MouseEvent) => void;
  handleDoubleClick: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;

  // Utilities
  formatTime: (hour: number, minute: number) => string;
  droppableId: string;
  droppableData: { date: Date; time: string | null };
}

/**
 * カレンダードラッグ選択のロジックを管理
 */
export function useDragSelection({
  date,
  disabled = false,
  onTimeRangeSelect,
  onDoubleClick: onDoubleClickProp,
  plans = [],
}: UseDragSelectionOptions): UseDragSelectionReturn {
  // 設定からデフォルト時間を取得
  const defaultDuration = useCalendarSettingsStore((state) => state.defaultDuration);
  // ハプティックフィードバック
  const { tap } = useHapticFeedback();

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
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
  const [dropTime, setDropTime] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);

  // 重複チェック関数
  const checkOverlap = useCallback(
    (sel: TimeRange): boolean => {
      if (!plans || plans.length === 0) return false;

      // 選択範囲の開始・終了時刻をDateに変換
      const selStartTime = new Date(date);
      selStartTime.setHours(sel.startHour, sel.startMinute, 0, 0);
      const selEndTime = new Date(date);
      selEndTime.setHours(sel.endHour, sel.endMinute, 0, 0);

      // 既存プランとの重複をチェック
      return plans.some((plan) => {
        if (!plan.startDate || !plan.endDate) return false;

        const planStart = new Date(plan.startDate);
        const planEnd = new Date(plan.endDate);

        // 時間重複条件: 既存の開始 < 新規の終了 AND 既存の終了 > 新規の開始
        return planStart < selEndTime && planEnd > selStartTime;
      });
    },
    [plans, date],
  );

  // Droppable ID and data
  const droppableId = `calendar-droppable-${format(date, 'yyyy-MM-dd')}`;
  const droppableData = { date, time: dropTime };

  // Helper: 時間をフォーマット
  const formatTime = useCallback((hour: number, minute: number): string => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }, []);

  // Helper: 座標から時間を計算
  const pixelsToTime = useCallback((y: number) => {
    const totalMinutes = (y / HOUR_HEIGHT) * 60;
    const hour = Math.floor(totalMinutes / 60);
    const minute = Math.floor((totalMinutes % 60) / 15) * 15;

    if (hour >= 24) {
      return { hour: 23, minute: 45 };
    }

    return { hour: Math.max(0, hour), minute: Math.max(0, minute) };
  }, []);

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

  // Effect: マウスムーブ時にドロップ時刻を更新
  useEffect(() => {
    if (!containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;

      if (y >= 0 && y <= rect.height) {
        const time = pixelsToTime(y);
        const timeString = formatTime(time.hour, time.minute);
        setDropTime(timeString);
        setIsOver(true);
      } else {
        setDropTime(null);
        setIsOver(false);
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    const ref = containerRef.current;

    return () => {
      ref?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pixelsToTime, formatTime]);

  // Effect: グローバルマウス/タッチイベント（ドラッグ中）
  useEffect(() => {
    if (!isSelecting) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !selectionStart) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const currentTime = pixelsToTime(y);

      const startY = (selectionStart.hour * 60 + selectionStart.minute) * (HOUR_HEIGHT / 60);
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
      // リアルタイム重複チェック
      setIsOverlapping(checkOverlap(newSelection));
    };

    const handleGlobalMouseUp = () => {
      if (disabled) {
        clearSelectionState();
        return;
      }

      if (selection && selectionStart) {
        if (isDragging.current && onTimeRangeSelect) {
          const dateTimeSelection: DateTimeSelection = {
            date,
            startHour: selection.startHour,
            startMinute: selection.startMinute,
            endHour: selection.endHour,
            endMinute: selection.endMinute,
          };

          onTimeRangeSelect(dateTimeSelection);
          // 選択を維持（Inspectorが閉じるときにcalendar-drag-cancelイベントでクリア）
          // ドラッグ状態のみリセットし、selection自体は残す
          setIsSelecting(false);
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

      const startY = (selectionStart.hour * 60 + selectionStart.minute) * (HOUR_HEIGHT / 60);
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
      // リアルタイム重複チェック
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
          const dateTimeSelection: DateTimeSelection = {
            date,
            startHour: selection.startHour,
            startMinute: selection.startMinute,
            endHour: selection.endHour,
            endMinute: selection.endMinute,
          };
          onTimeRangeSelect(dateTimeSelection);
          // 選択を維持（Inspectorが閉じるときにcalendar-drag-cancelイベントでクリア）
          setIsSelecting(false);
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
          // タップでも選択を維持
          setIsSelecting(false);
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
  ]);

  // Effect: モーダルキャンセル時のカスタムイベント
  useEffect(() => {
    const handleCalendarDragCancel = () => {
      clearSelectionState();
    };

    window.addEventListener('calendar-drag-cancel', handleCalendarDragCancel);
    return () => window.removeEventListener('calendar-drag-cancel', handleCalendarDragCancel);
  }, [clearSelectionState]);

  return {
    isSelecting,
    selection,
    showSelectionPreview,
    dropTime,
    isOver,
    isOverlapping,
    containerRef,
    handleMouseDown,
    handleDoubleClick,
    handleTouchStart,
    formatTime,
    droppableId,
    droppableData,
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
