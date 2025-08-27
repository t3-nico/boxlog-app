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
import { useEventStore, eventSelectors } from '@/features/events/stores/useEventStore'
import { useToast } from '@/components/shadcn-ui/toast'

const TIME_COLUMN_WIDTH = 64 // 時間列の幅（px）

export function DayView({
  dateRange,
  tasks,
  events,
  currentDate,
  showWeekends = true,
  className,
  onTaskClick,
  onEventClick,
  onEventContextMenu,
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
  const { updateEventTime } = useEventStore()
  const { success } = useToast()
  
  // イベントストアから最新のデータを取得
  const storeEvents = useEventStore(eventSelectors.getEvents)
  
  // レスポンシブな時間高さ
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72
  })
  
  // 表示する日付
  const displayDates = useMemo(() => {
    const date = new Date(currentDate)
    date.setHours(0, 0, 0, 0)
    return [date]
  }, [currentDate])
  
  // 最初の日付を使用（Day表示なので1日のみ）
  const date = displayDates[0]
  
  // ドラッグイベント用のハンドラー
  const handleEventTimeUpdate = React.useCallback(async (eventId: string, updates: { startTime: Date; endTime: Date }) => {
    try {
      await updateEventTime(eventId, updates.startTime, updates.endTime)
      // ドラッグ&ドロップ後は詳細モーダルを開かない
      // Toast通知はuseDragAndDropで処理される
      console.log('Event time updated via drag & drop:', eventId, updates)
    } catch (error) {
      console.error('Failed to update event time:', error)
    }
  }, [updateEventTime])

  // DayView専用ロジック（ストアから最新のイベントデータを使用）
  const {
    dayEvents,
    eventStyles,
    isToday,
    timeSlots
  } = useDayView({
    date,
    events: storeEvents, // ストアから取得した最新データを使用
    onEventUpdate: onUpdateEvent
  })

  // 空き時間クリックハンドラー
  const handleEmptySlotClick = React.useCallback((hour: number, minute: number) => {
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    onEmptyClick?.(date, timeString)
  }, [onEmptyClick, date])

  // 日付ヘッダーのクリックハンドラー（DayViewでは日付変更のみ）
  const handleDateHeaderClick = React.useCallback((clickedDate: Date) => {
    // DayViewで日付ヘッダーをクリックした場合、その日付に移動
    onNavigateToday?.()
  }, [onNavigateToday])

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
        onClick={handleDateHeaderClick}
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
              onEventContextMenu={onEventContextMenu}
              onEmptyClick={onEmptyClick}
              onEventUpdate={handleEventTimeUpdate}
              onTimeRangeSelect={onTimeRangeSelect}
              className="absolute inset-y-0 left-0 right-0"
            />
          </CalendarLayoutWithHeader>
        </div>
      </div>
    </CalendarViewAnimation>
  )
}