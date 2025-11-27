'use client'

import React from 'react'

import { isToday } from 'date-fns'

import { cn } from '@/lib/utils'

import { CalendarDateHeader, DateDisplay, ScrollableCalendarLayout, getDateKey } from '../../shared'
import { useResponsiveHourHeight } from '../../shared/hooks/useResponsiveHourHeight'
import { useWeekPlans } from '../hooks/useWeekPlans'

import type { WeekGridProps } from '../WeekView.types'

import { WeekContent } from './WeekContent'

/**
 * WeekGrid - 週表示のメイングリッドコンポーネント
 *
 * @description
 * 7日分のグリッド管理:
 * - 各列の幅を均等分割（100% / 7）
 * - 列間のボーダー
 * - スクロール同期
 * - 現在時刻線の表示
 */
export const WeekGrid = ({
  weekDates,
  events,
  eventsByDate,
  todayIndex,
  onEventClick,
  onEventContextMenu,
  onEmptyClick,
  onEventUpdate,
  onTimeRangeSelect,
  timezone,
  className,
}: WeekGridProps) => {
  // レスポンシブな時間高さ（ThreeDayViewと同じパターン）
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  })

  // onEventUpdate を WeekContent が期待する型に変換
  const handlePlanUpdate = React.useCallback(
    async (planId: string, updates: Partial<import('@/features/calendar/types/calendar.types').CalendarPlan>) => {
      if (!onEventUpdate) return
      const plan = events.find((e) => e.id === planId)
      if (!plan) return
      onEventUpdate({ ...plan, ...updates })
    },
    [onEventUpdate, events]
  )

  // プラン位置計算
  const { eventPositions } = useWeekPlans({
    weekDates,
    events,
  })

  // CurrentTimeLine表示のための日付配列（weekDatesをそのまま使用）
  const currentTimeDisplayDates = React.useMemo(() => {
    console.log('🔧 WeekGrid: displayDatesを設定', {
      weekDates: weekDates.map((d) => d.toDateString()),
    })
    return weekDates
  }, [weekDates])

  const headerComponent = (
    <div className="bg-background flex h-16 flex-1">
      {/* 7日分の日付ヘッダー */}
      {weekDates.map((date, index) => (
        <div
          key={date.toISOString()}
          className="flex flex-col items-center justify-center px-1"
          style={{ width: `${100 / 7}%` }}
        >
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
    <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
      {/* 固定日付ヘッダー */}
      <CalendarDateHeader header={headerComponent} timezone={timezone} />

      {/* スクロール可能コンテンツ */}
      <ScrollableCalendarLayout
        timezone={timezone}
        scrollToHour={todayIndex !== -1 ? undefined : 8}
        displayDates={currentTimeDisplayDates}
        viewMode="week"
        onTimeClick={(hour, minute) => {
          // WeekViewでは週の最初の日付を使用（日付は後でWeekContentで決定）
          const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
          onEmptyClick?.(weekDates[0], timeString)
        }}
        enableKeyboardNavigation={true}
      >
        {/* 7日分のグリッド */}
        {weekDates.map((date, dayIndex) => {
          const dateKey = getDateKey(date)
          const dayEvents = eventsByDate[dateKey] || []

          console.log('🔧 WeekGrid日付処理:', {
            date: date.toDateString(),
            dayOfWeek: date.getDay(), // 0=日曜, 1=月曜, 2=火曜, 3=水曜...
            dayIndex,
            dateKey,
            dayEventsCount: dayEvents.length,
          })

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'relative flex-1 overflow-visible',
                dayIndex < weekDates.length - 1 ? 'border-border border-r' : ''
              )}
              style={{ width: `${100 / 7}%` }}
            >
              <WeekContent
                date={date}
                plans={dayEvents}
                planPositions={eventPositions}
                onPlanClick={onEventClick}
                onPlanContextMenu={onEventContextMenu}
                onEmptyClick={onEmptyClick}
                onPlanUpdate={handlePlanUpdate}
                onTimeRangeSelect={(selection) => {
                  // 時間範囲選択時の処理: そのまま渡す（DayViewと同じ方式）
                  console.log('🔧 WeekGrid: 直接渡し:', {
                    selectionDate: selection.date.toDateString(),
                    startHour: selection.startHour,
                    startMinute: selection.startMinute,
                  })

                  onTimeRangeSelect?.(selection)
                }}
                className="h-full"
                dayIndex={dayIndex}
                displayDates={weekDates}
              />
            </div>
          )
        })}
      </ScrollableCalendarLayout>
    </div>
  )
}
