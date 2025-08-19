'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { DateHeader, CalendarLayoutWithHeader } from '../../shared'
import { EventBlock } from '../../shared/components/EventBlock'
import { TimezoneOffset } from '../../shared'
import { useWeekEvents } from '../hooks/useWeekEvents'
import type { WeekGridProps } from '../WeekView.types'
const TIME_COLUMN_WIDTH = 64 // 時間列の幅（px）

/**
 * WeekGrid - 週表示のメイングリッドコンポーネント
 * 
 * @description
 * 7日分のグリッド管理:
 * - 各列の幅を均等分割（100% / 7）
 * - 列間のボーダー
 * - スクロール同期
 * - 現在時刻線の表示
 */
export function WeekGrid({
  weekDates,
  events,
  eventsByDate,
  todayIndex,
  onEventClick,
  onEmptyClick,
  onEventUpdate,
  timezone,
  className
}: WeekGridProps) {
  // 一時的に固定値でデバッグ
  const HOUR_HEIGHT = 72
  
  // イベント位置計算
  const { eventPositions } = useWeekEvents({
    weekDates,
    events
  })
  
  
  // 空き時間クリックハンドラー
  const handleEmptySlotClick = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    date: Date,
    dayIndex: number
  ) => {
    // イベントブロック上のクリックは無視
    if ((e.target as HTMLElement).closest('[data-event-block]')) {
      return
    }
    
    // クリック位置から時刻を計算
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    
    // 15分単位でスナップ
    const totalMinutes = Math.max(0, Math.floor((clickY / HOUR_HEIGHT) * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round((totalMinutes % 60) / 15) * 15
    
    // 時刻文字列
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    
    onEmptyClick?.(date, timeString)
  }, [onEmptyClick])
  
  // スクロール処理はScrollableCalendarLayoutに任せる（削除）
  
  
  const headerComponent = (
    <div className="border-b border-border bg-background h-16 flex">
      {/* 7日分の日付ヘッダー */}
      {weekDates.map((date, index) => (
        <div
          key={date.toISOString()}
          className="flex-1 flex items-center justify-center px-1"
        >
          <DateHeader
            date={date}
            className="text-center"
            showDayName={true}
            showMonthYear={false}
            dayNameFormat="short"
            dateFormat="d"
            isToday={isToday(date)}
            isSelected={false}
          />
          
          {/* イベント数インジケーター */}
          {eventsByDate[format(date, 'yyyy-MM-dd')]?.length > 0 && (
            <div className="text-center mt-1">
              <span className="inline-block w-2 h-2 bg-primary rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <CalendarLayoutWithHeader
      header={headerComponent}
      timezone={timezone}
      scrollToHour={todayIndex !== -1 ? undefined : 8}
      displayDates={weekDates}
      viewMode="week"
      onTimeClick={(hour, minute) => {
        // WeekViewでは最初にクリックされた日付を使用
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        onEmptyClick?.(weekDates[0], timeString)
      }}
      enableKeyboardNavigation={true}
      className={cn('bg-background', className)}
    >
      {/* 7日分のグリッド */}
      <div className="flex h-full">
        {weekDates.map((date, dayIndex) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const dayEvents = eventsByDate[dateKey] || []
          
          return (
            <div
              key={date.toISOString()}
              className={cn(
                'flex-1 border-r border-border last:border-r-0 relative'
              )}
              style={{ width: `${100 / 7}%` }}
            >
              {/* クリック可能な背景エリア */}
              <div
                onClick={(e) => handleEmptySlotClick(e, date, dayIndex)}
                className="absolute inset-0 z-10 cursor-cell"
              >
                {/* 時間グリッド背景 */}
                <div className="absolute inset-0">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div
                      key={hour}
                      className={cn(
                        'border-b border-border/50 last:border-b-0 transition-colors',
                        'hover:bg-primary/5'
                      )}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      title={`${date.toLocaleDateString()} ${hour}:00 - ${hour + 1}:00`}
                    />
                  ))}
                </div>
              </div>
              
              {/* イベント表示 */}
              {dayEvents.map(event => {
                const position = eventPositions.find(pos => 
                  pos.event.id === event.id && pos.dayIndex === dayIndex
                )
                
                if (!position) return null
                
                return (
                  <div
                    key={event.id}
                    data-event-block
                    className="absolute z-20"
                    style={{
                      top: `${position.top}px`,
                      height: `${position.height}px`,
                      left: '2px',
                      right: '2px'
                    }}
                  >
                    <EventBlock
                      event={event}
                      onClick={() => onEventClick?.(event)}
                      className="h-full w-full"
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </CalendarLayoutWithHeader>
  )
}