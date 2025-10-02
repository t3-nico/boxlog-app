// @ts-nocheck
// TODO(#389): 型エラーを修正後、@ts-nocheckを削除
'use client'

import React, { useCallback } from 'react'

import type { CalendarEvent } from '@/features/events'
import { cn } from '@/lib/utils'

import {
  calculateEventGhostStyle,
  calculatePreviewTime,
  CalendarDragSelection,
  EventBlock,
  useGlobalDragCursor,
  useTimeCalculation,
} from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop'

interface ThreeDayContentProps {
  date: Date
  events: CalendarEvent[]
  eventStyles: Record<string, React.CSSProperties>
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, e: React.MouseEvent) => void
  onEmptyClick?: (date: Date, timeString: string) => void
  onEventUpdate?: (eventId: string, updates: Partial<CalendarEvent>) => void
  onTimeRangeSelect?: (date: Date, startTime: string, endTime: string) => void
  className?: string
  dayIndex: number // 3日間内での日付インデックス（0-2）
  displayDates?: Date[] // 3日間の全日付配列（日付間移動用）
}

export const ThreeDayContent = ({
  date,
  events,
  eventStyles,
  onEventClick,
  onEventContextMenu,
  onEmptyClick,
  onEventUpdate,
  onTimeRangeSelect,
  className,
  dayIndex,
  displayDates,
}: ThreeDayContentProps) => {
  // ドラッグ&ドロップ機能用にonEventUpdateを変換
  const handleEventUpdate = useCallback(
    async (eventId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onEventUpdate) return

      console.log('🔧 ThreeDayContent: イベント更新要求:', {
        eventId,
        startTime: updates.startTime.toISOString(),
        endTime: updates.endTime.toISOString(),
      })

      // handleUpdateEvent形式で呼び出し
      await onEventUpdate(eventId, {
        startTime: updates.startTime,
        endTime: updates.endTime,
      })
    },
    [onEventUpdate]
  )

  // ドラッグ&ドロップ機能（日付間移動対応）
  const { dragState, handlers } = useDragAndDrop({
    onEventUpdate: handleEventUpdate,
    onEventClick,
    date,
    events,
    displayDates,
    viewMode: '3day',
  })

  // 時間計算機能
  const { calculateTimeFromEvent } = useTimeCalculation()

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers)

  // 空白クリックハンドラー
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
      onEventContextMenu?.(event, mouseEvent)
    },
    [onEventContextMenu, dragState.isDragging, dragState.isResizing]
  )

  return (
    <div className={cn('bg-background relative h-full flex-1 overflow-hidden', className)} data-calendar-grid>
      {/* CalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={(startTime, endTime) => onTimeRangeSelect?.(date, startTime, endTime)}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing}
      >
        {/* 背景グリッドはHourLinesがレンダリング済み */}
        <div className="absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }} />
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
                    handlers.handleMouseDown(
                      event.id,
                      e,
                      {
                        top: currentTop,
                        left: 0,
                        width: 100,
                        height: currentHeight,
                      },
                      dayIndex
                    ) // 日付インデックスを渡す
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // キーボードでドラッグ操作を開始する代替手段
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
