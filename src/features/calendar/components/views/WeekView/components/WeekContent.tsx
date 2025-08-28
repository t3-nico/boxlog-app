'use client'

import React, { useCallback } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { EventBlock, CalendarDragSelection, useTimeCalculation, useGlobalDragCursor, useEventStyles } from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop'
import type { CalendarEvent } from '@/features/events'

interface WeekContentProps {
  date: Date
  events: CalendarEvent[]
  eventPositions: any[] // WeekEventPosition[]
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, e: React.MouseEvent) => void
  onEmptyClick?: (date: Date, timeString: string) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onTimeRangeSelect?: (date: Date, startTime: string, endTime: string) => void
  className?: string
  dayIndex: number // 週内での日付インデックス（0-6）
}

export function WeekContent({
  date,
  events,
  eventPositions,
  onEventClick,
  onEventContextMenu,
  onEmptyClick,
  onEventUpdate,
  onTimeRangeSelect,
  className,
  dayIndex
}: WeekContentProps) {
  // ドラッグ&ドロップ機能用にonEventUpdateを変換
  const handleEventUpdate = useCallback(
    async (eventId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onEventUpdate) return
      
      // 既存のイベントを検索
      const event = events.find(e => e.id === eventId)
      if (!event) return
      
      // イベントを更新
      const updatedEvent = {
        ...event,
        startDate: updates.startTime,
        endDate: updates.endTime
      }
      
      onEventUpdate(updatedEvent)
    },
    [onEventUpdate, events]
  )

  // ドラッグ&ドロップ機能
  const { dragState, handlers } = useDragAndDrop({
    onEventUpdate: handleEventUpdate,
    date,
    events
  })

  // 時間計算機能
  const { calculateTimeFromEvent } = useTimeCalculation()

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers)

  // この日のイベント位置をuseEventStylesで変換
  const dayEventPositions = React.useMemo(() => {
    return eventPositions
      .filter(pos => pos.dayIndex === dayIndex)
      .map(pos => ({
        event: pos.event,
        top: pos.top,
        height: pos.height,
        left: 2, // 列内での位置（px）
        width: 96, // 列幅の96%使用
        zIndex: pos.zIndex,
        opacity: 1.0
      }))
  }, [eventPositions, dayIndex])

  const eventStyles = useEventStyles(dayEventPositions)

  // 空白クリックハンドラー
  const handleEmptyClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onEmptyClick) return
    
    const { timeString } = calculateTimeFromEvent(e)
    onEmptyClick(date, timeString)
  }, [date, onEmptyClick, calculateTimeFromEvent])
  
  // イベントクリックハンドラー（ドラッグ・リサイズ後のクリックは無視）
  const handleEventClick = useCallback((event: CalendarEvent) => {
    // ドラッグ・リサイズ操作中またはドラッグ・リサイズ直後のクリックは無視
    if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
      return
    }
    
    onEventClick?.(event)
  }, [onEventClick, dragState.isDragging, dragState.isResizing, dragState.recentlyDragged])
  
  // イベント右クリックハンドラー
  const handleEventContextMenu = useCallback((event: CalendarEvent, mouseEvent: React.MouseEvent) => {
    // ドラッグ操作中またはリサイズ操作中は右クリックを無視
    if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
      return
    }
    onEventContextMenu?.(event, mouseEvent)
  }, [onEventContextMenu, dragState.isDragging, dragState.isResizing, dragState.recentlyDragged])

  return (
    <div className={cn('relative flex-1 bg-background overflow-hidden h-full', className)} data-calendar-grid>
      {/* CalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0 z-10"
        onTimeRangeSelect={(startTime, endTime) => onTimeRangeSelect?.(date, startTime, endTime)}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing || dragState.recentlyDragged || dragState.recentlyResized}
      >
        {/* 背景グリッドはHourLinesがレンダリング済み */}
        <div
          className="absolute inset-0"
          style={{ height: 24 * HOUR_HEIGHT }}
        />
      </CalendarDragSelection>
      
      {/* イベント表示エリア */}
      <div className="absolute inset-0 pointer-events-none" style={{ height: 24 * HOUR_HEIGHT }}>
        {events.map(event => {
          const style = eventStyles[event.id]
          if (!style) return null
          
          const isDragging = dragState.draggedEventId === event.id && dragState.isDragging
          const isResizingThis = dragState.isResizing && dragState.draggedEventId === event.id
          const currentTop = parseFloat(style.top?.toString() || '0')
          const currentHeight = parseFloat(style.height?.toString() || '20')
          
          // ドラッグ・リサイズ中の位置調整（15分単位スナッピング）
          let adjustedStyle = { ...style }
          if (dragState.snappedPosition && (isDragging || isResizingThis)) {
            if (isDragging) {
              // ドラッグ中：位置のみ変更
              adjustedStyle = {
                ...adjustedStyle,
                top: `${dragState.snappedPosition.top}px`,
                zIndex: 1000
              }
            } else if (isResizingThis) {
              // リサイズ中：サイズをリアルタイムで調整
              const resizeHeight = dragState.snappedPosition.height || currentHeight
              
              adjustedStyle = {
                ...adjustedStyle,
                height: `${resizeHeight}px`,
                zIndex: 1000
              }
            }
          }
          
          return (
            <div
              key={event.id}
              style={adjustedStyle}
              className="absolute pointer-events-none"
              data-event-block="true"
            >
              {/* EventBlockの内容部分のみクリック可能 */}
              <div 
                className="pointer-events-auto absolute inset-0"
                onMouseDown={(e) => {
                  // 左クリックのみドラッグ開始
                  if (e.button === 0) {
                    handlers.handleMouseDown(event.id, e, {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight
                    })
                  }
                }}
              >
                <EventBlock
                  event={event}
                  position={{
                    top: 0,
                    left: 0, 
                    width: 100,
                    height: isResizingThis && dragState.snappedPosition ? 
                      dragState.snappedPosition.height : currentHeight
                  }}
                  onClick={() => handleEventClick(event)}
                  onContextMenu={(event, e) => handleEventContextMenu(event, e)}
                  onResizeStart={(event, direction, e, position) => handlers.handleResizeStart(event.id, direction, e, {
                    top: currentTop,
                    left: 0,
                    width: 100,
                    height: currentHeight
                  })}
                  isDragging={isDragging}
                  isResizing={isResizingThis}
                  previewTime={(isDragging || isResizingThis) ? dragState.previewTime : null}
                  showTime={true}
                  showDuration={true}
                  variant="week"
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