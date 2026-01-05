'use client';

import React, { useCallback } from 'react';

import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { cn } from '@/lib/utils';

import {
  CalendarDragSelection,
  EventBlock,
  calculateEventGhostStyle,
  calculatePreviewTime,
} from '../../shared';
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants';
import { useGlobalDragCursor } from '../../shared/hooks/useGlobalDragCursor';
import type { CalendarPlan } from '../../shared/types/base.types';
import type { DayContentProps } from '../DayView.types';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

export const DayContent = ({
  date,
  events,
  eventStyles,
  onPlanClick,
  onPlanContextMenu,
  onEventUpdate,
  onTimeRangeSelect,
  disabledPlanId,
  className,
}: DayContentProps) => {
  // Inspectorで開いているプランのIDを取得
  const inspectorPlanId = usePlanInspectorStore((state) => state.planId);
  const isInspectorOpen = usePlanInspectorStore((state) => state.isOpen);

  // グリッド高さ（24時間）
  const gridHeight = 24 * HOUR_HEIGHT;

  // ドラッグ&ドロップ機能用にonEventUpdateを変換
  const handleEventUpdate = useCallback(
    async (eventId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onEventUpdate) return;

      // handleUpdatePlan形式で呼び出し
      await onEventUpdate(eventId, {
        startTime: updates.startTime,
        endTime: updates.endTime,
      });
    },
    [onEventUpdate],
  );

  // ドラッグ&ドロップ機能
  const { dragState, handlers } = useDragAndDrop({
    onEventUpdate: handleEventUpdate,
    ...(onPlanClick && { onEventClick: onPlanClick }),
    date,
    events: events ?? [],
    disabledPlanId,
  });

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers);

  // プラン右クリックハンドラー
  const handlePlanContextMenu = useCallback(
    (plan: CalendarPlan, mouseEvent: React.MouseEvent) => {
      // ドラッグ操作中またはリサイズ操作中は右クリックを無視
      if (dragState.isDragging || dragState.isResizing) {
        return;
      }
      onPlanContextMenu?.(plan, mouseEvent);
    },
    [onPlanContextMenu, dragState.isDragging, dragState.isResizing],
  );

  // 時間グリッドの生成
  const timeGrid = React.useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className={`relative ${hour < 23 ? 'border-border border-b' : ''}`}
          style={{ height: HOUR_HEIGHT }}
        />
      )),
    [],
  );

  return (
    <div
      className={cn('bg-background relative flex-1 overflow-hidden', className)}
      data-calendar-grid
    >
      {/* CalendarDragSelectionを使用（ドラッグ操作のみでプラン作成） */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        disabled={dragState.isPending || dragState.isDragging || dragState.isResizing}
        plans={events}
      >
        {/* 背景グリッド */}
        <div className="absolute inset-0" style={{ height: gridHeight }}>
          {timeGrid}
        </div>
      </CalendarDragSelection>

      {/* イベント表示エリア - CalendarDragSelectionより上にz-indexを設定 */}
      <div className="pointer-events-none absolute inset-0 z-20" style={{ height: gridHeight }}>
        {events &&
          Array.isArray(events) &&
          events.map((event) => {
            const style = eventStyles?.[event.id];
            if (!style) return null;

            const isDragging = dragState.draggedEventId === event.id && dragState.isDragging;
            const isResizingThis = dragState.isResizing && dragState.draggedEventId === event.id;
            const currentTop = parseFloat(style.top?.toString() || '0');
            const currentHeight = parseFloat(style.height?.toString() || '20');

            // ゴースト表示スタイル（共通化）
            const adjustedStyle = calculateEventGhostStyle(style, event.id, dragState);

            return (
              <div
                key={event.id}
                style={adjustedStyle}
                className="pointer-events-none absolute"
                data-event-wrapper="true"
              >
                {/* EventBlockの内容部分のみクリック可能 */}
                <div
                  className="focus:ring-ring pointer-events-auto absolute inset-0 rounded focus:ring-2 focus:ring-offset-1 focus:outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Drag event: ${event.title}`}
                  data-event-block="true"
                  onMouseDown={(e) => {
                    // 左クリックのみドラッグ開始
                    if (e.button === 0) {
                      handlers.handleMouseDown(event.id, e, {
                        top: currentTop,
                        left: 0,
                        width: 100,
                        height: currentHeight,
                      });
                    }
                  }}
                  onTouchStart={(e) => {
                    // モバイル: タッチでドラッグ開始（長押しで開始）
                    handlers.handleTouchStart(event.id, e, {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // キーボードでドラッグ操作を開始する代替手段
                      // ここでは単純にフォーカスを維持
                    }
                  }}
                >
                  <EventBlock
                    plan={event}
                    position={{
                      top: 0,
                      left: 0,
                      width: 100,
                      height:
                        isResizingThis && dragState.snappedPosition
                          ? (dragState.snappedPosition.height ?? currentHeight)
                          : currentHeight,
                    }}
                    // クリックは useDragAndDrop で処理されるため削除
                    onContextMenu={(event: CalendarPlan, e: React.MouseEvent) =>
                      handlePlanContextMenu(event, e)
                    }
                    onResizeStart={(
                      event: CalendarPlan,
                      direction: 'top' | 'bottom',
                      e: React.MouseEvent,
                      _position: { top: number; left: number; width: number; height: number },
                    ) =>
                      handlers.handleResizeStart(event.id, direction, e, {
                        top: currentTop,
                        left: 0,
                        width: 100,
                        height: currentHeight,
                      })
                    }
                    isDragging={isDragging}
                    isResizing={isResizingThis}
                    isActive={isInspectorOpen && inspectorPlanId === event.id}
                    previewTime={calculatePreviewTime(event.id, dragState)}
                    className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
