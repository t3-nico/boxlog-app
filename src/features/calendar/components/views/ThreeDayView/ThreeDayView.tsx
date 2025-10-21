// @ts-nocheck TODO(#389): 型エラー6件を段階的に修正する
'use client'

import { useMemo } from 'react'

import { format, isToday } from 'date-fns'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

import { CalendarDateHeader, DateDisplay, HourLines, ScrollableCalendarLayout, useEventStyles } from '../shared'
import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight'

import type { EventPosition } from '../DayView/DayView.types'

import { ThreeDayContent } from './components'
import { useThreeDayView } from './hooks/useThreeDayView'
import type { ThreeDayViewProps } from './ThreeDayView.types'

/**
 * ThreeDayView - 3-day view component
 */
export const ThreeDayView = ({
  dateRange: _dateRange,
  tasks: _tasks,
  events,
  currentDate,
  centerDate: _centerDate,
  showWeekends = true,
  className,
  onTaskClick: _onTaskClick,
  onEventClick,
  onEventContextMenu,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent: _onDeleteEvent,
  onRestoreEvent: _onRestoreEvent,
  onEmptyClick,
  onTaskDrag: _onTaskDrag,
  onCreateTask: _onCreateTask,
  onCreateRecord: _onCreateRecord,
  onViewChange: _onViewChange,
  onNavigatePrev: _onNavigatePrev,
  onNavigateNext: _onNavigateNext,
  onNavigateToday: _onNavigateToday,
}: ThreeDayViewProps) => {
  const { timezone } = useCalendarSettingsStore()

  // レスポンシブな時間高さ
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  })

  // ThreeDayViewではcurrentDateを中心とした3日間を表示
  const displayCenterDate = useMemo(() => {
    const date = new Date(currentDate)
    date.setHours(0, 0, 0, 0)
    return date
  }, [currentDate])

  // ThreeDayView specific logic
  const { threeDayDates, eventsByDate, isCurrentDay } = useThreeDayView({
    centerDate: displayCenterDate,
    events,
    showWeekends,
  })

  // 統一された日付配列を使用（週末表示設定も考慮済み）
  const displayDates = useMemo(() => {
    return threeDayDates
  }, [threeDayDates])

  // イベント位置計算（統一された日付配列ベース）
  const eventPositions = useMemo(() => {
    const positions: EventPosition[] = []

    // displayDates（統一フィルタリング済み）を基準にイベントを配置
    displayDates.forEach((displayDate, _dayIndex) => {
      const dateKey = format(displayDate, 'yyyy-MM-dd')

      // 元のevents配列から直接フィルタリング（週末設定に依存しない）
      const dayEvents = events.filter((event) => {
        const eventDate = event.startDate || new Date()
        return format(eventDate, 'yyyy-MM-dd') === dateKey
      })

      dayEvents.forEach((event) => {
        const startDate = event.startDate || new Date()
        const startHour = startDate.getHours()
        const startMinute = startDate.getMinutes()
        const top = (startHour + startMinute / 60) * HOUR_HEIGHT

        // 高さ計算
        let height = HOUR_HEIGHT // デフォルト1時間
        if (event.endDate) {
          const endHour = event.endDate.getHours()
          const endMinute = event.endDate.getMinutes()
          const duration = endHour + endMinute / 60 - (startHour + startMinute / 60)
          height = Math.max(20, duration * HOUR_HEIGHT) // 最小20px
        }

        positions.push({
          event,
          top,
          height,
          left: 1, // 各カラム内での位置（%）
          width: 98, // カラム幅の98%を使用
          zIndex: 20,
          opacity: 1.0,
        })
      })
    })

    return positions
  }, [events, displayDates, HOUR_HEIGHT])

  // 共通フック使用してスタイル計算
  const eventStyles = useEventStyles(eventPositions)

  // TimeGrid が空き時間クリック処理を担当するため、この関数は不要

  // Scroll to current time on initial render (only if center date is today)
  // 初期スクロールはScrollableCalendarLayoutに委譲

  const headerComponent = (
    <div className="bg-background flex h-16">
      {/* 表示日数分のヘッダー（週末フィルタリング対応） */}
      {displayDates.map((date, _index) => (
        <div key={date.toISOString()} className="flex flex-1 items-center justify-center px-1">
          <DateDisplay
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
            <div className="mt-1 text-center">
              <span className="bg-primary inline-block h-2 w-2 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
      {/* 固定日付ヘッダー */}
      <CalendarDateHeader header={headerComponent} timezone={timezone} />

      {/* スクロール可能コンテンツ */}
      <ScrollableCalendarLayout
        timezone={timezone}
        scrollToHour={isCurrentDay ? undefined : 8}
        displayDates={displayDates}
        viewMode="3day"
        onTimeClick={(hour, minute) => {
          // ThreeDayViewでは最初にクリックされた日付を使用
          const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
          onEmptyClick?.(displayDates[0], timeString)
        }}
        enableKeyboardNavigation={true}
      >
        {/* DayViewと同じ構造：ScrollableCalendarLayoutの子要素として直接配置 */}
        <div className="relative h-full">
          {/* 共通の時間グリッド線 */}
          <div className="pointer-events-none absolute inset-0">
            <HourLines startHour={0} endHour={24} hourHeight={HOUR_HEIGHT} />
          </div>

          {/* displayDatesに基づくカラム（週末フィルタリング対応） */}
          <div className="relative flex h-full">
            {displayDates.map((date, dayIndex) => {
              const dateKey = format(date, 'yyyy-MM-dd')
              // 統一フィルタリング済みの日付に対応するイベントを取得
              const dayEvents = events.filter((event) => {
                const eventDate = event.startDate || new Date()
                return format(eventDate, 'yyyy-MM-dd') === dateKey
              })

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'relative flex-1 border-r border-neutral-900/20 last:border-r-0 dark:border-neutral-100/20'
                  )}
                  style={{ width: `${100 / displayDates.length}%` }}
                >
                  {/* @ts-expect-error TODO(#389): TimedEvent型をCalendarEvent型に統一する必要がある */}
                  <ThreeDayContent
                    date={date}
                    events={dayEvents}
                    eventStyles={eventStyles}
                    onEventClick={onEventClick}
                    onEventContextMenu={onEventContextMenu}
                    onEmptyClick={onEmptyClick}
                    onEventUpdate={onUpdateEvent}
                    onTimeRangeSelect={(date, startTime, endTime) => {
                      // 時間範囲選択時の処理（必要に応じて実装）
                      const startDate = new Date(date)
                      const [startHour, startMinute] = startTime.split(':').map(Number)
                      startDate.setHours(startHour, startMinute, 0, 0)

                      // onCreateEventは(date: Date, time?: string)の形式なので、startTimeのみ渡す
                      onCreateEvent?.(startDate, startTime)
                    }}
                    className="h-full"
                    dayIndex={dayIndex}
                    displayDates={displayDates}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </ScrollableCalendarLayout>
    </div>
  )
}
