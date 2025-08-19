'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { TimeColumn, CurrentTimeLine } from '../../shared'
import { DateHeader } from '../../shared/components/DateHeader'
import { EventBlock } from '../../shared/components/EventBlock'
import { useWeekEvents } from '../hooks/useWeekEvents'
import type { WeekGridProps } from '../WeekView.types'

const HOUR_HEIGHT = 72 // 1時間の高さ（px）
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
  className
}: WeekGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
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
    const parentScrollTop = scrollContainerRef.current?.scrollTop || 0
    const clickY = e.clientY - rect.top + parentScrollTop
    
    // 15分単位でスナップ
    const totalMinutes = Math.max(0, Math.floor((clickY / HOUR_HEIGHT) * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round((totalMinutes % 60) / 15) * 15
    
    // 時刻文字列
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    
    onEmptyClick?.(date, timeString)
  }, [onEmptyClick])
  
  // 初回レンダリング時に現在時刻へスクロール（今日がある場合のみ）
  useEffect(() => {
    if (todayIndex !== -1 && scrollContainerRef.current) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()
      
      // 少し上に余裕を持たせてスクロール
      const scrollTop = Math.max(0, (currentHour + currentMinutes / 60 - 2) * HOUR_HEIGHT)
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [todayIndex])
  
  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* 日付ヘッダー行 */}
      <div className="shrink-0 border-b border-border bg-background">
        <div className="flex">
          {/* 時間列の空白スペース */}
          <div 
            className="shrink-0 border-r border-border bg-muted/5"
            style={{ width: TIME_COLUMN_WIDTH }}
          />
          
          {/* 7日分の日付ヘッダー */}
          {weekDates.map((date, index) => (
            <div
              key={date.toISOString()}
              className={cn(
                'flex-1 border-r border-border last:border-r-0 py-2 px-1',
                isToday(date) && 'bg-primary/5',
                isWeekend(date) && 'bg-muted/20'
              )}
            >
              <DateHeader
                date={date}
                className="text-center"
                showDayName={true}
                showMonthYear={false}
                dayNameFormat="short"
                dateFormat="d"
                isToday={isToday(date)}
                isSelected={index === todayIndex}
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
      </div>
      
      {/* メインコンテンツエリア */}
      <div className="flex flex-1 min-h-0">
        {/* 時間軸列 */}
        <div 
          className="shrink-0 border-r border-border bg-muted/5"
          style={{ width: TIME_COLUMN_WIDTH }}
        >
          <TimeColumn
            startHour={0}
            endHour={24}
            interval={60}
            showBusinessHours={false}
            className="h-full"
          />
        </div>
        
        {/* スクロール可能なグリッドエリア */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto relative"
          style={{ height: `${24 * HOUR_HEIGHT}px` }}
        >
          {/* 現在時刻線（今日がある場合のみ全体を横断） */}
          {todayIndex !== -1 && (
            <CurrentTimeLine
              startHour={0}
              className="absolute left-0 right-0 z-20 pointer-events-none"
            />
          )}
          
          {/* 7日分のグリッド */}
          <div className="flex h-full">
            {weekDates.map((date, dayIndex) => {
              const dateKey = format(date, 'yyyy-MM-dd')
              const dayEvents = eventsByDate[dateKey] || []
              
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'flex-1 border-r border-border last:border-r-0 relative',
                    isWeekend(date) && 'bg-muted/10'
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
                  
                  {/* 今日のハイライト（縦線） */}
                  {isToday(date) && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary z-15" />
                  )}
                  
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
        </div>
      </div>
    </div>
  )
}