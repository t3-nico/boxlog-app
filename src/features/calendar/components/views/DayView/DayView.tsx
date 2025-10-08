'use client'

import React, { useMemo } from 'react'

import type { CalendarEvent } from '@/features/events'
import { eventSelectors, useEventStore } from '@/features/events/stores/useEventStore'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { CalendarLayoutWithHeader, DateDisplay } from '../shared'

import { DayContent } from './components/DayContent'
import type { DayViewProps } from './DayView.types'
import { useDayView } from './hooks/useDayView'

export const DayView = ({
  dateRange: _dateRange,
  tasks: _tasks,
  events: _events,
  currentDate,
  showWeekends: _showWeekends = true,
  className,
  onTaskClick: _onTaskClick,
  onEventClick,
  onEventContextMenu,
  onCreateEvent: _onCreateEvent,
  onUpdateEvent,
  onDeleteEvent: _onDeleteEvent,
  onRestoreEvent: _onRestoreEvent,
  onEmptyClick,
  onTimeRangeSelect,
  onTaskDrag: _onTaskDrag,
  onCreateTask: _onCreateTask,
  onCreateRecord: _onCreateRecord,
  onViewChange: _onViewChange,
  onNavigatePrev: _onNavigatePrev,
  onNavigateNext: _onNavigateNext,
  onNavigateToday,
}: DayViewProps) => {
  const { timezone } = useCalendarSettingsStore()
  const { updateEvent } = useEventStore()

  // イベントストアから最新のデータを取得
  const storeEvents = useEventStore(eventSelectors.getEvents)

  // 表示する日付
  const displayDates = useMemo(() => {
    const date = new Date(currentDate)
    date.setHours(0, 0, 0, 0)
    return [date]
  }, [currentDate])

  // 最初の日付を使用（Day表示なので1日のみ）
  const date = displayDates[0]
  if (!date) {
    throw new Error('Display date is undefined')
  }

  // ドラッグイベント用のハンドラー
  const handleEventTimeUpdate = React.useCallback(
    (event: CalendarEvent) => {
      if (!event.startDate || !event.endDate) return

      void updateEvent({ ...event, startDate: event.startDate, endDate: event.endDate })
        .then(() => {
          console.log('Event time updated via drag & drop:', event.id)
        })
        .catch((error) => {
          console.error('Failed to update event time:', error)
        })
    },
    [updateEvent]
  )

  // DayView専用ロジック（ストアから最新のイベントデータを使用）
  const {
    dayEvents,
    eventStyles,
    isToday,
    timeSlots: _timeSlots,
  } = useDayView({
    date,
    events: storeEvents as CalendarEvent[], // ストアから取得した最新データを使用
    ...(onUpdateEvent && { onEventUpdate: onUpdateEvent }),
  })

  // 空き時間クリックハンドラー
  const handleEmptySlotClick = React.useCallback(
    (hour: number, minute: number) => {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      onEmptyClick?.(date, timeString)
    },
    [onEmptyClick, date]
  )

  // 日付ヘッダーのクリックハンドラー（DayViewでは日付変更のみ）
  const handleDateHeaderClick = React.useCallback(
    (_clickedDate: Date) => {
      // DayViewで日付ヘッダーをクリックした場合、その日付に移動
      onNavigateToday?.()
    },
    [onNavigateToday]
  )

  const headerComponent = (
    <div className="bg-background flex h-16 items-center justify-center px-2">
      <DateDisplay
        date={date}
        className="text-center"
        showDayName={true}
        showMonthYear={false}
        dayNameFormat="short"
        dateFormat="d"
        isToday={isToday}
        isSelected={false}
        onClick={handleDateHeaderClick}
      />
    </div>
  )

  return (
    <CalendarViewAnimation viewType="day">
      <div className={cn('bg-background flex h-full flex-col overflow-x-hidden', className)}>
        {/* メインコンテンツエリア */}
        <div className="min-h-0 flex-1">
          <CalendarLayoutWithHeader
            header={headerComponent}
            timezone={timezone}
            {...(isToday && { scrollToHour: 8 })}
            displayDates={displayDates}
            viewMode="day"
            onTimeClick={handleEmptySlotClick}
            className="h-full"
          >
            {/* 日のコンテンツ */}
            <DayContent
              date={date}
              events={dayEvents}
              eventStyles={eventStyles}
              {...(onEventClick && { onEventClick })}
              {...(onEventContextMenu && { onEventContextMenu })}
              {...(onEmptyClick && { onEmptyClick })}
              {...(handleEventTimeUpdate && { onEventUpdate: handleEventTimeUpdate })}
              {...(onTimeRangeSelect && { onTimeRangeSelect })}
              className="absolute inset-y-0 right-0 left-0"
            />
          </CalendarLayoutWithHeader>
        </div>
      </div>
    </CalendarViewAnimation>
  )
}
