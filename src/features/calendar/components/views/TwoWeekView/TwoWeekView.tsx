'use client'

import { useMemo } from 'react'

import { isToday } from 'date-fns'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { CalendarDateHeader, DateDisplay, HourLines, ScrollableCalendarLayout, getDateKey } from '../shared'

import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight'

import { TwoWeekContent } from './components'
import { useTwoWeekView } from './hooks/useTwoWeekView'

import type { TwoWeekViewProps } from './TwoWeekView.types'

/**
 * TwoWeekView - 2週間表示ビューコンポーネント
 *
 * @description
 * 構成:
 * - WeekViewの拡張版
 * - 14日分を表示
 * - 横スクロール可能
 *
 * レイアウト（横長）:
 * ┌────┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
 * │時間│日│月│火│水│木│金│土│日│月│火│水│木│金│土│
 * ├────┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
 * │9:00│  │  │  │  │  │  │  │  │  │  │  │  │  │  │
 * │    │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
 * └────┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
 */
export const TwoWeekView = ({
  dateRange,
  tasks: _tasks,
  events,
  currentDate: _currentDate,
  startDate: _startDate,
  showWeekends = true,
  weekStartsOn = 1, // デフォルトは月曜始まり
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
}: TwoWeekViewProps) => {
  const timezone = useCalendarSettingsStore((state) => state.timezone)

  // レスポンシブな時間高さ
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  })

  // TwoWeekViewではdateRangeの開始日を使用
  const displayStartDate = useMemo(() => {
    const date = new Date(dateRange.start)
    date.setHours(0, 0, 0, 0)
    console.log('🔧 TwoWeekView: dateRange.startを使用します', {
      startDate: date.toDateString(),
    })
    return date
  }, [dateRange.start])

  // TwoWeekView専用ロジック
  const { twoWeekDates, eventsByDate, isCurrentTwoWeeks, todayIndex } = useTwoWeekView({
    startDate: displayStartDate,
    events,
    weekStartsOn,
  })

  // TwoWeekView診断ログ
  console.log('[TwoWeekView] コンポーネント受信データ:', {
    receivedEventsCount: events?.length || 0,
    startDate: displayStartDate.toDateString(),
    generatedDatesCount: twoWeekDates.length,
    eventsByDateKeys: Object.keys(eventsByDate),
    eventsByDateCounts: Object.entries(eventsByDate).map(([key, events]) => ({
      date: key,
      count: events.length,
    })),
  })

  // 表示日付配列（週末フィルタリング対応）
  const displayDates = useMemo(() => {
    if (showWeekends) {
      return twoWeekDates
    }
    // 週末を除外（土曜日=6、日曜日=0）
    return twoWeekDates.filter((date) => {
      const day = date.getDay()
      return day !== 0 && day !== 6
    })
  }, [twoWeekDates, showWeekends])

  // 初期スクロールはScrollableCalendarLayoutに委譲

  const headerComponent = (
    <div className="bg-background flex h-16">
      {/* 表示日数分のヘッダー（週末フィルタリング対応） */}
      {displayDates.map((date, _index) => (
        <div
          key={date.toISOString()}
          className="flex flex-1 items-center justify-center px-1"
          style={{ width: `${100 / displayDates.length}%` }}
        >
          <DateDisplay
            date={date}
            className="text-center"
            showDayName={true}
            showMonthYear={false}
            dayNameFormat="narrow"
            dateFormat="d"
            isToday={isToday(date)}
            isSelected={false}
          />
        </div>
      ))}
    </div>
  )

  return (
    <CalendarViewAnimation viewType="2week">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        {/* 固定日付ヘッダー */}
        <CalendarDateHeader header={headerComponent} timezone={timezone} />

        {/* スクロール可能コンテンツ */}
        <ScrollableCalendarLayout
          timezone={timezone}
          scrollToHour={isCurrentTwoWeeks && todayIndex !== -1 ? undefined : 8}
          displayDates={displayDates}
          viewMode="2week"
          onTimeClick={(hour, minute) => {
            // TwoWeekViewでは最初にクリックされた日付を使用
            const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
            onEmptyClick?.(displayDates[0]!, timeString)
          }}
          enableKeyboardNavigation={true}
        >
          {/* 表示日数分のグリッド（週末フィルタリング対応） */}
          <div className="relative flex h-full">
            {/* 共通のグリッド線（ThreeDayView・WeekViewと同じパターン） */}
            <div className="pointer-events-none absolute inset-0">
              <HourLines startHour={0} endHour={24} hourHeight={HOUR_HEIGHT} />
            </div>

            {displayDates.map((date, dayIndex) => {
              const dateKey = getDateKey(date)
              const dayEvents = eventsByDate[dateKey] || []

              console.log('🔧 TwoWeekView日付処理:', {
                date: date.toDateString(),
                dateKey,
                dayEventsCount: dayEvents.length,
                availableKeys: Object.keys(eventsByDate),
              })

              return (
                <div
                  key={date.toISOString()}
                  className="border-border relative flex-1 border-r last:border-r-0"
                  style={{ width: `${100 / displayDates.length}%` }}
                >
                  <TwoWeekContent
                    date={date}
                    plans={dayEvents}
                    onPlanClick={onEventClick}
                    onPlanContextMenu={onEventContextMenu}
                    onEmptyClick={onEmptyClick}
                    onPlanUpdate={
                      onUpdateEvent
                        ? (planId, updates) => {
                            const plan = events.find((e) => e.id === planId)
                            if (plan) {
                              onUpdateEvent({ ...plan, ...updates })
                            }
                          }
                        : undefined
                    }
                    onTimeRangeSelect={(date, startTime, _endTime) => {
                      // 時間範囲選択時の処理（従来と同じ）
                      const startDate = new Date(date)
                      const [startHour = 0, startMinute = 0] = startTime.split(':').map(Number)
                      startDate.setHours(startHour, startMinute, 0, 0)

                      // onCreateEventは(date: Date, time?: string)の形式なので、startTimeのみ渡す
                      onCreateEvent?.(startDate, startTime)
                    }}
                    onCreatePlan={(startDate, _endDate) => {
                      // onCreateEventの形式に変換
                      const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
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
        </ScrollableCalendarLayout>
      </div>
    </CalendarViewAnimation>
  )
}
