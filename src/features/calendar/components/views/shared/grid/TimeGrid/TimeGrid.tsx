/**
 * メインのタイムグリッドコンポーネント
 */

'use client';

import React, { memo, useCallback, useEffect, useRef } from 'react';

import {
  GRID_BACKGROUND,
  HOUR_HEIGHT,
  SCROLL_TO_HOUR,
  TIME_COLUMN_WIDTH,
} from '../../constants/grid.constants';
import { useTimeSelection } from '../../hooks/useTimeSelection';
import { useViewDimensions } from '../../hooks/useViewDimensions';
import type { TimeGridProps } from '../../types/grid.types';
import { calculateScrollPosition, pixelsToTimeValues } from '../../utils/gridCalculator';
import { HalfHourLines, HourLines, QuarterHourLines } from '../GridLines';
import { TimeColumn } from '../TimeColumn';

export const TimeGrid = memo<TimeGridProps>(function TimeGrid({
  startHour = 0,
  endHour = 24,
  hourHeight = HOUR_HEIGHT,
  showHalfHourLines = true,
  showQuarterHourLines = false,
  className = '',
  children,
  onTimeClick,
  onTimeRangeSelect,
  scrollToHour = SCROLL_TO_HOUR,
}) {
  const { containerRef, dimensions } = useViewDimensions({
    hourHeight,
    timeColumnWidth: TIME_COLUMN_WIDTH,
  });

  // ドラッグ選択機能
  const { isSelecting, handleMouseDown, selectionStyle } = useTimeSelection({
    hourHeight,
    timeColumnWidth: TIME_COLUMN_WIDTH,
    onTimeRangeSelect: onTimeRangeSelect
      ? (selection) => {
          // TimeSelectionをDate形式に変換してコールバックを呼ぶ

          // 時間範囲の文字列を作成
          const startTimeStr = `${String(selection.startHour).padStart(2, '0')}:${String(selection.startMinute).padStart(2, '0')}`;
          const endTimeStr = `${String(selection.endHour).padStart(2, '0')}:${String(selection.endMinute).padStart(2, '0')}`;
          const timeRangeStr = `${startTimeStr}-${endTimeStr}`;

          console.log('🎯 Time range selected:', { selection, timeRangeStr });

          // onTimeRangeSelectに渡すためのカスタムコールバック
          onTimeRangeSelect(selection);
        }
      : undefined,
  });

  const hasScrolledToInitial = useRef(false);

  // グリッドの総高さを計算
  const gridHeight = (endHour - startHour) * hourHeight;

  // 初期スクロール位置の設定
  useEffect(() => {
    if (!hasScrolledToInitial.current && containerRef.current) {
      const targetPosition = calculateScrollPosition(
        scrollToHour,
        hourHeight,
        dimensions.containerHeight,
      );
      containerRef.current.scrollTo({
        top: targetPosition,
        behavior: 'instant' as ScrollBehavior,
      });
      hasScrolledToInitial.current = true;
    }
  }, [scrollToHour, hourHeight, dimensions.containerHeight, containerRef]);

  // グリッドクリックハンドラー（ドラッグしていない場合のみ）
  const handleGridClick = useCallback(
    (e: React.MouseEvent) => {
      // ドラッグ中はクリックを無視
      if (isSelecting || !onTimeClick || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top + containerRef.current.scrollTop;
      const x = e.clientX - rect.left;

      // 時間列以外の領域のクリックのみ処理
      if (x < TIME_COLUMN_WIDTH) return;

      const { hour, minute } = pixelsToTimeValues(y, hourHeight);

      // 表示範囲内の時間のみ処理
      if (hour >= startHour && hour < endHour) {
        onTimeClick(hour, minute);
      }
    },
    [isSelecting, onTimeClick, containerRef, hourHeight, startHour, endHour],
  );

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      className={`relative overflow-auto ${GRID_BACKGROUND} ${className} ${isSelecting ? 'select-none' : ''}`}
      style={{ height: '100%' }}
      onClick={handleGridClick}
      onMouseDown={handleMouseDown}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // キーボードからの操作用のダミーイベントを作成
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const mockEvent = {
              currentTarget: containerRef.current,
              clientX: rect.left + rect.width / 2,
              clientY: rect.top + rect.height / 2,
              stopPropagation: () => {},
            } as unknown as React.MouseEvent;
            handleGridClick(mockEvent);
          }
        }
      }}
      aria-label="Time grid - click to create event"
    >
      {/* スクロールバーはglobals.cssのグローバルスタイルを使用 */}
      {/* 時間列（固定） */}
      <TimeColumn startHour={startHour} endHour={endHour} hourHeight={hourHeight} />

      {/* メインコンテンツエリア */}
      <div
        className="relative"
        style={{
          marginLeft: `${TIME_COLUMN_WIDTH}px`,
          height: `${gridHeight}px`,
          minHeight: `${gridHeight}px`,
        }}
      >
        {/* グリッド線 */}
        <HourLines startHour={startHour} endHour={endHour} hourHeight={hourHeight} />

        {showHalfHourLines != null && (
          <HalfHourLines startHour={startHour} endHour={endHour} hourHeight={hourHeight} />
        )}

        {showQuarterHourLines != null && (
          <QuarterHourLines startHour={startHour} endHour={endHour} hourHeight={hourHeight} />
        )}

        {/* 現在時刻線 - ScrollableCalendarLayoutで統一表示するためコメントアウト */}
        {/* showCurrentTime && (
          <SimpleCurrentTimeLine
            hourHeight={hourHeight}
            displayDates={displayDates}
            timeColumnWidth={TIME_COLUMN_WIDTH}
          />
        ) */}

        {/* ドラッグ選択範囲の表示 */}
        {selectionStyle != null && (
          <div style={selectionStyle} className="drag-selection">
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
              新しいイベント
            </div>
          </div>
        )}

        {/* 子コンポーネント（イベント等） */}
        {children}
      </div>
    </div>
  );
});
