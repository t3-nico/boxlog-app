'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { HOUR_HEIGHT } from '../constants/grid.constants';

interface TimeSelection {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

interface DragSelectionLayerProps {
  className?: string;
  onTimeRangeSelect?: (selection: TimeSelection) => void;
  children?: React.ReactNode;
  /** 1時間あたりの高さ（px） */
  hourHeight?: number | undefined;
}

/**
 * 汎用ドラッグ選択レイヤー
 * 時間範囲の選択機能を提供する
 */
export const DragSelectionLayer = ({
  className,
  onTimeRangeSelect,
  children,
  hourHeight = HOUR_HEIGHT,
}: DragSelectionLayerProps) => {
  // ドラッグ選択の状態
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<TimeSelection | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ hour: number; minute: number } | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // 座標から時間を計算
  const pixelsToTime = useCallback(
    (y: number) => {
      const totalMinutes = (y / hourHeight) * 60;
      const hour = Math.floor(totalMinutes / 60);
      const minute = Math.floor((totalMinutes % 60) / 15) * 15; // 15分単位に丸める
      return { hour: Math.max(0, Math.min(23, hour)), minute: Math.max(0, Math.min(45, minute)) };
    },
    [hourHeight],
  );

  // マウスダウン開始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // イベントブロック上のクリックは無視
      const target = e.target as HTMLElement;

      if (target.closest('[data-event-block]')) {
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
      // ドラッグ開始時はイベント伝播を停止
      e.stopPropagation();
    },
    [pixelsToTime],
  );

  // グローバルマウスイベント（ドラッグ中）
  useEffect(() => {
    if (!isSelecting) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !selectionStart) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const currentTime = pixelsToTime(y);

      isDragging.current = true;

      let startHour, startMinute, endHour, endMinute;

      if (
        currentTime.hour < selectionStart.hour ||
        (currentTime.hour === selectionStart.hour && currentTime.minute < selectionStart.minute)
      ) {
        // 上向きにドラッグ
        startHour = currentTime.hour;
        startMinute = currentTime.minute;
        endHour = selectionStart.hour;
        endMinute = selectionStart.minute + 15;
      } else {
        // 下向きにドラッグ
        startHour = selectionStart.hour;
        startMinute = selectionStart.minute;
        endHour = currentTime.hour;
        endMinute = currentTime.minute + 15;
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
      if (selection && isDragging.current) {
        const startTotalMinutes = selection.startHour * 60 + selection.startMinute;
        const endTotalMinutes = selection.endHour * 60 + selection.endMinute;
        const durationMinutes = endTotalMinutes - startTotalMinutes;

        if (durationMinutes >= 15 && onTimeRangeSelect) {
          onTimeRangeSelect(selection);
        }
      }

      setIsSelecting(false);
      setTimeout(() => {
        setSelection(null);
        setSelectionStart(null);
        // isDraggingを少し遅れてリセット（クリックイベントと区別するため）
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      }, 100);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSelecting, selectionStart, selection, pixelsToTime, onTimeRangeSelect]);

  // 選択範囲のスタイルを計算
  const selectionStyle: React.CSSProperties | null = selection
    ? (() => {
        const startMinutes = selection.startHour * 60 + selection.startMinute;
        const endMinutes = selection.endHour * 60 + selection.endMinute;
        const top = startMinutes * (hourHeight / 60);
        const height = (endMinutes - startMinutes) * (hourHeight / 60);

        return {
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          border: '2px solid rgb(59, 130, 246)',
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      })()
    : null;

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      className={cn('relative', className)}
      onMouseDown={handleMouseDown}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // キーボードからの操作用のダミーイベントを作成
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const mockEvent = {
              currentTarget: containerRef.current,
              clientY: rect.top + rect.height / 2,
              target: containerRef.current,
              preventDefault: () => {},
              stopPropagation: () => {},
            } as unknown as React.MouseEvent;
            handleMouseDown(mockEvent);
          }
        }
      }}
      aria-label="Time range selection area"
    >
      {children}

      {/* ドラッグ選択範囲の表示 */}
      {selectionStyle && (
        <div style={selectionStyle}>
          <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-sm font-normal">
            新しいイベント
          </span>
        </div>
      )}
    </div>
  );
};

export type { TimeSelection };
