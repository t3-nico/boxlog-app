'use client'

import React, { memo, useRef, useMemo, useCallback } from 'react'
import { format, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/features/events'
import { OptimizedEventRenderer, usePerformanceMonitor } from '../OptimizedEventRenderer'

// 定数定義
const HOUR_HEIGHT = 72 // 1時間の高さ（px）
const TIME_AXIS_WIDTH = 64 // 時間軸の幅（px）

interface PureCalendarLayoutOptimizedProps {
  dates: Date[]
  events: CalendarEvent[]
  onCreateEvent?: (date: Date, time: string) => void
  onEventClick?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  dayStartHour?: number
  dayEndHour?: number
  className?: string
}

// 時間軸コンポーネント（最適化）
const TimeAxisLabels = memo(() => {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  
  return (
    <div 
      className="flex-shrink-0 relative bg-background border-r border-border"
      style={{ width: `${TIME_AXIS_WIDTH}px`, height: `${24 * HOUR_HEIGHT}px` }}
    >
      {hours.map((hour) => (
        <div
          key={hour}
          className="absolute flex items-center justify-end pr-3 text-xs text-muted-foreground"
          style={{
            top: `${hour * HOUR_HEIGHT}px`,
            height: '1px',
            width: '100%',
            transform: 'translateY(-50%)'
          }}
        >
          {hour > 0 && hour < 24 && (
            <span className="leading-none">
              {hour.toString().padStart(2, '0')}:00
            </span>
          )}
        </div>
      ))}
    </div>
  )
})

TimeAxisLabels.displayName = 'TimeAxisLabels'

// 日付ヘッダーコンポーネント（最適化）
const DateHeader = memo<{ date: Date }>(({ date }) => {
  const isCurrentDay = isToday(date)
  
  const dateInfo = useMemo(() => ({
    weekday: format(date, 'E'),
    day: format(date, 'd'),
    isToday: isCurrentDay
  }), [date, isCurrentDay])

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-2 border-b border-border bg-background',
      dateInfo.isToday && 'bg-primary/5'
    )}>
      <div className="text-xs text-muted-foreground font-medium">
        {dateInfo.weekday}
      </div>
      <div className={cn(
        'text-lg font-semibold mt-1',
        dateInfo.isToday ? 'text-primary' : 'text-foreground'
      )}>
        {dateInfo.day}
      </div>
      {dateInfo.isToday && (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </div>
  )
})

DateHeader.displayName = 'DateHeader'

// カレンダーグリッドコンポーネント（最適化）
const CalendarGrid = memo<{
  dates: Date[]
  events: CalendarEvent[]
  onCreateEvent?: (date: Date, time: string) => void
  onEventClick?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  dayStartHour: number
  dayEndHour: number
}>(({
  dates,
  events,
  onCreateEvent,
  onEventClick,
  onDeleteEvent,
  dayStartHour,
  dayEndHour
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 時間スロットクリック処理
  const handleTimeSlotClick = useCallback((date: Date, hour: number, minute: number = 0) => {
    if (onCreateEvent) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      onCreateEvent(date, timeString)
    }
  }, [onCreateEvent])

  // グリッド背景の計算をメモ化
  const gridLines = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours
  }, [])

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 時間軸 */}
      <TimeAxisLabels />
      
      {/* メインカレンダー領域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 日付ヘッダー */}
        <div className="flex border-b border-border">
          {dates.map((date) => (
            <div
              key={date.toISOString()}
              className="flex-1 min-w-0"
              style={{ minWidth: `${100 / dates.length}%` }}
            >
              <DateHeader date={date} />
            </div>
          ))}
        </div>

        {/* スクロール可能なグリッド領域 */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          style={{ height: `${24 * HOUR_HEIGHT}px` }}
        >
          {/* 背景グリッド */}
          <div className="absolute inset-0 flex">
            {dates.map((date, dateIndex) => (
              <div
                key={date.toISOString()}
                className="flex-1 relative border-r border-border last:border-r-0"
                style={{ 
                  minWidth: `${100 / dates.length}%`,
                  height: `${24 * HOUR_HEIGHT}px`
                }}
              >
                {/* 時間線 */}
                {gridLines.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    style={{
                      top: `${hour * HOUR_HEIGHT}px`,
                      height: `${HOUR_HEIGHT}px`
                    }}
                    onClick={() => handleTimeSlotClick(date, hour)}
                  >
                    {/* 30分線 */}
                    <div
                      className="absolute w-full border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      style={{
                        top: `${HOUR_HEIGHT / 2}px`,
                        height: `${HOUR_HEIGHT / 2}px`
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTimeSlotClick(date, hour, 30)
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 最適化されたイベントレンダリング */}
          <OptimizedEventRenderer
            events={events}
            dates={dates}
            onEventClick={onEventClick}
            onDeleteEvent={onDeleteEvent}
            containerRef={containerRef}
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
          />
        </div>
      </div>
    </div>
  )
})

CalendarGrid.displayName = 'CalendarGrid'

// メインコンポーネント
export const PureCalendarLayoutOptimized = memo<PureCalendarLayoutOptimizedProps>(({
  dates,
  events,
  onCreateEvent,
  onEventClick,
  onDeleteEvent,
  dayStartHour = 0,
  dayEndHour = 24,
  className
}) => {
  // パフォーマンス監視
  const performanceInfo = usePerformanceMonitor(events)

  // 現在時刻のインジケーター計算
  const currentTimeIndicator = useMemo(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const totalMinutes = currentHour * 60 + currentMinute
    const top = (totalMinutes / 60) * HOUR_HEIGHT

    return {
      top,
      time: format(now, 'HH:mm')
    }
  }, [])

  // 今日の列インデックスを計算
  const todayColumnIndex = useMemo(() => {
    const today = new Date()
    return dates.findIndex(date => 
      date.toDateString() === today.toDateString()
    )
  }, [dates])

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      {/* パフォーマンス情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && events.length > 100 && (
        <div className="fixed bottom-4 left-4 bg-blue-500 text-white text-xs p-2 rounded z-50">
          <div>Last Render: {performanceInfo.lastRenderTime.toFixed(1)}ms</div>
          <div>Events: {events.length}</div>
          <div>Frames: {performanceInfo.frameCount}</div>
        </div>
      )}

      {/* カレンダーグリッド */}
      <CalendarGrid
        dates={dates}
        events={events}
        onCreateEvent={onCreateEvent}
        onEventClick={onEventClick}
        onDeleteEvent={onDeleteEvent}
        dayStartHour={dayStartHour}
        dayEndHour={dayEndHour}
      />

      {/* 現在時刻インジケーター */}
      {todayColumnIndex >= 0 && (
        <div
          className="absolute pointer-events-none z-30"
          style={{
            left: `${TIME_AXIS_WIDTH + (todayColumnIndex * (100 / dates.length)) + '%'}`,
            top: `${currentTimeIndicator.top + 60}px`, // ヘッダー分オフセット
            width: `${100 / dates.length}%`,
          }}
        >
          <div className="relative">
            {/* 時刻ラベル */}
            <div className="absolute -left-8 -top-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded font-medium">
              {currentTimeIndicator.time}
            </div>
            {/* 赤い線 */}
            <div className="h-0.5 bg-red-500 shadow-sm" />
            {/* 左端の丸 */}
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        </div>
      )}
    </div>
  )
})

PureCalendarLayoutOptimized.displayName = 'PureCalendarLayoutOptimized'

// パフォーマンステスト用のコンポーネント
export const PerformanceTestWrapper = memo<{
  eventCount: number
  children: React.ReactNode
}>(({ eventCount, children }) => {
  const startTime = performance.now()
  
  React.useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    console.log(`🚀 パフォーマンステスト結果:`)
    console.log(`   イベント数: ${eventCount}`)
    console.log(`   レンダリング時間: ${renderTime.toFixed(2)}ms`)
    
    if (renderTime > 50) {
      console.warn(`⚠️ 目標を上回る時間がかかりました (目標: 50ms)`)
    } else {
      console.log(`✅ パフォーマンス目標達成!`)
    }
  })

  return <>{children}</>
})

PerformanceTestWrapper.displayName = 'PerformanceTestWrapper'