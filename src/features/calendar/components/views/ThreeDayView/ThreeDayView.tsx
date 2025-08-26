'use client'

import React, { useEffect, useMemo } from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateHeader, CalendarLayoutWithHeader } from '../shared'
import { EventBlock } from '../shared/components/EventBlock'
import { useThreeDayView } from './hooks/useThreeDayView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { ThreeDayViewProps } from './ThreeDayView.types'
import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight'

const TIME_COLUMN_WIDTH = 64 // Width of time column (px)

/**
 * ThreeDayView - 3-day view component
 */
export function ThreeDayView({
  dateRange,
  tasks,
  events,
  currentDate,
  centerDate,
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
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday
}: ThreeDayViewProps) {
  const { timezone } = useCalendarSettingsStore()
  
  // レスポンシブな時間高さ
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72
  })
  
  // ThreeDayViewではcurrentDateを中心とした3日間を表示
  const displayCenterDate = useMemo(() => {
    const date = new Date(currentDate)
    date.setHours(0, 0, 0, 0)
    return date
  }, [currentDate])
  
  // ThreeDayView specific logic
  const {
    threeDayDates,
    eventsByDate,
    isCurrentDay
  } = useThreeDayView({
    centerDate: displayCenterDate,
    events,
    HOUR_HEIGHT,
    showWeekends
  })
  
  // 3日間の日付配列を使用（週末表示設定を考慮）
  const displayDates = useMemo(() => {
    return threeDayDates
  }, [threeDayDates])

  // 空き時間クリックハンドラー
  const handleEmptySlotClick = React.useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    date: Date,
    dayIndex: number
  ) => {
    // イベントブロック上のクリックは無視
    if ((e.target as HTMLElement).closest('[data-event-block]')) {
      return
    }
    
    // クリック位置から時刻を計算
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    
    // 15分単位でスナップ
    const totalMinutes = Math.max(0, Math.floor((clickY / HOUR_HEIGHT) * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round((totalMinutes % 60) / 15) * 15
    
    // 時刻文字列
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    
    onEmptyClick?.(date, timeString)
  }, [onEmptyClick, HOUR_HEIGHT])

  // Scroll to current time on initial render (only if center date is today)
  // 初期スクロールはScrollableCalendarLayoutに委譲

  const headerComponent = (
    <div className="bg-background h-16 flex">
      {/* 表示日数分のヘッダー（週末フィルタリング対応） */}
      {displayDates.map((date, index) => (
        <div
          key={date.toISOString()}
          className="flex-1 flex items-center justify-center px-1"
        >
          <DateHeader
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
    <div className={cn('flex flex-col h-full bg-background', className)}>
      
      {/* メインコンテンツエリア */}
      <div className="flex-1 min-h-0">
        <CalendarLayoutWithHeader
          header={headerComponent}
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
          className="h-full"
        >
      {/* 表示日数分のグリッド（週末フィルタリング対応） */}
      <div className="flex h-full">
        {displayDates.map((date, dayIndex) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const dayEvents = eventsByDate[dateKey] || []
          
          return (
            <div
              key={date.toISOString()}
              className={cn(
                'flex-1 border-r border-neutral-900/20 dark:border-neutral-100/20 last:border-r-0 relative'
              )}
              style={{ width: `${100 / 3}%` }}
            >
              {/* クリック可能な背景エリア */}
              <div
                onClick={(e) => handleEmptySlotClick(e, date, dayIndex)}
                className="absolute inset-0 z-10 cursor-cell"
              >
                {/* 時間グリッド背景 */}
                <div className="absolute inset-0">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div
                      key={hour}
                      className={cn(
                        hour < 23 ? 'border-b border-neutral-900/20 dark:border-neutral-100/20' : '',
                        'transition-colors hover:bg-primary/5'
                      )}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      title={`${date.toLocaleDateString()} ${hour}:00 - ${hour + 1}:00`}
                    />
                  ))}
                </div>
              </div>
              
              {/* イベント表示 */}
              {dayEvents.map(event => {
                // 簡単なイベント位置計算（後で改善）
                const startHour = parseInt(event.startTime?.split(':')[0] || '0')
                const startMinute = parseInt(event.startTime?.split(':')[1] || '0')
                const top = (startHour + startMinute / 60) * HOUR_HEIGHT
                
                // 簡単な高さ計算
                let height = HOUR_HEIGHT // デフォルト1時間
                if (event.endTime) {
                  const endHour = parseInt(event.endTime.split(':')[0])
                  const endMinute = parseInt(event.endTime.split(':')[1])
                  const duration = (endHour + endMinute / 60) - (startHour + startMinute / 60)
                  height = Math.max(20, duration * HOUR_HEIGHT) // 最小20px
                }
                
                return (
                  <div
                    key={event.id}
                    data-event-block
                    className="absolute z-20"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: '2px',
                      right: '2px'
                    }}
                  >
                    <EventBlock
                      event={event}
                      onClick={() => onEventClick?.(event)}
                      onContextMenu={onEventContextMenu ? (e) => onEventContextMenu(event, e) : undefined}
                      className="h-full w-full"
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
        </CalendarLayoutWithHeader>
      </div>
    </div>
  )
}