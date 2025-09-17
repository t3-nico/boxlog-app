'use client'

import React, { useCallback } from 'react'

import type { CalendarEvent } from '@/features/events'
import { cn } from '@/lib/utils'

import { EventBlock, CalendarDragSelection, useTimeCalculation, useGlobalDragCursor, useEventStyles, calculateEventGhostStyle, calculatePreviewTime } from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop'


interface TwoWeekContentProps {
  date: Date
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onEventContextMenu?: (event: CalendarEvent, e: React.MouseEvent) => void
  onEmptyClick?: (date: Date, timeString: string) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onTimeRangeSelect?: (date: Date, startTime: string, endTime: string) => void
  onCreateEvent?: (startDate: Date, endDate: Date) => void
  className?: string
  dayIndex: number // 2週間内での日付インデックス（0-13）
  displayDates?: Date[] // 2週間の全日付配列（日付間移動用）
}

export const TwoWeekContent = ({
  date,
  events,
  onEventClick,
  onEventContextMenu,
  onEmptyClick,
  onEventUpdate,
  onTimeRangeSelect: _onTimeRangeSelect,
  onCreateEvent,
  className,
  dayIndex,
  displayDates
}: TwoWeekContentProps) => {
  // ドラッグ&ドロップ機能用にonEventUpdateを変換
  const handleEventUpdate = useCallback(
    async (eventId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onEventUpdate) return
      
      console.log('🔧 TwoWeekContent: イベント更新要求:', {
        eventId,
        startTime: updates.startTime.toISOString(),
        endTime: updates.endTime.toISOString()
      })
      
      // handleUpdateEvent形式で呼び出し
      await onEventUpdate(eventId, {
        startTime: updates.startTime,
        endTime: updates.endTime
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
    viewMode: '2week'
  })

  // 時間計算機能
  const { calculateTimeFromEvent } = useTimeCalculation()

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers)

  // この日のイベント位置を統一方式で変換
  const dayEventPositions = React.useMemo(() => {
    // 渡されたeventsは既にdisplayDatesでフィルタリング済みのため、直接変換
    return events.map(event => {
      // startDate/endDateを使用した統一的なイベント位置計算
      const startDate = event.startDate || new Date()
      const startHour = startDate.getHours()
      const startMinute = startDate.getMinutes()
      const top = (startHour + startMinute / 60) * HOUR_HEIGHT
      
      // 高さ計算（統一）
      let height = HOUR_HEIGHT // デフォルト1時間
      if (event.endDate) {
        const endHour = event.endDate.getHours()
        const endMinute = event.endDate.getMinutes()
        const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60)
        height = Math.max(20, duration * HOUR_HEIGHT) // 最小20px
      }

      return {
        event,
        top,
        height,
        left: 2, // 列内での位置（px）
        width: 96, // 列幅の96%使用
        zIndex: 20,
        opacity: 1.0
      }
    })
  }, [events])

  const eventStyles = useEventStyles(dayEventPositions)

  // 空白クリックハンドラー
  const _handleEmptyClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onEmptyClick) return
    
    const { timeString } = calculateTimeFromEvent(e)
    onEmptyClick(date, timeString)
  }, [date, onEmptyClick, calculateTimeFromEvent])
  
  // イベントクリックハンドラー（ドラッグ・リサイズ後のクリックは無視）
  const _handleEventClick = useCallback((event: CalendarEvent) => {
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
        onTimeRangeSelect={(startTime, endTime) => {
          // 時間範囲選択時の処理
          const startDate = new Date(date)
          const [startHour, startMinute] = startTime.split(':').map(Number)
          startDate.setHours(startHour, startMinute, 0, 0)
          
          const endDate = new Date(date)
          const [endHour, endMinute] = endTime.split(':').map(Number)
          endDate.setHours(endHour, endMinute, 0, 0)
          
          onCreateEvent?.(startDate, endDate)
        }}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing || dragState.recentlyDragged || dragState.recentlyResized}
      >
        {/* 背景グリッドはHourLinesがレンダリング済み */}
        <div
          className="absolute inset-0 cursor-cell"
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
          
          // ゴースト表示スタイル（共通化）
          const adjustedStyle = calculateEventGhostStyle(style, event.id, dragState)
          
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
                    }, dayIndex) // 日付インデックスを渡す
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
                  // クリックは useDragAndDrop で処理されるため削除
                  onContextMenu={(event, e) => handleEventContextMenu(event, e)}
                  onResizeStart={(event, direction, e, _position) => handlers.handleResizeStart(event.id, direction, e, {
                    top: currentTop,
                    left: 0,
                    width: 100,
                    height: currentHeight
                  })}
                  isDragging={isDragging}
                  isResizing={isResizingThis}
                  previewTime={calculatePreviewTime(event.id, dragState)}
                  compact={true}
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