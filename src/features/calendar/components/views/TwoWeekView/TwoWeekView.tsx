'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { TimeColumn, CurrentTimeLine } from '../shared'
import { DateHeader } from '../shared'
import { EventBlock } from '../shared/components/EventBlock'
import { TimezoneOffset } from '../shared'
import { useTwoWeekView } from './hooks/useTwoWeekView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { TwoWeekViewProps } from './TwoWeekView.types'

const HOUR_HEIGHT = 72 // 1時間の高さ（px）
const TIME_COLUMN_WIDTH = 64 // 時間列の幅（px）
const DAY_MIN_WIDTH = 120 // 各日の最小幅（px）

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
 * │    │17│18│19│20│21│22│23│24│25│26│27│28│29│30│
 * ├────┼──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┤
 * │ 9  │              14日分のイベント               │
 * └────┴──────────────────────────────────────────┘
 */
export function TwoWeekView({
  dateRange,
  tasks,
  events,
  currentDate,
  startDate,
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
}: TwoWeekViewProps) {
  const { timezone } = useCalendarSettingsStore()
  const horizontalScrollRef = useRef<HTMLDivElement>(null)
  
  // 開始日（指定がない場合はdateRange.startを使用）
  const displayStartDate = startDate || dateRange.start
  
  // TwoWeekView専用ロジック
  const {
    twoWeekDates,
    eventsByDate,
    todayIndex,
    scrollToToday,
    scrollToNow,
    currentWeekIndex,
    isCurrentTwoWeeks
  } = useTwoWeekView({
    startDate: displayStartDate,
    events,
    onEventUpdate: onUpdateEvent
  })
  
  // 週の分離ラインを表示するための週グループ
  const weekGroups = useMemo(() => {
    const week1 = twoWeekDates.slice(0, 7)
    const week2 = twoWeekDates.slice(7, 14)
    return [week1, week2]
  }, [twoWeekDates])
  
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
  
  // 初回レンダリング時に今日にスクロール（現在の2週間の場合のみ）
  useEffect(() => {
    if (isCurrentTwoWeeks && todayIndex !== -1) {
      const timer = setTimeout(() => {
        scrollToToday()
        scrollToNow()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isCurrentTwoWeeks, todayIndex, scrollToToday, scrollToNow])
  
  return (
    <CalendarViewAnimation viewType="2week">
      <div className={cn('flex flex-col h-full bg-background', className)}>
        {/* ヘッダー情報 */}
        <div className="shrink-0 border-b border-border bg-background">
          <div className="flex items-center justify-between px-4 py-2">
            {/* 2週間表示情報 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">2週間表示</div>
              {todayIndex !== -1 && (
                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  今日: {todayIndex + 1}日目 (第{currentWeekIndex + 1}週)
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {format(twoWeekDates[0], 'M/d')} - {format(twoWeekDates[13], 'M/d')}
              </div>
            </div>
            
            {/* タイムゾーン表示 */}
            <TimezoneOffset timezone={timezone} />
          </div>
        </div>
        
        {/* 日付ヘッダー行（横スクロール対応） */}
        <div className="shrink-0 border-b border-border bg-background">
          <div className="flex">
            {/* 時間列の空白スペース */}
            <div 
              className="shrink-0 border-r border-border bg-muted/5"
              style={{ width: TIME_COLUMN_WIDTH }}
            />
            
            {/* 横スクロール可能な日付ヘッダー */}
            <div 
              ref={horizontalScrollRef}
              className="flex-1 overflow-x-auto"
              style={{ 
                scrollbarWidth: 'thin',
                msOverflowStyle: 'none',
              }}
            >
              <div 
                className="flex"
                style={{ 
                  minWidth: `${14 * DAY_MIN_WIDTH}px`,
                  width: 'max-content'
                }}
              >
                {twoWeekDates.map((date, index) => {
                  const weekIndex = Math.floor(index / 7)
                  const isFirstOfWeek = index % 7 === 0
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        'border-r border-border last:border-r-0 py-3 px-2 flex-shrink-0',
                        isToday(date) && 'bg-primary/5',
                        isWeekend(date) && 'bg-muted/20',
                        isFirstOfWeek && weekIndex === 1 && 'border-l-2 border-l-primary/20'
                      )}
                      style={{ 
                        width: `${DAY_MIN_WIDTH}px`,
                        minWidth: `${DAY_MIN_WIDTH}px`
                      }}
                    >
                      <div className="text-center">
                        <DateHeader
                          date={date}
                          className="text-center"
                          showDayName={true}
                          showMonthYear={false}
                          dayNameFormat="narrow"
                          dateFormat="d"
                          isToday={isToday(date)}
                          isSelected={index === todayIndex}
                        />
                        
                        {/* 週ラベル */}
                        {isFirstOfWeek && (
                          <div className="text-xs text-muted-foreground mt-1">
                            第{weekIndex + 1}週
                          </div>
                        )}
                        
                        {/* イベント数インジケーター */}
                        {eventsByDate[format(date, 'yyyy-MM-dd')]?.length > 0 && (
                          <div className="text-center mt-1">
                            <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
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
          
          {/* 横スクロール可能なグリッドエリア */}
          <div 
            className="flex-1 overflow-auto relative"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
            onScroll={(e) => {
              // 横スクロールを同期
              if (horizontalScrollRef.current) {
                horizontalScrollRef.current.scrollLeft = e.currentTarget.scrollLeft
              }
            }}
          >
            {/* 現在時刻線（今日がある場合のみ全体を横断） */}
            {todayIndex !== -1 && (
              <CurrentTimeLine
                startHour={0}
                className="absolute left-0 right-0 z-20 pointer-events-none"
              />
            )}
            
            {/* 14日分のグリッド */}
            <div 
              className="flex h-full"
              style={{ 
                minWidth: `${14 * DAY_MIN_WIDTH}px`,
                width: 'max-content'
              }}
            >
              {twoWeekDates.map((date, dayIndex) => {
                const dateKey = format(date, 'yyyy-MM-dd')
                const dayEvents = eventsByDate[dateKey] || []
                const weekIndex = Math.floor(dayIndex / 7)
                const isFirstOfWeek = dayIndex % 7 === 0
                
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      'border-r border-border last:border-r-0 relative flex-shrink-0',
                      isWeekend(date) && 'bg-muted/10',
                      isFirstOfWeek && weekIndex === 1 && 'border-l-2 border-l-primary/20'
                    )}
                    style={{ 
                      width: `${DAY_MIN_WIDTH}px`,
                      minWidth: `${DAY_MIN_WIDTH}px`
                    }}
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
                            className="h-full w-full text-xs"
                            compact={true}
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