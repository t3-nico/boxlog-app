// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import React, { useCallback, useEffect } from 'react'

import { cn } from '@/lib/utils'

import { HOUR_HEIGHT } from '../../constants/grid.constants'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import type { CalendarEvent } from '../../types/event.types'
import { CalendarDragSelection } from '../CalendarDragSelection'
import { EventBlock } from '../EventBlock'

export interface EventGridProps {
  date: Date
  events: CalendarEvent[]
  eventStyles: Record<string, React.CSSProperties>
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, e: React.MouseEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onTimeRangeSelect?: (start: Date, end: Date) => void
  className?: string
  showTimeGrid?: boolean
  showCurrentTime?: boolean
}

/**
 * 共通のイベントグリッドコンポーネント
 * 全てのビュー（Day, Week, ThreeDay等）で利用可能
 */
export const EventGrid = ({
  date,
  events,
  eventStyles,
  onEventClick,
  onEventContextMenu,
  onEmptyClick,
  onEventUpdate,
  onTimeRangeSelect,
  className,
  showTimeGrid = true,
}: EventGridProps) => {
  // ドラッグ&ドロップ機能
  const { dragState, handlers } = useDragAndDrop({
    onEventUpdate: onEventUpdate
      ? async (eventId, updates) => {
          const event = events.find((e) => e.id === eventId)
          if (event) {
            await onEventUpdate({
              ...event,
              start: updates.startTime,
              end: updates.endTime,
            })
          }
        }
      : undefined,
    date,
    events,
  })

  // グローバルマウスイベント処理
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handlers.handleMouseMove)
      document.addEventListener('mouseup', handlers.handleMouseUp)

      // カーソル制御
      if (dragState.isResizing) {
        document.body.style.cursor = 'ns-resize'
        document.body.style.userSelect = 'none'
      } else if (dragState.isDragging) {
        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
      }

      return () => {
        document.removeEventListener('mousemove', handlers.handleMouseMove)
        document.removeEventListener('mouseup', handlers.handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [dragState.isDragging, dragState.isResizing, handlers.handleMouseMove, handlers.handleMouseUp])

  // イベントクリックハンドラー
  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
        return
      }
      onEventClick?.(event)
    },
    [onEventClick, dragState]
  )

  // イベント右クリックハンドラー
  const handleEventContextMenu = useCallback(
    (event: CalendarEvent, mouseEvent: React.MouseEvent) => {
      if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
        return
      }
      onEventContextMenu?.(event, mouseEvent)
    },
    [onEventContextMenu, dragState]
  )

  // 時間グリッドの生成
  const timeGrid = showTimeGrid
    ? Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className={cn('relative', hour < 23 && 'border-b border-neutral-900/20 dark:border-neutral-100/20')}
          style={{ height: HOUR_HEIGHT }}
        />
      ))
    : null

  return (
    <div className={cn('bg-background relative flex-1 overflow-hidden', className)}>
      {/* 背景選択レイヤー */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing}
      >
        {/* 時間グリッド */}
        {showTimeGrid != null && (
          <div className="absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
            {timeGrid}
          </div>
        )}
      </CalendarDragSelection>

      {/* イベント表示レイヤー */}
      <div className="pointer-events-none absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
        {events.map((event) => {
          const style = eventStyles[event.id]
          if (!style) return null

          const isDragging = dragState.draggedEventId === event.id && dragState.isDragging
          const isResizing = dragState.isResizing && dragState.draggedEventId === event.id

          // ドラッグ・リサイズ中の位置調整
          const adjustedStyle = { ...style }
          if (dragState.snappedPosition && (isDragging || isResizing)) {
            if (isDragging) {
              adjustedStyle.top = `${dragState.snappedPosition.top}px`
            } else if (isResizing && dragState.snappedPosition.height) {
              adjustedStyle.height = `${dragState.snappedPosition.height}px`
            }
            adjustedStyle.zIndex = 1000
          }

          return (
            <div key={event.id} style={adjustedStyle} className="pointer-events-none absolute">
              <div
                className="pointer-events-auto absolute inset-0 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
                role="button"
                tabIndex={0}
                aria-label={`Drag event: ${event.title}`}
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    handlers.handleMouseDown(event.id, e, {
                      top: parseFloat(style.top?.toString() || '0'),
                      left: 0,
                      width: 100,
                      height: parseFloat(style.height?.toString() || '20'),
                    })
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
                    height: parseFloat(adjustedStyle.height?.toString() || '20'),
                  }}
                  onClick={() => handleEventClick(event)}
                  onContextMenu={(evt, e) => handleEventContextMenu(evt, e)}
                  onResizeStart={(evt, direction, e) =>
                    handlers.handleResizeStart(evt.id, direction, e, {
                      top: parseFloat(style.top?.toString() || '0'),
                      left: 0,
                      width: 100,
                      height: parseFloat(style.height?.toString() || '20'),
                    })
                  }
                  isDragging={isDragging}
                  isResizing={isResizing}
                  previewTime={isDragging || isResizing ? dragState.previewTime : null}
                  className={cn('h-full w-full', isDragging && 'cursor-grabbing', !isDragging && 'cursor-grab')}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EventGrid
