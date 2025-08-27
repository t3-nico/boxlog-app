'use client'

import React, { useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { space } from '@/config/theme/spacing'
import { EventBlock, CalendarDragSelection, DateTimeSelection } from '../../shared'
import type { DayContentProps } from '../DayView.types'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../hooks/useDragAndDrop'

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

  // グローバルマウスイベント処理
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handlers.handleMouseMove)
      document.addEventListener('mouseup', handlers.handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handlers.handleMouseMove)
        document.removeEventListener('mouseup', handlers.handleMouseUp)
      }
    }
  }, [dragState.isDragging, handlers.handleMouseMove, handlers.handleMouseUp])
  // 空白クリックハンドラー（現在使用されていない - CalendarDragSelectionが処理）
  const handleEmptyClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onEmptyClick) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    
    // クリック位置から時刻を計算
    const hourDecimal = clickY / HOUR_HEIGHT
    const hour = Math.floor(hourDecimal)
    const minute = Math.round((hourDecimal - hour) * 60 / 15) * 15 // 15分単位に丸める
    
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    onEmptyClick(date, timeString)
  }, [date, onEmptyClick])
  
  // イベントクリックハンドラー（ドラッグ後のクリックは無視）
  const handleEventClick = useCallback((event: any) => {
    // ドラッグ操作中またはドラッグ直後のクリックは無視
    if (dragState.isDragging || dragState.recentlyDragged) {
      return
    }
    
    onEventClick?.(event)
  }, [onEventClick, dragState.isDragging, dragState.recentlyDragged])
  
  // イベント右クリックハンドラー
  const handleEventContextMenu = useCallback((event: any, mouseEvent: React.MouseEvent) => {
    onEventContextMenu?.(event, mouseEvent)
  }, [onEventContextMenu])
  
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
        disabled={false} // 現在はイベントドラッグがないので無効化しない
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
          
          const isDragging = dragState.draggedEventId === event.id
          const currentTop = parseFloat(style.top?.toString() || '0')
          const currentHeight = parseFloat(style.height?.toString() || '20')
          
          // ドラッグ中の位置調整（15分単位スナッピング）
          let adjustedStyle = { ...style }
          if (isDragging && dragState.snappedPosition) {
            adjustedStyle = {
              ...style,
              top: `${dragState.snappedPosition.top}px`,
              zIndex: 1000,
              transition: 'none', // スナッピング時はtransitionを無効化
              opacity: 1 // ドラッグ中の要素は通常表示
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
                onMouseDown={(e) => handlers.handleMouseDown(event.id, e, {
                  top: currentTop,
                  left: 0,
                  width: 100,
                  height: currentHeight
                })}
              >
                <EventBlock
                  event={event}
                  position={{
                    top: 0,
                    left: 0, 
                    width: 100,
                    height: currentHeight
                  }}
                  onClick={() => handleEventClick(event)}
                  onContextMenu={(event, e) => handleEventContextMenu(event, e)}
                  isDragging={isDragging}
                  previewTime={isDragging ? dragState.previewTime : null}
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