'use client'

import React, { useCallback } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { EventBlock, DirectDragSelection, useTimeCalculation, useGlobalDragCursor, useEventStyles } from '../../shared'
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
  onTimeRangeSelect?: (selection: import('../../shared').DateTimeSelection) => void
  className?: string
  dayIndex: number // 週内での日付インデックス（0-6）
  displayDates?: Date[] // 週の全日付配列（日付間移動用）
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
  dayIndex,
  displayDates
}: WeekContentProps) {
  // ドラッグ&ドロップ機能用にonEventUpdateを変換
  const handleEventUpdate = useCallback(
    async (eventId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onEventUpdate) return
      
      console.log('🔧 WeekContent: イベント更新要求:', {
        eventId,
        startTime: updates.startTime.toISOString(),
        endTime: updates.endTime.toISOString()
      })
      
      // CalendarControllerの新しい型に合わせて呼び出し
      await onEventUpdate(eventId, updates)
    },
    [onEventUpdate]
  )

  // ドラッグ&ドロップ機能（日付間移動対応）
  const { dragState, handlers } = useDragAndDrop({
    onEventUpdate: handleEventUpdate,
    date,
    events,
    displayDates,
    viewMode: 'week'
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

  // WeekContentのdate確認（デバッグ用）
  console.log('🔧 WeekContent初期化:', {
    componentDate: date.toDateString(),
    dayIndex,
    dayOfWeek: date.getDay()
  })

  return (
    <div className={cn('relative flex-1 bg-background h-full', dragState.isDragging ? 'overflow-visible' : 'overflow-hidden', className)} data-calendar-grid>
      {/* CalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0 z-10"
        onTimeRangeSelect={(selection) => {
          console.log('🔧 WeekContent: 時間範囲選択受信（直接渡し）:', {
            selectionDate: selection.date.toDateString(),
            componentDate: date.toDateString(),
            startHour: selection.startHour,
            startMinute: selection.startMinute
          })
          
          // DayViewと同じように直接DateTimeSelectionを渡す
          if (onTimeRangeSelect) {
            onTimeRangeSelect(selection)
          }
        }}
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
        {/* 通常のイベント表示 */}
        {events.map(event => {
          const style = eventStyles[event.id]
          if (!style) return null
          
          const isDragging = dragState.draggedEventId === event.id && dragState.isDragging
          
          // ドラッグ中のイベント表示制御：元のカラムで水平移動表示
          // （非表示にせず、水平位置を調整して表示継続）
          const isResizingThis = dragState.isResizing && dragState.draggedEventId === event.id
          const currentTop = parseFloat(style.top?.toString() || '0')
          const currentHeight = parseFloat(style.height?.toString() || '20')
          
          // ドラッグ・リサイズ中の位置調整
          let adjustedStyle = { ...style }
          
          if (isDragging) {
            // ドラッグ中：元の位置にゴーストとして表示（移動させない）
            adjustedStyle = {
              ...adjustedStyle,
              opacity: 0.3 // ゴースト表示（半透明）
            }
          } else if (dragState.snappedPosition && isResizingThis) {
            if (isResizingThis) {
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
                  previewTime={isResizingThis ? dragState.previewTime : null}
                  showTime={true}
                  showDuration={true}
                  variant="week"
                  className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                />
              </div>
            </div>
          )
        })}
        
        {/* ドラッグ中のイベントを他の日付カラムで表示 */}
        {dragState.isDragging && dragState.draggedEventId && 
         dragState.targetDateIndex !== undefined && dragState.targetDateIndex === dayIndex && 
         !events.find(e => e.id === dragState.draggedEventId) && displayDates && (
          (() => {
            // 週の全イベントからドラッグ中のイベントを探す
            // displayDates配列を使って全日付のイベントを探索
            let draggedEvent: CalendarEvent | null = null
            
            // 他のWeekContentインスタンスが保持しているイベントを探すのは困難
            // そのため、親コンポーネントから渡されるevents配列から探す
            // 現在はeventsには当日のイベントのみ含まれているため、
            // WeekGridから全イベントを渡すよう修正が必要
            
            // 一時的な解決策として、コンソールログで状況を確認
            console.log('🔧 他日付カラムでのドラッグイベント表示試行:', {
              draggedEventId: dragState.draggedEventId,
              targetDateIndex: dragState.targetDateIndex,
              currentDayIndex: dayIndex,
              hasSnappedPosition: !!dragState.snappedPosition
            })
            
            // TODO: 適切な実装が必要
            return null
          })()
        )}
      </div>
    </div>
  )
}