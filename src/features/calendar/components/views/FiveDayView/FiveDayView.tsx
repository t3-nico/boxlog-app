// @ts-nocheck TODO(#389): 型エラー6件を段階的に修正する
'use client'

import { useEffect, useMemo } from 'react'

import { format, isToday } from 'date-fns'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { CalendarDateHeader, DateDisplay, ScrollableCalendarLayout, usePlanStyles } from '../shared'
import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight'

import type { PlanPosition } from '../DayView/DayView.types'

import { FiveDayContent } from './components'
import type { FiveDayViewProps } from './FiveDayView.types'
import { useFiveDayView } from './hooks/useFiveDayView'

/**
 * FiveDayView - 5-day view component
 */
export const FiveDayView = ({
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
  onTimeRangeSelect,
  onTaskDrag: _onTaskDrag,
  onCreateTask: _onCreateTask,
  onCreateRecord: _onCreateRecord,
  onViewChange: _onViewChange,
  onNavigatePrev: _onNavigatePrev,
  onNavigateNext: _onNavigateNext,
  onNavigateToday: _onNavigateToday,
}: FiveDayViewProps) => {
  const { timezone } = useCalendarSettingsStore()

  // レスポンシブな時間高さ
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  })

  // FiveDayViewではcurrentDateを中心とした5日間を表示
  const displayCenterDate = useMemo(() => {
    const date = new Date(currentDate)
    date.setHours(0, 0, 0, 0)
    return date
  }, [currentDate])

  // FiveDayView specific logic
  const { fiveDayDates, eventsByDate, isCurrentDay } = useFiveDayView({
    centerDate: displayCenterDate,
    events,
    showWeekends,
  })

  // 統一された日付配列を使用（週末表示設定も考慮済み）
  const displayDates = useMemo(() => {
    return fiveDayDates
  }, [fiveDayDates])

  // プラン位置計算（統一された日付配列ベース）
  const eventPositions = useMemo(() => {
    const positions: PlanPosition[] = []

    // displayDates（統一フィルタリング済み）を基準にプランを配置
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
          plan: event,
          top,
          height,
          left: 1, // 各カラム内での位置（%）
          width: 98, // カラム幅の98%を使用
          zIndex: 20,
          column: 0,
          totalColumns: 1,
        })
      })
    })

    return positions
  }, [events, displayDates, HOUR_HEIGHT])

  // 共通フック使用してスタイル計算
  const eventStyles = usePlanStyles(eventPositions)

  // デバッグ用ログ
  useEffect(() => {
    console.log('🔍 FiveDayView Debug:', {
      eventsCount: events.length,
      positionsCount: eventPositions.length,
      stylesCount: Object.keys(eventStyles).length,
      positions: eventPositions.slice(0, 3),
      styles: Object.entries(eventStyles).slice(0, 3),
    })
  }, [events, eventPositions, eventStyles])

  // TimeGrid が空き時間クリック処理を担当するため、この関数は不要

  // Scroll to current time on initial render (only if center date is today)
  // 初期スクロールはScrollableCalendarLayoutに委譲

  const headerComponent = (
    <div className="bg-background flex h-16">
      {/* 表示日数分のヘッダー（週末フィルタリング対応） */}
      {displayDates.map((date, index) => (
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
        </div>
      ))}
    </div>
  )

  return (
    <CalendarViewAnimation viewType="5day">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        {/* 固定日付ヘッダー */}
        <CalendarDateHeader header={headerComponent} timezone={timezone} />

        {/* スクロール可能コンテンツ */}
        <ScrollableCalendarLayout
          timezone={timezone}
          scrollToHour={isCurrentDay ? undefined : 8}
          displayDates={displayDates}
          viewMode="5day"
          onTimeClick={(hour, minute) => {
            // FiveDayViewでは最初にクリックされた日付を使用
            const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
            onEmptyClick?.(displayDates[0], timeString)
          }}
          enableKeyboardNavigation={true}
        >
          {/* 5日分のグリッド */}
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
                className={cn('relative flex-1', dayIndex < displayDates.length - 1 ? 'border-border border-r' : '')}
                style={{ width: `${100 / displayDates.length}%` }}
              >
                {/* @ts-expect-error TODO(#389): TimedEvent型をCalendarPlan型に統一する必要がある */}
                <FiveDayContent
                  date={date}
                  plans={dayEvents}
                  planStyles={eventStyles}
                  onPlanClick={onEventClick}
                  onPlanContextMenu={onEventContextMenu}
                  onEmptyClick={onEmptyClick}
                  onPlanUpdate={onUpdateEvent}
                  onTimeRangeSelect={onTimeRangeSelect}
                  className="h-full"
                  dayIndex={dayIndex}
                  displayDates={displayDates}
                />
              </div>
            )
          })}
        </ScrollableCalendarLayout>
      </div>
    </CalendarViewAnimation>
  )
}
