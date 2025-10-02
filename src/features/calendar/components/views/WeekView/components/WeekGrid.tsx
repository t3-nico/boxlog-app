// @ts-nocheck TODO(#389): 型エラー5件を段階的に修正する
'use client'

import React from 'react'

import { isToday } from 'date-fns'

import { cn } from '@/lib/utils'

import { CalendarLayoutWithHeader, DateDisplay, HourLines, getDateKey } from '../../shared'
import { useResponsiveHourHeight } from '../../shared/hooks/useResponsiveHourHeight'
import { useWeekEvents } from '../hooks/useWeekEvents'

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

  // イベント位置計算
  const { eventPositions } = useWeekEvents({
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
    <div className="bg-background flex h-16">
      {/* 7日分の日付ヘッダー */}
      {weekDates.map((date, _index) => (
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
          {eventsByDate[getDateKey(date)]?.length > 0 ? (
            <div className="mt-1 text-center">
              <span className="bg-primary inline-block h-2 w-2 rounded-full" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )

  return (
    <CalendarLayoutWithHeader
      header={headerComponent}
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
      className={cn('bg-background', className)}
    >
      {/* 7日分のグリッド */}
      <div className="relative flex h-full overflow-visible">
        {/* 共通のグリッド線（ThreeDayViewと同じパターン） */}
        <div className="pointer-events-none absolute inset-0">
          <HourLines startHour={0} endHour={24} hourHeight={HOUR_HEIGHT} />
        </div>

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
                'relative flex-1 overflow-visible border-r border-neutral-900/20 last:border-r-0 dark:border-neutral-100/20'
              )}
              style={{ width: `${100 / 7}%` }}
            >
              {/* @ts-expect-error TODO(#389): TimedEvent型をCalendarEvent型に統一する必要がある */}
              <WeekContent
                date={date}
                events={dayEvents}
                eventPositions={eventPositions}
                onEventClick={onEventClick}
                onEventContextMenu={onEventContextMenu}
                onEmptyClick={onEmptyClick}
                onEventUpdate={onEventUpdate}
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
      </div>
    </CalendarLayoutWithHeader>
  )
}
