'use client'

import React from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { 
  DateDisplay, 
  CalendarLayoutWithHeader,
  HourLines
} from '../../shared'
import { useWeekEvents } from '../hooks/useWeekEvents'
import { WeekContent } from './WeekContent'
import type { WeekGridProps } from '../WeekView.types'
import { useResponsiveHourHeight } from '../../shared/hooks/useResponsiveHourHeight'

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
export function WeekGrid({
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
  className
}: WeekGridProps) {
  // レスポンシブな時間高さ（ThreeDayViewと同じパターン）
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72
  })
  
  // イベント位置計算
  const { eventPositions } = useWeekEvents({
    weekDates,
    events
  })
  
  // CurrentTimeLine表示のための日付配列（weekDatesをそのまま使用）
  const currentTimeDisplayDates = React.useMemo(() => {
    console.log('🔧 WeekGrid: displayDatesを設定', {
      weekDates: weekDates.map(d => d.toDateString())
    })
    return weekDates
  }, [weekDates])
  
  
  
  const headerComponent = (
    <div className="bg-background h-16 flex">
      {/* 7日分の日付ヘッダー */}
      {weekDates.map((date, index) => (
        <div
          key={date.toISOString()}
          className="flex-1 flex items-center justify-center px-1"
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
          
          {/* イベント数インジケーター */}
          {eventsByDate[format(date, 'yyyy-MM-dd')]?.length > 0 && (
            <div className="text-center mt-1">
              <span className="inline-block w-2 h-2 bg-primary rounded-full" />
            </div>
          )}
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
        // WeekViewでは最初にクリックされた日付を使用
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        onEmptyClick?.(weekDates[0], timeString)
      }}
      enableKeyboardNavigation={true}
      className={cn('bg-background', className)}
    >
      {/* 7日分のグリッド */}
      <div className="flex h-full relative">
        {/* 共通のグリッド線（ThreeDayViewと同じパターン） */}
        <div className="absolute inset-0 pointer-events-none">
          <HourLines 
            startHour={0}
            endHour={24}
            hourHeight={HOUR_HEIGHT}
          />
        </div>
        
        {weekDates.map((date, dayIndex) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const dayEvents = eventsByDate[dateKey] || []
          
          return (
            <div
              key={date.toISOString()}
              className={cn(
                'flex-1 border-r border-neutral-900/20 dark:border-neutral-100/20 last:border-r-0 relative'
              )}
              style={{ width: `${100 / 7}%` }}
            >
              <WeekContent
                date={date}
                events={dayEvents}
                eventPositions={eventPositions}
                onEventClick={onEventClick}
                onEventContextMenu={onEventContextMenu}
                onEmptyClick={onEmptyClick}
                onEventUpdate={onEventUpdate}
                onTimeRangeSelect={(date, startTime, endTime) => {
                  // 時間範囲選択時の処理
                  onTimeRangeSelect?.(date, startTime, endTime)
                }}
                className="h-full"
                dayIndex={dayIndex}
              />
            </div>
          )
        })}
      </div>
    </CalendarLayoutWithHeader>
  )
}