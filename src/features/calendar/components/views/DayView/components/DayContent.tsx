'use client'

import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { EventBlock, CalendarDragSelection, DateTimeSelection } from '../../shared'
import type { DayContentProps } from '../DayView.types'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'

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
  // 空白クリックハンドラー
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
  
  // イベントクリックハンドラー
  const handleEventClick = useCallback((event: any) => {
    onEventClick?.(event)
  }, [onEventClick])
  
  // イベント右クリックハンドラー
  const handleEventContextMenu = useCallback((event: any, mouseEvent: React.MouseEvent) => {
    console.log('🖱️ Right-click on event:', event.title, mouseEvent)
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
    <div className={cn('relative flex-1 bg-background overflow-hidden', className)}>
      {/* 新しいCalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
      >
        {/* クリック可能な背景グリッド */}
        <div
          className={`absolute inset-0 cursor-pointer`}
          onClick={handleEmptyClick}
          style={{ height: 24 * HOUR_HEIGHT }}
        >
          {timeGrid}
        </div>
      </CalendarDragSelection>
      
      {/* イベント表示エリア */}
      <div className="relative w-full pointer-events-none" style={{ height: 24 * HOUR_HEIGHT }}>
        {events.map(event => {
          const style = eventStyles[event.id]
          if (!style) return null
          
          return (
            <div
              key={event.id}
              style={style}
              className="absolute pointer-events-none"
              data-event-block="true"
            >
              {/* EventBlockの内容部分のみクリック可能 */}
              <div 
                className="pointer-events-auto m-1 h-[calc(100%-8px)]"
              >
                <EventBlock
                  event={event}
                  onClick={() => handleEventClick(event)}
                  onContextMenu={(event, e) => handleEventContextMenu(event, e)}
                  className="h-full w-full cursor-pointer hover:shadow-md transition-shadow"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}