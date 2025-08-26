'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { DateHeader, CalendarLayoutWithHeader } from '../shared'
import { DayContent } from './components/DayContent'
import { useDayView } from './hooks/useDayView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight'
import type { DayViewProps } from './DayView.types'

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
  onTimeRangeSelect,
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday
}: DayViewProps) {
  const { timezone } = useCalendarSettingsStore()
  
  // レスポンシブな時間高さ
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72
  })
  
  // 表示する日付（currentDateを使用）
  const displayDates = useMemo(() => {
    const date = new Date(currentDate)
    date.setHours(0, 0, 0, 0)
    console.log('🔧 DayView: currentDateを表示します', {
      currentDate: date.toDateString()
    })
    return [date]
  }, [currentDate])
  
  // 最初の日付を使用（Day表示なので1日のみ）
  const date = displayDates[0]
  
  // DayView専用ロジック
  const {
    dayEvents,
    eventStyles,
    isToday,
    timeSlots
  } = useDayView({
    date,
    events,
    onEventUpdate: onUpdateEvent
  })

  // 空き時間クリックハンドラー
  const handleEmptySlotClick = React.useCallback((hour: number, minute: number) => {
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    onEmptyClick?.(date, timeString)
  }, [onEmptyClick, date])

  const headerComponent = (
    <div className="bg-background h-16 flex items-center justify-center px-2">
      <DateHeader
        date={date}
        className="text-center"
        showDayName={true}
        showMonthYear={false}
        dayNameFormat="short"
        dateFormat="d"
        isToday={isToday}
        isSelected={false}
      />
    </div>
  )

  return (
    <CalendarViewAnimation viewType="day">
      <div className={cn('flex flex-col h-full bg-background overflow-x-hidden', className)}>
        
        {/* メインコンテンツエリア */}
        <div className="flex-1 min-h-0">
          <CalendarLayoutWithHeader
            header={headerComponent}
            timezone={timezone}
            scrollToHour={isToday ? undefined : 8}
            displayDates={displayDates}
            viewMode="day"
            onTimeClick={handleEmptySlotClick}
            enableKeyboardNavigation={true}
            className="h-full"
          >
            {/* 日のコンテンツ */}
            <DayContent
              date={date}
              events={dayEvents}
              eventStyles={eventStyles}
              onEventClick={onEventClick}
              onEmptyClick={onEmptyClick}
              onEventUpdate={onUpdateEvent}
              onTimeRangeSelect={onTimeRangeSelect}
              className="absolute inset-0"
            />
          </CalendarLayoutWithHeader>
        </div>
      </div>
    </CalendarViewAnimation>
  )
}