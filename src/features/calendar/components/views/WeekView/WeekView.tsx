'use client'

import React, { useMemo } from 'react'

import { isWeekend } from 'date-fns'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

import { CalendarViewAnimation } from '../../animations/ViewTransition'

import { WeekGrid } from './components/WeekGrid'
import { useWeekView } from './hooks/useWeekView'

import type { WeekViewProps } from './WeekView.types'

/**
 * WeekView - 週表示ビューコンポーネント
 * 
 * @description
 * 構成:
 * 1. shared/DateDisplay で7日分の日付表示
 * 2. shared/grid/TimeColumn で時間軸
 * 3. shared/grid/TimeGrid でグリッド
 * 4. 7つの shared/components/DayColumn を横並び
 * 5. shared/components/EventBlock でイベント
 * 6. shared/grid/CurrentTimeLine で現在時刻
 * 
 * レイアウト:
 * ┌────┬────┬────┬────┬────┬────┬────┬────┐
 * │    │ 17 │ 18 │ 19 │ 20 │ 21 │ 22 │ 23 │
 * │    │ 日 │ 月 │ 火 │ 水 │ 木 │ 金 │ 土 │ ← DateDisplay
 * │    │    │    │    │ ● │    │    │    │ ← 今日マーカー
 * ├────┼────┼────┼────┼────┼────┼────┼────┤
 * │ 9  │    │ EV │    │    │ EV │    │    │
 * │10  │    │    │ EV │    │    │    │    │
 * └────┴────┴────┴────┴────┴────┴────┴────┘
 */
export const WeekView = ({
  dateRange,
  _tasks,
  events,
  _currentDate,
  showWeekends = true,
  weekStartsOn = 1, // 0: 日曜始まり, 1: 月曜始まり
  className,
  _onTaskClick,
  onEventClick,
  onEventContextMenu,
  _onCreateEvent,
  onUpdateEvent,
  _onDeleteEvent,
  _onRestoreEvent,
  onEmptyClick,
  onTimeRangeSelect,
  _onTaskDrag,
  _onCreateTask,
  _onCreateRecord,
  _onViewChange,
  _onNavigatePrev,
  _onNavigateNext,
  _onNavigateToday
}: WeekViewProps) => {
  const { timezone } = useCalendarSettingsStore()
  
  // 週の開始日を計算（通常は dateRange.start を使用）
  const weekStartDate = useMemo(() => {
    return dateRange.start
  }, [dateRange.start])
  
  // WeekView専用ロジック
  const {
    weekDates,
    eventsByDate,
    todayIndex,
    _isCurrentWeek
  } = useWeekView({
    startDate: weekStartDate,
    events,
    weekStartsOn,
    onEventUpdate: onUpdateEvent
  })
  
  // 表示する日付を計算（土日を除外するかどうか）
  const displayDates = useMemo(() => {
    return showWeekends 
      ? weekDates 
      : weekDates.filter(day => !isWeekend(day))
  }, [weekDates, showWeekends])
  
  // WeekView診断ログ
  console.log('[WeekView] コンポーネント受信データ:', {
    receivedEventsCount: events?.length || 0,
    startDate: weekStartDate.toDateString(),
    generatedDatesCount: weekDates.length,
    eventsByDateKeys: Object.keys(eventsByDate),
    eventsByDateCounts: Object.entries(eventsByDate).map(([key, events]) => ({
      date: key,
      count: events.length
    }))
  })
  
  
  // 初期スクロールはScrollableCalendarLayoutに委譲
  
  return (
    <CalendarViewAnimation viewType="week">
      <div className={cn('flex flex-col h-full bg-background', className)}>
        
        {/* メインコンテンツエリア */}
        <div className="flex-1 min-h-0">
          <WeekGrid
            weekDates={displayDates}
            events={events}
            eventsByDate={eventsByDate}
            todayIndex={todayIndex}
            timezone={timezone}
            onEventClick={onEventClick}
            onEventContextMenu={onEventContextMenu}
            onEmptyClick={(date, time) => {
              onEmptyClick?.(date, time)
            }}
            onEventUpdate={onUpdateEvent}
            onTimeRangeSelect={onTimeRangeSelect}
            className="h-full"
          />
        </div>
      </div>
    </CalendarViewAnimation>
  )
}