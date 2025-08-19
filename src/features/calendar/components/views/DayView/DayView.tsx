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

  // 空き時間クリックハンドラー
  const handleEmptySlotClick = React.useCallback((hour: number, minute: number) => {
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    onEmptyClick?.(date, timeString)
  }, [onEmptyClick, date])

  const headerComponent = (
    <div className="border-b border-border bg-background h-16 flex items-center justify-center px-2">
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
      <CalendarLayoutWithHeader
        header={headerComponent}
        timezone={timezone}
        scrollToHour={isToday ? undefined : 8}
        displayDates={displayDates}
        viewMode="day"
        onTimeClick={handleEmptySlotClick}
        className={cn('bg-background', className)}
      >
        {/* 日のコンテンツ */}
        <DayContent
          date={date}
          events={dayEvents}
          eventStyles={eventStyles}
          onEventClick={onEventClick}
          onEmptyClick={onEmptyClick}
          onEventUpdate={onUpdateEvent}
          className="absolute inset-0"
        />
      </CalendarLayoutWithHeader>
    </CalendarViewAnimation>
  )
}