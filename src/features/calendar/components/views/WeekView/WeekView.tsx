'use client'

import React, { useEffect, useMemo } from 'react'
import { isWeekend } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { WeekGrid } from './components/WeekGrid'
import { useWeekView } from './hooks/useWeekView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { TimezoneOffset } from '../shared'
import type { WeekViewProps } from './WeekView.types'

/**
 * WeekView - 週表示ビューコンポーネント
 * 
 * @description
 * 構成:
 * 1. shared/header/DateHeaderRow で7日分の日付表示
 * 2. shared/grid/TimeColumn で時間軸
 * 3. shared/grid/TimeGrid でグリッド
 * 4. 7つの shared/components/DayColumn を横並び
 * 5. shared/components/EventBlock でイベント
 * 6. shared/grid/CurrentTimeLine で現在時刻
 * 
 * レイアウト:
 * ┌────┬────┬────┬────┬────┬────┬────┬────┐
 * │    │ 17 │ 18 │ 19 │ 20 │ 21 │ 22 │ 23 │
 * │    │ 日 │ 月 │ 火 │ 水 │ 木 │ 金 │ 土 │ ← DateHeaderRow
 * │    │    │    │    │ ● │    │    │    │ ← 今日マーカー
 * ├────┼────┼────┼────┼────┼────┼────┼────┤
 * │ 9  │    │ EV │    │    │ EV │    │    │
 * │10  │    │    │ EV │    │    │    │    │
 * └────┴────┴────┴────┴────┴────┴────┴────┘
 */
export function WeekView({
  dateRange,
  tasks,
  events,
  currentDate,
  showWeekends = true,
  weekStartsOn = 0, // 0: 日曜始まり, 1: 月曜始まり
  className,
  onTaskClick,
  onEventClick,
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
}: WeekViewProps) {
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
    scrollToNow,
    isCurrentWeek
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
  
  // 初回レンダリング時に現在時刻へスクロール（現在の週の場合のみ）
  useEffect(() => {
    if (isCurrentWeek) {
      const timer = setTimeout(() => {
        scrollToNow()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isCurrentWeek, scrollToNow])
  
  return (
    <CalendarViewAnimation viewType="week">
      <div className={cn('flex flex-col h-full bg-background', className)}>
        {/* ヘッダー情報 */}
        <div className="shrink-0 border-b border-border bg-background">
          <div className="flex items-center justify-between px-4 py-2">
            {/* 週表示情報 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {displayDates.length === 7 ? '週表示' : `${displayDates.length}日表示`}
              </div>
              {todayIndex !== -1 && (
                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  今日: {todayIndex + 1}日目
                </div>
              )}
            </div>
            
            {/* タイムゾーン表示 */}
            <TimezoneOffset timezone={timezone} />
          </div>
        </div>
        
        {/* メインコンテンツエリア */}
        <div className="flex-1 min-h-0">
          <WeekGrid
            weekDates={displayDates}
            events={events}
            eventsByDate={eventsByDate}
            todayIndex={todayIndex}
            onEventClick={onEventClick}
            onEmptyClick={(date, time) => {
              onEmptyClick?.(date, time)
            }}
            onEventUpdate={onUpdateEvent}
            className="h-full"
          />
        </div>
      </div>
    </CalendarViewAnimation>
  )
}