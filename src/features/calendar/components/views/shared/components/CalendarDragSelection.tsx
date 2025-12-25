'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';

import { getEventColor } from '@/features/calendar/theme';
import { calendarStyles } from '@/features/calendar/theme/styles';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

import { HOUR_HEIGHT } from '../constants/grid.constants';

export interface TimeRange {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface DateTimeSelection extends TimeRange {
  date: Date;
}

interface CalendarDragSelectionProps {
  date: Date; // 必須：この列が担当する日付
  className?: string | undefined;
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined;
  onDoubleClick?: ((selection: DateTimeSelection) => void) | undefined; // ダブルクリック専用ハンドラー（オプション、未指定時はonTimeRangeSelectが呼ばれる）
  children?: React.ReactNode | undefined;
  disabled?: boolean | undefined; // ドラッグ選択を無効にする
}

/**
 * 日付を知るドラッグ選択レイヤー
 * - 各カレンダー列が担当する日付を明確に持つ
 * - 全ビュー共通のドラッグ選択動作を提供
 * - ドラッグ操作で時間範囲選択、ダブルクリックでプラン作成
 * - 統一されたDateTimeSelectionを出力
 */
export const CalendarDragSelection = ({
  date,
  className,
  onTimeRangeSelect,
  onDoubleClick,
  children,
  disabled = false,
}: CalendarDragSelectionProps) => {
  // 設定からデフォルト時間を取得
  const defaultDuration = useCalendarSettingsStore((state) => state.defaultDuration);
  // ドラッグ選択の状態
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<TimeRange | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ hour: number; minute: number } | null>(
    null,
  );
  const [showSelectionPreview, setShowSelectionPreview] = useState(false); // 5px以上移動したらtrue（ゴースト表示用）
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const [dropTime, setDropTime] = useState<string | null>(null);

  // ドロップ可能エリアとして設定
  // ドロップ先データ: { date: Date, time: string }
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-droppable-${format(date, 'yyyy-MM-dd')}`,
    data: {
      date, // Date型
      time: dropTime, // 'HH:mm' または null
    },
  });

  // 状態をクリアするヘルパー関数
  const clearSelectionState = () => {
    setIsSelecting(false);
    setSelection(null);
    setSelectionStart(null);
    setShowSelectionPreview(false);
    isDragging.current = false;
  };

  // 時間をフォーマットするヘルパー関数
  const formatTime = useCallback((hour: number, minute: number): string => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }, []);

  // 座標から時間を計算
  const pixelsToTime = useCallback((y: number) => {
    const totalMinutes = (y / HOUR_HEIGHT) * 60;
    const hour = Math.floor(totalMinutes / 60);
    const minute = Math.floor((totalMinutes % 60) / 15) * 15; // 15分単位に丸める

    // 時間が24時を超える場合の処理
    if (hour >= 24) {
      return { hour: 23, minute: 45 };
    }

    return { hour: Math.max(0, hour), minute: Math.max(0, minute) };
  }, []);

  // ダブルクリックで予定作成
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      // 無効化されている場合は何もしない
      if (disabled) return;

      // イベントブロック上のダブルクリックは無視
      const target = e.target as HTMLElement;
      const eventBlock =
        target.closest('[data-event-block]') || target.closest('[data-plan-block]');
      if (eventBlock) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const clickTime = pixelsToTime(y);

      // ダブルクリック位置からdefaultDuration分のプランを作成
      const doubleClickHandler = onDoubleClick || onTimeRangeSelect;
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
    [pixelsToTime, disabled, onDoubleClick, onTimeRangeSelect, date, defaultDuration],
  );

  // マウスダウン開始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 無効化されている場合は何もしない
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // イベントブロック上のクリックは無視
      // data-event-block: DayView用
      // data-plan-block: WeekView/ThreeDayView/FiveDayView用
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
        endMinute: startTime.minute + 15, // 最小15分
      });
      setIsSelecting(true);
      isDragging.current = false;

      e.preventDefault();
      e.stopPropagation();
    },
    [pixelsToTime, disabled],
  );

  // マウスムーブ時にドロップ時刻を更新（ドラッグ中でない場合も）
  useEffect(() => {
    if (!containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // カーソルがコンテナ内にある場合のみ時刻を計算
      if (y >= 0 && y <= rect.height) {
        const time = pixelsToTime(y);
        const timeString = formatTime(time.hour, time.minute);
        setDropTime(timeString);
      } else {
        setDropTime(null);
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    const ref = containerRef.current;

    return () => {
      ref?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pixelsToTime, formatTime]);

  // グローバルマウスイベント（ドラッグ中）
  useEffect(() => {
    if (!isSelecting) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !selectionStart) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const currentTime = pixelsToTime(y);

      // 5px以上の移動があった場合のみドラッグとして扱う
      const startY = (selectionStart.hour * 60 + selectionStart.minute) * (HOUR_HEIGHT / 60);
      const deltaY = Math.abs(y - startY);
      if (deltaY > 5) {
        isDragging.current = true;
        setShowSelectionPreview(true); // ゴースト表示を有効化
      }

      let startHour, startMinute, endHour, endMinute;

      if (
        currentTime.hour < selectionStart.hour ||
        (currentTime.hour === selectionStart.hour && currentTime.minute < selectionStart.minute)
      ) {
        // 上向きにドラッグ
        startHour = currentTime.hour;
        startMinute = currentTime.minute;
        endHour = selectionStart.hour;
        endMinute = selectionStart.minute;
      } else {
        // 下向きにドラッグ
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

      const newSelection = {
        startHour: Math.max(0, startHour),
        startMinute: Math.max(0, startMinute),
        endHour: Math.min(23, endHour),
        endMinute: Math.min(59, endMinute),
      };

      setSelection(newSelection);
    };

    const handleGlobalMouseUp = () => {
      // 無効化されている場合は何もしない
      if (disabled) {
        clearSelectionState();
        return;
      }

      if (selection && selectionStart) {
        if (isDragging.current && onTimeRangeSelect) {
          // ドラッグした場合：時間範囲選択でプラン作成
          const dateTimeSelection: DateTimeSelection = {
            date,
            startHour: selection.startHour,
            startMinute: selection.startMinute,
            endHour: selection.endHour,
            endMinute: selection.endMinute,
          };

          onTimeRangeSelect(dateTimeSelection);
        }
        // シングルクリックでは何もしない（ダブルクリックで作成）
      }

      clearSelectionState();
    };

    // Escキーでドラッグをキャンセル
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelectionState();
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isSelecting,
    selectionStart,
    selection,
    pixelsToTime,
    onTimeRangeSelect,
    date,
    disabled,
    formatTime,
  ]);

  // モーダルキャンセル時のカスタムイベントリスナー
  useEffect(() => {
    const handleCalendarDragCancel = () => {
      clearSelectionState();
    };

    window.addEventListener('calendar-drag-cancel', handleCalendarDragCancel);
    return () => window.removeEventListener('calendar-drag-cancel', handleCalendarDragCancel);
  }, []);

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
          width: '100%', // right:0の代わりにwidth:100%を使用
          top: `${top}px`,
          height: `${height}px`,
          pointerEvents: 'none',
          zIndex: 1000,
        };
      })()
    : null;

  // scheduledカラーベースのクラス名を生成（イベントカードと同じスタイル）
  const selectionClassName = cn(
    getEventColor('scheduled', 'background'), // テーマのscheduledカラーを直接使用
    calendarStyles.event.borderRadius,
    calendarStyles.event.shadow.default,
    'pointer-events-none',
    'opacity-80', // ドラッグ中は少し透過
  );

  return (
    <div
      ref={(node) => {
        // 両方のrefを設定
        containerRef.current = node;
        setNodeRef(node);
      }}
      className={cn('relative', className, isOver && 'bg-primary/5')}
      role="button"
      tabIndex={0}
      aria-label="Calendar drag selection area"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        // クリックイベントの伝播を停止して、ScrollableCalendarLayoutのonClickが呼ばれないようにする
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // キーボードでの選択操作の代替手段
        }
      }}
    >
      {children}

      {/* ドラッグ選択範囲の表示（イベントカードと同じスタイル）- 5px以上ドラッグした場合のみ表示 */}
      {showSelectionPreview && selectionStyle && selection ? (
        <div style={selectionStyle} className={selectionClassName}>
          <div
            className={cn(
              'flex h-full flex-col',
              calendarStyles.event.padding, // イベントカードと同じパディング
            )}
          >
            {/* タイトル */}
            <div
              className={cn(
                getEventColor('scheduled', 'text'),
                calendarStyles.event.fontSize.title,
                'mb-1 leading-tight font-medium',
              )}
            >
              新しいイベント
            </div>

            {/* 時間表示（ドラッグ中にリアルタイム更新） */}
            <div
              className={cn(
                getEventColor('scheduled', 'text'),
                calendarStyles.event.fontSize.time,
                'leading-tight opacity-75',
              )}
            >
              {formatTime(selection.startHour, selection.startMinute)} -{' '}
              {formatTime(selection.endHour, selection.endMinute)}
            </div>

            {/* 時間幅の表示 */}
            <div
              className={cn(
                getEventColor('scheduled', 'text'),
                calendarStyles.event.fontSize.duration,
                'mt-auto opacity-60',
              )}
            >
              {(() => {
                const totalMinutes =
                  (selection.endHour - selection.startHour) * 60 +
                  (selection.endMinute - selection.startMinute);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                if (hours > 0) {
                  return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;
                }
                return `${minutes}分`;
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
