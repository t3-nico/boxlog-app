// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
'use client'

import React, { useMemo } from 'react'

// import type { CalendarEvent } from '@/features/calendar/types/calendar.types'
// import { eventSelectors, useEventStore } from '@/features/events/stores/useEventStore'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { CalendarDateHeader, DateDisplay, ScrollableCalendarLayout } from '../shared'

import { DayContent } from './components/DayContent'
import type { DayViewProps } from './DayView.types'
import { useDayView } from './hooks/useDayView'

export const DayView = ({
  dateRange: _dateRange,
  tasks: _tasks,
  events,
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
  // TODO(#621): Events削除後、plans/Sessions統合後に再実装
  // const { updateEvent } = useEventStore()

  // イベントストアから最新のデータを取得
  // const storeEvents = useEventStore(eventSelectors.getEvents)

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
  // TODO(#621): Events削除後、plans/Sessions統合後に再実装
  const handleEventTimeUpdate = React.useCallback((_event: CalendarEvent) => {
    console.log('TODO: Sessions統合後に実装')
    // if (!event.startDate || !event.endDate) return

    // void updateEvent({ ...event, startDate: event.startDate, endDate: event.endDate })
    //   .then(() => {
    //     console.log('Event time updated via drag & drop:', event.id)
    //   })
    //   .catch((error) => {
    //     console.error('Failed to update event time:', error)
    //   })
  }, [])

  // DayView専用ロジック（CalendarControllerから渡されたイベントデータを使用）
  const {
    dayEvents,
    eventStyles,
    isToday,
    timeSlots: _timeSlots,
  } = useDayView({
    date,
    events: events || [],
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
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        {/* 固定日付ヘッダー */}
        <CalendarDateHeader header={headerComponent} timezone={timezone} />

        {/* スクロール可能コンテンツ */}
        <ScrollableCalendarLayout
          timezone={timezone}
          {...(isToday && { scrollToHour: 8 })}
          displayDates={displayDates}
          viewMode="day"
          onTimeClick={handleEmptySlotClick}
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
        </ScrollableCalendarLayout>
      </div>
    </CalendarViewAnimation>
  )
}
