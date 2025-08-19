'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { DateHeader, TimeColumn, CurrentTimeLine, TimezoneOffset } from '../shared'
import { DayContent } from './components/DayContent'
import { useDayView } from './hooks/useDayView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { DayViewProps } from './DayView.types'

const HOUR_HEIGHT = 72 // 1時間の高さ（px）
const TIME_COLUMN_WIDTH = 64 // 時間列の幅（px）

export function DayView({
  dateRange,
  tasks,
  events,
  currentDate,
  className,
  onTaskClick,
  onEventClick,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onRestoreEvent,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday
}: DayViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { timezone } = useCalendarSettingsStore()
  
  // OldDayViewと同様の表示日付配列を計算
  const displayDates = useMemo(() => {
    return dateRange.days.length > 0 ? dateRange.days : [currentDate]
  }, [dateRange.days, currentDate])
  
  // 最初の日付を使用（Day表示なので1日のみ）
  const date = displayDates[0] || currentDate
  
  // DayView専用ロジック
  const {
    dayEvents,
    eventStyles,
    scrollToNow,
    isToday,
    timeSlots
  } = useDayView({
    date,
    events,
    onEventUpdate: onUpdateEvent
  })
  
  // 初回レンダリング時に現在時刻へスクロール
  useEffect(() => {
    if (isToday) {
      // 少し遅延させてスクロール（レンダリング完了後）
      const timer = setTimeout(() => {
        scrollToNow()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isToday, scrollToNow])
  
  return (
    <CalendarViewAnimation viewType="day">
      <div className={cn('flex flex-col h-full bg-background', className)}>
        {/* 日付ヘッダー - 大きく表示 */}
        <div className="shrink-0 border-b border-border bg-background">
          <div className="flex items-center justify-between px-4 py-2">
            <DateHeader
              date={date}
              className="flex-1 text-center"
              showDayName={true}
              showMonthYear={false}
              dayNameFormat="long"
              dateFormat="d日 EEEE"
              isToday={isToday}
            />
            {/* タイムゾーン表示 */}
            <TimezoneOffset timezone={timezone} />
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
        
        {/* スクロール可能なコンテンツエリア */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto relative"
        >
          {/* 現在時刻線（今日の場合のみ） */}
          {isToday && (
            <CurrentTimeLine
              startHour={0}
              className="absolute left-0 right-0 z-20 pointer-events-none"
            />
          )}
          
          {/* 日のコンテンツ */}
          <DayContent
            date={date}
            events={dayEvents}
            eventStyles={eventStyles}
            onEventClick={onEventClick}
            onEmptyClick={onEmptyClick}
            onEventUpdate={onUpdateEvent}
            className="min-h-full"
          />
        </div>
      </div>
      </div>
    </CalendarViewAnimation>
  )
}