'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getEventColor } from '@/features/calendar/theme';
import { calendarStyles } from '@/features/calendar/theme/styles';
import { cn } from '@/lib/utils';

import { HOUR_HEIGHT } from '../constants/grid.constants';

interface DirectDragSelectionProps {
  weekDates: Date[]; // 週の全日付配列
  className?: string;
  onTimeRangeSelect?: (selection: {
    date: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  }) => void;
  onSingleClick?: (date: Date, timeString: string) => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * マウス座標から直接日付を計算するドラッグ選択
 * タッチデバイス対応版
 */
export const DirectDragSelection = ({
  weekDates,
  className,
  onTimeRangeSelect,
  onSingleClick,
  children,
  disabled = false,
}: DirectDragSelectionProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<{
    date: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
  } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{
    date: Date;
    hour: number;
    minute: number;
    x: number;
    y: number;
  } | null>(null);
  const isDragging = useRef(false);
  const isTouchDevice = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // マウス座標から日付と時刻を計算
  const calculateDateTimeFromMouse = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return null;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // X座標から日付インデックスを計算
      const relativeX = clientX - rect.left;
      const columnWidth = rect.width / weekDates.length;
      const dateIndex = Math.floor(relativeX / columnWidth);
      const targetDate = weekDates[dateIndex] ?? weekDates[0];
      if (!targetDate) return null;

      // Y座標から時刻を計算
      const relativeY = clientY - rect.top + container.scrollTop;
      const hourDecimal = relativeY / HOUR_HEIGHT;
      const hour = Math.floor(Math.max(0, Math.min(23, hourDecimal)));
      const minuteDecimal = (hourDecimal - hour) * 60;
      const minute = Math.round(minuteDecimal / 15) * 15; // 15分単位

      console.log('🎯 DirectDragSelection座標計算:', {
        clientX,
        clientY,
        relativeX,
        relativeY,
        columnWidth,
        dateIndex,
        targetDate: targetDate.toDateString(),
        hour,
        minute,
        weekDatesLength: weekDates.length,
      });

      return { date: targetDate, hour, minute };
    },
    [weekDates],
  );

  // 共通のドラッグ開始処理
  const startDragSelection = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return;

      const result = calculateDateTimeFromMouse(clientX, clientY);
      if (!result) return;

      setIsSelecting(true);
      setSelectionStart({
        date: result.date,
        hour: result.hour,
        minute: result.minute,
        x: clientX,
        y: clientY,
      });
      isDragging.current = false;
    },
    [disabled, calculateDateTimeFromMouse],
  );

  // マウスダウン
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      isTouchDevice.current = false;
      startDragSelection(e.clientX, e.clientY);
      e.preventDefault();
    },
    [disabled, startDragSelection],
  );

  // タッチ開始
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      if (e.touches.length !== 1) return;

      isTouchDevice.current = true;
      const touch = e.touches[0];
      if (!touch) return;

      startDragSelection(touch.clientX, touch.clientY);
      // タッチイベントではpreventDefaultしない（スクロールとの競合を避ける）
    },
    [disabled, startDragSelection],
  );

  // グローバルマウス/タッチ移動と終了の処理
  useEffect(() => {
    if (!isSelecting || !selectionStart) return;

    // 共通の移動処理
    const handleMove = (clientX: number, clientY: number) => {
      if (!selectionStart) return;

      // ドラッグ判定
      const deltaX = Math.abs(clientX - selectionStart.x);
      const deltaY = Math.abs(clientY - selectionStart.y);
      if (deltaX > 5 || deltaY > 10) {
        isDragging.current = true;
      }

      const result = calculateDateTimeFromMouse(clientX, clientY);
      if (!result || !result.date) return;

      // 同じ日付内でのみドラッグを許可
      if (result.date.getTime() !== selectionStart.date.getTime()) {
        return;
      }

      let startHour = selectionStart.hour;
      let startMinute = selectionStart.minute;
      let endHour = result.hour;
      let endMinute = result.minute;

      // 上向きドラッグの場合は開始・終了を入れ替え
      if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
        [startHour, endHour] = [endHour, startHour];
        [startMinute, endMinute] = [endMinute, startMinute];
      }

      // 最低15分の選択を保証
      if (endHour === startHour && endMinute <= startMinute) {
        endMinute = startMinute + 15;
        if (endMinute >= 60) {
          endHour += 1;
          endMinute = 0;
        }
      }

      setSelection({
        date: selectionStart.date,
        startHour: Math.max(0, startHour),
        startMinute: Math.max(0, startMinute),
        endHour: Math.min(23, endHour),
        endMinute: Math.min(59, endMinute),
      });
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (!touch) return;
      handleMove(touch.clientX, touch.clientY);
      // ドラッグ中はスクロールを防止
      if (isDragging.current) {
        e.preventDefault();
      }
    };

    // 共通の終了処理
    const handleEnd = () => {
      if (disabled) {
        clearSelectionState();
        return;
      }

      if (selection && isDragging.current && onTimeRangeSelect) {
        onTimeRangeSelect(selection);
      } else if (!isDragging.current && onSingleClick && selectionStart) {
        const timeString = `${String(selectionStart.hour).padStart(2, '0')}:${String(selectionStart.minute).padStart(2, '0')}`;
        onSingleClick(selectionStart.date, timeString);
      }

      clearSelectionState();
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    const handleGlobalTouchEnd = () => {
      handleEnd();
    };

    const clearSelectionState = () => {
      setIsSelecting(false);
      setSelection(null);
      setSelectionStart(null);
      isDragging.current = false;
    };

    // マウスイベント
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    // タッチイベント
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('touchcancel', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [
    isSelecting,
    selectionStart,
    selection,
    onTimeRangeSelect,
    onSingleClick,
    calculateDateTimeFromMouse,
    disabled,
  ]);

  // 選択範囲のスタイルを計算
  const selectionStyle: React.CSSProperties | null = selection
    ? (() => {
        const startMinutes = selection.startHour * 60 + selection.startMinute;
        const endMinutes = selection.endHour * 60 + selection.endMinute;
        const top = startMinutes * (HOUR_HEIGHT / 60);
        const height = (endMinutes - startMinutes) * (HOUR_HEIGHT / 60);

        return {
          position: 'absolute',
          left: 0,
          width: '100%',
          top: `${top}px`,
          height: `${height}px`,
          pointerEvents: 'none',
          zIndex: 1000,
        };
      })()
    : null;

  const selectionClassName = cn(
    getEventColor('scheduled', 'background'),
    calendarStyles.event.borderRadius,
    'border-2 border-primary opacity-50',
  );

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      className={cn('absolute inset-0 touch-none', className)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // キーボードからの操作用のダミーイベントを作成
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const mockEvent = {
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
              preventDefault: () => {},
            } as React.MouseEvent;
            handleMouseDown(mockEvent);
          }
        }
      }}
      aria-label="Time slot selection area"
    >
      {children}

      {/* 選択範囲の表示 */}
      {selectionStyle != null && <div style={selectionStyle} className={selectionClassName} />}
    </div>
  );
};
