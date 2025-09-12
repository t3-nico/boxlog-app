'use client'

import React, { useMemo } from 'react'

import { format, isToday } from 'date-fns'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { 
  DateDisplay, 
  CalendarLayoutWithHeader,
  HourLines,
  getDateKey
} from '../shared'

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
  tasks,
  events,
  currentDate,
  startDate,
  showWeekends = true,
  weekStartsOn = 1, // デフォルトは月曜始まり
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
}: TwoWeekViewProps) => {
  const { timezone } = useCalendarSettingsStore()
  
  // レスポンシブな時間高さ
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72
  })
  
  // TwoWeekViewではdateRangeの開始日を使用
  const displayStartDate = useMemo(() => {
    const date = new Date(dateRange.start)
    date.setHours(0, 0, 0, 0)
    console.log('🔧 TwoWeekView: dateRange.startを使用します', {
      startDate: date.toDateString()
    })
    return date
  }, [dateRange.start])
  
  // TwoWeekView専用ロジック
  const {
    twoWeekDates,
    eventsByDate,
    isCurrentTwoWeeks,
    todayIndex
  } = useTwoWeekView({
    startDate: displayStartDate,
    events,
    weekStartsOn
  })
  
  // TwoWeekView診断ログ
  console.log('[TwoWeekView] コンポーネント受信データ:', {
    receivedEventsCount: events?.length || 0,
    startDate: displayStartDate.toDateString(),
    generatedDatesCount: twoWeekDates.length,
    eventsByDateKeys: Object.keys(eventsByDate),
    eventsByDateCounts: Object.entries(eventsByDate).map(([key, events]) => ({
      date: key,
      count: events.length
    }))
  })

  // 表示日付配列（週末フィルタリング対応）
  const displayDates = useMemo(() => {
    if (showWeekends) {
      return twoWeekDates
    }
    // 週末を除外（土曜日=6、日曜日=0）
    return twoWeekDates.filter(date => {
      const day = date.getDay()
      return day !== 0 && day !== 6
    })
  }, [twoWeekDates, showWeekends])

  // 初期スクロールはScrollableCalendarLayoutに委譲

  const headerComponent = (
    <div className="bg-background h-16 flex">
      {/* 表示日数分のヘッダー（週末フィルタリング対応） */}
      {displayDates.map((date, index) => (
        <div
          key={date.toISOString()}
          className="flex-1 flex items-center justify-center px-1"
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
          
          {/* イベント数インジケーター */}
          {eventsByDate[format(date, 'yyyy-MM-dd')]?.length > 0 && (
            <div className="text-center mt-1">
              <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <CalendarViewAnimation viewType="2week">
      <div className={cn('flex flex-col h-full bg-background', className)}>
        
        {/* メインコンテンツエリア */}
        <div className="flex-1 min-h-0">
          <CalendarLayoutWithHeader
            header={headerComponent}
            timezone={timezone}
            scrollToHour={isCurrentTwoWeeks && todayIndex !== -1 ? undefined : 8}
            displayDates={displayDates}
            viewMode="2week"
            onTimeClick={(hour, minute) => {
              // TwoWeekViewでは最初にクリックされた日付を使用
              const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
              onEmptyClick?.(displayDates[0], timeString)
            }}
            enableKeyboardNavigation={true}
            className="h-full"
          >
        {/* 表示日数分のグリッド（週末フィルタリング対応） */}
        <div className="flex h-full relative">
          {/* 共通のグリッド線（ThreeDayView・WeekViewと同じパターン） */}
          <div className="absolute inset-0 pointer-events-none">
            <HourLines 
              startHour={0}
              endHour={24}
              hourHeight={HOUR_HEIGHT}
            />
          </div>
          
          {displayDates.map((date, dayIndex) => {
            const dateKey = getDateKey(date)
            const dayEvents = eventsByDate[dateKey] || []
            
            console.log('🔧 TwoWeekView日付処理:', {
              date: date.toDateString(),
              dateKey,
              dayEventsCount: dayEvents.length,
              availableKeys: Object.keys(eventsByDate)
            })
            
            return (
              <div
                key={date.toISOString()}
                className="flex-1 border-r border-neutral-900/20 dark:border-neutral-100/20 last:border-r-0 relative"
                style={{ width: `${100 / displayDates.length}%` }}
              >
                <TwoWeekContent
                  date={date}
                  events={dayEvents}
                  onEventClick={onEventClick}
                  onEventContextMenu={onEventContextMenu}
                  onEmptyClick={onEmptyClick}
                  onEventUpdate={onUpdateEvent}
                  onTimeRangeSelect={(date, startTime, endTime) => {
                    // 時間範囲選択時の処理（従来と同じ）
                    const startDate = new Date(date)
                    const [startHour, startMinute] = startTime.split(':').map(Number)
                    startDate.setHours(startHour, startMinute, 0, 0)
                    
                    const endDate = new Date(date)
                    const [endHour, endMinute] = endTime.split(':').map(Number)
                    endDate.setHours(endHour, endMinute, 0, 0)
                    
                    onCreateEvent?.(startDate, endDate)
                  }}
                  onCreateEvent={onCreateEvent}
                  className="h-full"
                  dayIndex={dayIndex}
                  displayDates={displayDates}
                />
              </div>
            )
          })}
        </div>
          </CalendarLayoutWithHeader>
        </div>
      </div>
    </CalendarViewAnimation>
  )
}