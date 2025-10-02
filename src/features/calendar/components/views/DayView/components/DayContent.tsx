'use client'

import React, { useCallback } from 'react'

import { cn } from '@/lib/utils'

import { CalendarDragSelection, EventBlock, calculateEventGhostStyle, calculatePreviewTime } from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useGlobalDragCursor } from '../../shared/hooks/useGlobalDragCursor'
import { useTimeCalculation } from '../../shared/hooks/useTimeCalculation'
import type { CalendarEvent } from '../../shared/types/event.types'
import type { DayContentProps } from '../DayView.types'
import { useDragAndDrop } from '../hooks/useDragAndDrop'

export const DayContent = ({
  date,
  events,
  eventStyles,
  onEventClick,
  onEventContextMenu,
  onEmptyClick,
  onEventUpdate,
  onTimeRangeSelect,
  className,
}: DayContentProps) => {
  // ドラッグ&ドロップ機能用にonEventUpdateを変換
  const handleEventUpdate = useCallback(
    async (eventId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onEventUpdate) return

      // handleUpdateEvent形式で呼び出し
      await onEventUpdate(eventId, {
        startTime: updates.startTime,
        endTime: updates.endTime,
      })
    },
    [onEventUpdate]
  )

  // ドラッグ&ドロップ機能
  // @ts-expect-error TODO(#389): TimedEvent型をCalendarEvent型に統一する必要がある
  const { dragState, handlers } = useDragAndDrop({
    onEventUpdate: handleEventUpdate,
    onEventClick,
    date,
    events,
  })

  // 時間計算機能
  const { calculateTimeFromEvent } = useTimeCalculation()

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers)
  // 空白クリックハンドラー（現在使用されていない - CalendarDragSelectionが処理）
  const handleEmptyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onEmptyClick) return

      const { timeString } = calculateTimeFromEvent(e)
      onEmptyClick(date, timeString)
    },
    [date, onEmptyClick, calculateTimeFromEvent]
  )

  // イベントクリックハンドラー（ドラッグ・リサイズ中のクリックは無視）
  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      // ドラッグ・リサイズ操作中のクリックは無視
      if (dragState.isDragging || dragState.isResizing) {
        return
      }
      // @ts-expect-error TODO(#389): TimedEvent型をCalendarEvent型に統一する必要がある
      onEventClick?.(event)
    },
    [onEventClick, dragState.isDragging, dragState.isResizing]
  )

  // イベント右クリックハンドラー
  const handleEventContextMenu = useCallback(
    (event: CalendarEvent, mouseEvent: React.MouseEvent) => {
      // ドラッグ操作中またはリサイズ操作中は右クリックを無視
      if (dragState.isDragging || dragState.isResizing) {
        return
      }
      // @ts-expect-error TODO(#389): TimedEvent型をCalendarEvent型に統一する必要がある
      onEventContextMenu?.(event, mouseEvent)
    },
    [onEventContextMenu, dragState.isDragging, dragState.isResizing]
  )

  // 時間グリッドの生成（1時間単位、23時は下線なし）
  const timeGrid = Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      className={`relative ${hour < 23 ? 'border-b border-neutral-900/20 dark:border-neutral-100/20' : ''}`}
      style={{ height: HOUR_HEIGHT }}
    />
  ))

  return (
    <div className={cn('bg-background relative flex-1 overflow-hidden', className)} data-calendar-grid>
      {/* 新しいCalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing} // ドラッグ・リサイズ中は背景クリックを無効化
      >
        {/* 背景グリッド（CalendarDragSelectionが全イベントを処理） */}
        <div className={`absolute inset-0`} style={{ height: 24 * HOUR_HEIGHT }}>
          {timeGrid}
        </div>
      </CalendarDragSelection>

      {/* イベント表示エリア */}
      <div className="pointer-events-none absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
        {events.map((event) => {
          const style = eventStyles[event.id]
          if (!style) return null

          const isDragging = dragState.draggedEventId === event.id && dragState.isDragging
          const isResizingThis = dragState.isResizing && dragState.draggedEventId === event.id
          const currentTop = parseFloat(style.top?.toString() || '0')
          const currentHeight = parseFloat(style.height?.toString() || '20')

          // ゴースト表示スタイル（共通化）
          const adjustedStyle = calculateEventGhostStyle(style, event.id, dragState)

          return (
            <div key={event.id} style={adjustedStyle} className="pointer-events-none absolute" data-event-block="true">
              {/* EventBlockの内容部分のみクリック可能 */}
              <div
                className="pointer-events-auto absolute inset-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                role="button"
                tabIndex={0}
                aria-label={`Drag event: ${event.title}`}
                onMouseDown={(e) => {
                  // 左クリックのみドラッグ開始
                  if (e.button === 0) {
                    handlers.handleMouseDown(event.id, e, {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight,
                    })
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // キーボードでドラッグ操作を開始する代替手段
                    // ここでは単純にフォーカスを維持
                  }
                }}
              >
                <EventBlock
                  event={event}
                  position={{
                    top: 0,
                    left: 0,
                    width: 100,
                    height:
                      isResizingThis && dragState.snappedPosition ? dragState.snappedPosition.height : currentHeight,
                  }}
                  // クリックは useDragAndDrop で処理されるため削除
                  onContextMenu={(event, e) => handleEventContextMenu(event, e)}
                  onResizeStart={(event, direction, e, _position) =>
                    handlers.handleResizeStart(event.id, direction, e, {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight,
                    })
                  }
                  isDragging={isDragging}
                  isResizing={isResizingThis}
                  previewTime={calculatePreviewTime(event.id, dragState)}
                  className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
