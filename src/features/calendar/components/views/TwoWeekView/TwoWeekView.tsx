'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { DateHeader, CalendarLayoutWithHeader } from '../shared'
import { EventBlock } from '../shared/components/EventBlock'
import { useTwoWeekView } from './hooks/useTwoWeekView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { TwoWeekViewProps } from './TwoWeekView.types'
import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight'

const TIME_COLUMN_WIDTH = 64 // 時間列の幅（px）

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
    HOUR_HEIGHT
  })

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

  // 初期スクロールはScrollableCalendarLayoutに委謗

  const headerComponent = (
    <div className="bg-background h-16 flex">
      {/* 14日分のヘッダー（画面幅に均等分割） */}
      {twoWeekDates.map((date, index) => (
        <div
          key={date.toISOString()}
          className="flex-1 flex items-center justify-center px-1"
          style={{ width: `${100 / 14}%` }}
        >
          <DateHeader
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
            displayDates={twoWeekDates}
            viewMode="2week"
            onTimeClick={(hour, minute) => {
              // TwoWeekViewでは最初にクリックされた日付を使用
              const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
              onEmptyClick?.(twoWeekDates[0], timeString)
            }}
            enableKeyboardNavigation={true}
            className="h-full"
          >
        {/* 14日分のグリッド（画面幅に均等分割） */}
        <div className="flex h-full">
          {twoWeekDates.map((date, dayIndex) => {
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[dateKey] || []
            
            return (
              <div
                key={date.toISOString()}
                className="flex-1 border-r border-neutral-900/20 dark:border-neutral-100/20 last:border-r-0 relative"
                style={{ width: `${100 / 14}%` }}
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
                          'border-b border-neutral-900/20 dark:border-neutral-100/20 last:border-b-0 transition-colors',
                          'hover:bg-primary/5'
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
                        left: '1px',
                        right: '1px'
                      }}
                    >
                      <EventBlock
                        event={event}
                        onClick={() => onEventClick?.(event)}
                        className="h-full w-full"
                        compact={true}
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
    </CalendarViewAnimation>
  )
}