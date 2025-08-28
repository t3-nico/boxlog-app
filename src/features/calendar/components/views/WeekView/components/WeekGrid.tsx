'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { 
  DateDisplay, 
  CalendarLayoutWithHeader, 
  CalendarDragSelection, 
  DateTimeSelection,
  HourLines
} from '../../shared'
import { EventBlock } from '../../shared/components/EventBlock'
import { TimezoneOffset } from '../../shared'
import { useWeekEvents } from '../hooks/useWeekEvents'
import type { WeekGridProps } from '../WeekView.types'
import { useResponsiveHourHeight } from '../../shared/hooks/useResponsiveHourHeight'
import { useTimeCalculation } from '../../shared/hooks/useTimeCalculation'
const TIME_COLUMN_WIDTH = 64 // 時間列の幅（px）

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
  
  // 時間計算機能（共通化）
  const { calculateTimeFromEvent } = useTimeCalculation()
  
  // 空き時間クリックハンドラー（共通化済みロジックを使用）
  const handleEmptySlotClick = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    date: Date,
    dayIndex: number
  ) => {
    // イベントブロック上のクリックは無視
    if ((e.target as HTMLElement).closest('[data-event-block]')) {
      return
    }
    
    const { timeString } = calculateTimeFromEvent(e)
    onEmptyClick?.(date, timeString)
  }, [onEmptyClick, calculateTimeFromEvent])
  
  // スクロール処理はScrollableCalendarLayoutに任せる（削除）
  
  
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
              {/* 新しいCalendarDragSelectionを使用 */}
              <CalendarDragSelection
                date={date}
                className="absolute inset-0 z-10"
                onTimeRangeSelect={onTimeRangeSelect}
              >
                {/* クリック可能な背景エリア（グリッド生成を削除） */}
                <div
                  className={`absolute inset-0 cursor-pointer`}
                  onClick={(e) => handleEmptySlotClick(e, date, dayIndex)}
                  style={{ height: 24 * HOUR_HEIGHT }}
                />
              </CalendarDragSelection>
              
              {/* イベント表示エリア（DayViewと同じパターン） */}
              <div className="relative w-full pointer-events-none" style={{ height: 24 * HOUR_HEIGHT }}>
                {dayEvents.map(event => {
                  const position = eventPositions.find(pos => 
                    pos.event.id === event.id && pos.dayIndex === dayIndex
                  )
                  
                  if (!position) return null
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute pointer-events-none"
                      data-event-block="true"
                      style={{
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                        left: '2px',
                        right: '2px'
                      }}
                    >
                      {/* EventBlockの内容部分のみクリック可能 */}
                      <div 
                        className="pointer-events-auto m-1 h-[calc(100%-8px)]"
                        onClick={() => onEventClick?.(event)}
                      >
                        <EventBlock
                          event={event}
                          onClick={undefined} // 親のonClickを使用
                          onContextMenu={onEventContextMenu ? (e) => onEventContextMenu(event, e) : undefined}
                          showTime={true}
                          showDuration={true}
                          variant="week"
                          className="h-full w-full cursor-pointer hover:shadow-md transition-shadow pointer-events-none"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </CalendarLayoutWithHeader>
  )
}