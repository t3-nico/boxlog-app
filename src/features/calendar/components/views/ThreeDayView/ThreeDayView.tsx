'use client'

import React, { useEffect, useMemo } from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { TimeColumn, CurrentTimeLine } from '../shared'
import { DateHeader } from '../shared'
import { EventBlock } from '../shared/components/EventBlock'
import { TimezoneOffset } from '../shared'
import { useThreeDayView } from './hooks/useThreeDayView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { ThreeDayViewProps } from './ThreeDayView.types'

const HOUR_HEIGHT = 72 // 1時間の高さ（px）
const TIME_COLUMN_WIDTH = 64 // 時間列の幅（px）

/**
 * ThreeDayView - 3日表示ビューコンポーネント
 * 
 * @description
 * 構成:
 * - WeekViewとほぼ同じ構造
 * - ただし3日分のみ表示
 * - 中央の日を基準に前後1日
 * 
 * レイアウト:
 * ┌────┬──────┬──────┬──────┐
 * │    │  19  │  20  │  21  │
 * │    │  火  │  水  │  木  │ ← 3日分
 * │    │      │  ●  │      │
 * ├────┼──────┼──────┼──────┤
 * │ 9  │      │ EV  │      │
 * └────┴──────┴──────┴──────┘
 */
export function ThreeDayView({
  dateRange,
  tasks,
  events,
  currentDate,
  centerDate,
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
}: ThreeDayViewProps) {
  const { timezone } = useCalendarSettingsStore()
  
  // 中央に表示する日付（指定がない場合はcurrentDateを使用）
  const displayCenterDate = centerDate || currentDate
  
  // ThreeDayView専用ロジック
  const {
    threeDayDates,
    eventsByDate,
    centerIndex,
    todayIndex,
    scrollToNow,
    isCurrentDay
  } = useThreeDayView({
    centerDate: displayCenterDate,
    events,
    onEventUpdate: onUpdateEvent
  })
  
  // 各日のラベルを生成
  const dayLabels = useMemo(() => {
    return threeDayDates.map((date, index) => {
      if (index === centerIndex - 1) return '昨日'
      if (index === centerIndex) return '今日' 
      if (index === centerIndex + 1) return '明日'
      return ''
    })
  }, [threeDayDates, centerIndex])
  
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
    const parentElement = e.currentTarget.parentElement
    const parentScrollTop = parentElement?.scrollTop || 0
    const clickY = e.clientY - rect.top + parentScrollTop
    
    // 15分単位でスナップ
    const totalMinutes = Math.max(0, Math.floor((clickY / HOUR_HEIGHT) * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round((totalMinutes % 60) / 15) * 15
    
    // 時刻文字列
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    
    onEmptyClick?.(date, timeString)
  }, [onEmptyClick])
  
  // 初回レンダリング時に現在時刻へスクロール（中央の日が今日の場合のみ）
  useEffect(() => {
    if (isCurrentDay) {
      const timer = setTimeout(() => {
        scrollToNow()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isCurrentDay, scrollToNow])
  
  return (
    <CalendarViewAnimation viewType="3day">
      <div className={cn('flex flex-col h-full bg-background', className)}>
        {/* ヘッダー情報 */}
        <div className="shrink-0 border-b border-border bg-background">
          <div className="flex items-center justify-between px-4 py-2">
            {/* 3日表示情報 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">3日表示</div>
              {todayIndex !== -1 && (
                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  今日: {dayLabels[todayIndex]}
                </div>
              )}
            </div>
            
            {/* タイムゾーン表示 */}
            <TimezoneOffset timezone={timezone} />
          </div>
        </div>
        
        {/* 日付ヘッダー行 */}
        <div className="shrink-0 border-b border-border bg-background">
          <div className="flex">
            {/* 時間列の空白スペース */}
            <div 
              className="shrink-0 border-r border-border bg-muted/5"
              style={{ width: TIME_COLUMN_WIDTH }}
            />
            
            {/* 3日分の日付ヘッダー */}
            {threeDayDates.map((date, index) => (
              <div
                key={date.toISOString()}
                className={cn(
                  'flex-1 border-r border-border last:border-r-0 py-3 px-2',
                  isToday(date) && 'bg-primary/5',
                  index === centerIndex && 'bg-accent/20'
                )}
                style={{ width: `${100 / 3}%` }}
              >
                <div className="text-center">
                  <DateHeader
                    date={date}
                    className="text-center"
                    showDayName={true}
                    showMonthYear={false}
                    dayNameFormat="short"
                    dateFormat="d"
                    isToday={isToday(date)}
                    isSelected={index === centerIndex}
                  />
                  
                  {/* 日ラベル（昨日・今日・明日） */}
                  <div className="text-xs text-muted-foreground mt-1">
                    {dayLabels[index]}
                  </div>
                  
                  {/* イベント数インジケーター */}
                  {eventsByDate[format(date, 'yyyy-MM-dd')]?.length > 0 && (
                    <div className="text-center mt-1">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* メインコンテンツエリア */}
        <div className="flex flex-1 min-h-0">
          {/* 時間軸列 */}
          <div 
            className="shrink-0 border-r border-border bg-muted/5"
            style={{ width: TIME_COLUMN_WIDTH }}
          >
            <TimeColumn
              startHour={0}
              endHour={24}
              interval={60}
              showBusinessHours={false}
              className="h-full"
            />
          </div>
          
          {/* スクロール可能なグリッドエリア */}
          <div 
            className="flex-1 overflow-y-auto relative"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
          >
            {/* 現在時刻線（今日がある場合のみ全体を横断） */}
            {todayIndex !== -1 && (
              <CurrentTimeLine
                startHour={0}
                className="absolute left-0 right-0 z-20 pointer-events-none"
              />
            )}
            
            {/* 3日分のグリッド */}
            <div className="flex h-full">
              {threeDayDates.map((date, dayIndex) => {
                const dateKey = format(date, 'yyyy-MM-dd')
                const dayEvents = eventsByDate[dateKey] || []
                
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      'flex-1 border-r border-border last:border-r-0 relative',
                      dayIndex === centerIndex && 'bg-accent/5' // 中央の日をハイライト
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
                              'border-b border-border/50 last:border-b-0 transition-colors',
                              'hover:bg-primary/5'
                            )}
                            style={{ height: `${HOUR_HEIGHT}px` }}
                            title={`${date.toLocaleDateString()} ${hour}:00 - ${hour + 1}:00`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* 今日の縦線ハイライト */}
                    {isToday(date) && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-primary z-15" />
                    )}
                    
                    {/* 中央日の縦線ハイライト */}
                    {dayIndex === centerIndex && !isToday(date) && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-accent z-15" />
                    )}
                    
                    {/* イベント表示 */}
                    {dayEvents.map(event => {
                      if (!event.startDate) return null
                      
                      // イベントの位置計算
                      const startHour = event.startDate.getHours()
                      const startMinute = event.startDate.getMinutes()
                      const top = (startHour + startMinute / 60) * HOUR_HEIGHT
                      
                      let height = HOUR_HEIGHT // デフォルト1時間
                      if (event.endDate) {
                        const endHour = event.endDate.getHours()
                        const endMinute = event.endDate.getMinutes()
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
                            className="h-full w-full"
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </CalendarViewAnimation>
  )
}