'use client'

import React, { useEffect, useMemo } from 'react'
import { addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { TimezoneOffset } from '../shared'
import { AgendaDayGroup } from './components/AgendaDayGroup'
import { AgendaEventItem } from './components/AgendaEventItem'
import { AgendaEmptyState } from './components/AgendaEmptyState'
import { useAgendaView } from './hooks/useAgendaView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { AgendaViewProps } from './AgendaView.types'

/**
 * AgendaView - リスト形式表示
 * 
 * @description
 * Googleカレンダーのアジェンダビューのような構造：
 * - 日付ごとにグループ化
 * - 縦スクロールのリスト
 * - イベントの詳細が見やすい
 * - グリッドではなくリスト形式
 * 
 * レイアウト:
 * ┌─────────────────────────────────┐
 * │ 12月20日（木）                    │ ← 日付グループヘッダー
 * ├─────────────────────────────────┤
 * │ 09:00 - 10:00                   │
 * │ 朝会                            │
 * │ 会議室A                         │
 * ├─────────────────────────────────┤
 * │ 14:00 - 15:30                   │
 * │ クライアントミーティング           │
 * │ オンライン                       │
 * ├─────────────────────────────────┤
 * │ 12月21日（金）                    │ ← 次の日
 * └─────────────────────────────────┘
 */
export function AgendaView({
  dateRange,
  tasks,
  events,
  currentDate,
  startDate,
  endDate,
  groupByDate = true,
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
}: AgendaViewProps) {
  const { timezone } = useCalendarSettingsStore()
  
  // 表示期間の設定
  const displayStartDate = useMemo(() => {
    return startDate || dateRange.start
  }, [startDate, dateRange.start])
  
  const displayEndDate = useMemo(() => {
    return endDate || addDays(displayStartDate, 30) // デフォルト: 30日後
  }, [endDate, displayStartDate])
  
  // AgendaView専用ロジック
  const {
    agendaDates,
    eventsByDate,
    allEvents,
    todayIndex,
    scrollToToday,
    isCurrentPeriod,
    totalEvents,
    hasEvents
  } = useAgendaView({
    startDate: displayStartDate,
    endDate: displayEndDate,
    events,
    groupByDate
  })
  
  // 予定作成ハンドラー
  const handleCreateEvent = React.useCallback((date: Date, time?: string) => {
    onCreateEvent?.(date, time)
  }, [onCreateEvent])
  
  // 空のスロットクリックハンドラー（日付のみ）
  const handleEmptyClick = React.useCallback((date: Date) => {
    onEmptyClick?.(date, '09:00') // デフォルト時刻
  }, [onEmptyClick])
  
  // 初回レンダリング時に今日にスクロール（現在の期間の場合のみ）
  useEffect(() => {
    if (isCurrentPeriod && todayIndex !== -1) {
      const timer = setTimeout(() => {
        scrollToToday()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isCurrentPeriod, todayIndex, scrollToToday])
  
  return (
    <CalendarViewAnimation viewType="agenda">
      <div className={cn('flex flex-col h-full bg-background', className)}>
        {/* 日付ヘッダー - 他のビューと統一 */}
        <div className="shrink-0 bg-background h-16">
          <div className="flex h-full">
            {/* タイムゾーンと空白スペース */}
            <div 
              className="shrink-0 bg-muted/5 flex items-end justify-center pb-1"
              style={{ width: '64px' }}
            >
              <TimezoneOffset timezone={timezone} className="text-xs" />
            </div>
            
            {/* Scheduleラベル */}
            <div className="flex-1 flex items-center justify-center px-2">
              <div className="text-center text-lg font-medium">
                Schedule
              </div>
            </div>
          </div>
        </div>
        
        {/* メインコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {hasEvents ? (
            groupByDate ? (
              /* 日付ごとにグループ化された表示 */
              <div className="agenda-grouped">
                {agendaDates.map(date => {
                  const dateKey = date.toISOString().split('T')[0]
                  const dayEvents = eventsByDate[dateKey] || []
                  
                  // 空の日は表示しない（設定で変更可能）
                  if (dayEvents.length === 0) return null
                  
                  return (
                    <AgendaDayGroup
                      key={dateKey}
                      date={date}
                      events={dayEvents}
                      isToday={todayIndex === agendaDates.indexOf(date)}
                      onEventClick={onEventClick}
                      onCreateEvent={handleCreateEvent}
                    />
                  )
                })}
              </div>
            ) : (
              /* グループ化しない連続リスト表示 */
              <div className="agenda-ungrouped divide-y divide-border">
                {allEvents.map(event => (
                  <AgendaEventItem
                    key={event.id}
                    event={event}
                    onEventClick={onEventClick}
                    onEventUpdate={onUpdateEvent}
                    onEventDelete={onDeleteEvent}
                    showDate={true} // グループ化しない場合は日付を表示
                  />
                ))}
              </div>
            )
          ) : (
            /* 空の状態 */
            <AgendaEmptyState
              startDate={displayStartDate}
              endDate={displayEndDate}
              onCreateEvent={handleCreateEvent}
            />
          )}
        </div>
      </div>
    </CalendarViewAnimation>
  )
}