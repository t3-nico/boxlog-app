'use client'

import React, { useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { space } from '@/config/theme/spacing'
import { EventBlock, CalendarDragSelection, DateTimeSelection } from '../../shared'
import type { DayContentProps } from '../DayView.types'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { useTimeCalculation } from '../../shared/hooks/useTimeCalculation'

export function DayContent({
  date,
  events,
  eventStyles,
  onEventClick,
  onEventContextMenu,
  onEmptyClick,
  onEventUpdate,
  onTimeRangeSelect,
  className
}: DayContentProps) {
  // ドラッグ&ドロップ機能
  const { dragState, handlers } = useDragAndDrop({
    onEventUpdate,
    date,
    events
  })

  // 時間計算機能
  const { calculateTimeFromEvent } = useTimeCalculation()

  // グローバルマウスイベント処理とカーソル固定
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handlers.handleMouseMove)
      document.addEventListener('mouseup', handlers.handleMouseUp)
      
      // リサイズ中は全画面でカーソルを強制的に固定
      if (dragState.isResizing) {
        document.body.style.setProperty('cursor', 'ns-resize', 'important')
        document.body.style.setProperty('user-select', 'none', 'important')
        document.documentElement.style.setProperty('cursor', 'ns-resize', 'important')
        // 全ての要素にカーソルを適用
        const style = document.createElement('style')
        style.id = 'resize-cursor-override'
        style.textContent = '* { cursor: ns-resize !important; }'
        document.head.appendChild(style)
      } else if (dragState.isDragging) {
        document.body.style.setProperty('cursor', 'grabbing', 'important')
        document.body.style.setProperty('user-select', 'none', 'important')
        document.documentElement.style.setProperty('cursor', 'grabbing', 'important')
      }
      
      return () => {
        document.removeEventListener('mousemove', handlers.handleMouseMove)
        document.removeEventListener('mouseup', handlers.handleMouseUp)
        // カーソルを完全にリセット
        document.body.style.removeProperty('cursor')
        document.body.style.removeProperty('user-select')
        document.documentElement.style.removeProperty('cursor')
        // CSSオーバーライドを削除
        const styleEl = document.getElementById('resize-cursor-override')
        if (styleEl) {
          styleEl.remove()
        }
      }
    }
  }, [dragState.isDragging, dragState.isResizing, handlers.handleMouseMove, handlers.handleMouseUp])
  // 空白クリックハンドラー（現在使用されていない - CalendarDragSelectionが処理）
  const handleEmptyClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onEmptyClick) return
    
    const { timeString } = calculateTimeFromEvent(e)
    onEmptyClick(date, timeString)
  }, [date, onEmptyClick, calculateTimeFromEvent])
  
  // イベントクリックハンドラー（ドラッグ・リサイズ後のクリックは無視）
  const handleEventClick = useCallback((event: any) => {
    console.log('DayContent handleEventClick called:', {
      event: event,
      isDragging: dragState.isDragging,
      isResizing: dragState.isResizing,
      recentlyDragged: dragState.recentlyDragged,
      hasOnEventClick: !!onEventClick,
      eventTitle: event.title
    })
    
    // ドラッグ・リサイズ操作中またはドラッグ・リサイズ直後のクリックは無視
    if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
      console.log('DayContent click ignored - dragging/resizing/recently dragged')
      return
    }
    
    console.log('DayContent calling onEventClick...') // デバッグ用
    onEventClick?.(event)
  }, [onEventClick, dragState.isDragging, dragState.isResizing, dragState.recentlyDragged])
  
  // イベント右クリックハンドラー
  const handleEventContextMenu = useCallback((event: any, mouseEvent: React.MouseEvent) => {
    // ドラッグ操作中またはリサイズ操作中は右クリックを無視
    if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
      return
    }
    onEventContextMenu?.(event, mouseEvent)
  }, [onEventContextMenu, dragState.isDragging, dragState.isResizing, dragState.recentlyDragged])
  
  // 時間グリッドの生成（1時間単位、23時は下線なし）
  const timeGrid = Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      className={`relative ${hour < 23 ? 'border-b border-neutral-900/20 dark:border-neutral-100/20' : ''}`}
      style={{ height: HOUR_HEIGHT }}
    />
  ))

  return (
    <div className={cn('relative flex-1 bg-background overflow-hidden', className)} data-calendar-grid>
      {/* 新しいCalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing || dragState.recentlyDragged || dragState.recentlyResized} // ドラッグ・リサイズ中・直後は背景クリックを無効化
      >
        {/* 背景グリッド（CalendarDragSelectionが全イベントを処理） */}
        <div
          className={`absolute inset-0`}
          style={{ height: 24 * HOUR_HEIGHT }}
        >
          {timeGrid}
        </div>
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