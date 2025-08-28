'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { 
  DateDisplay, 
  CalendarLayoutWithHeader,
  HourLines,
  CalendarDragSelection
} from '../shared'
import { EventBlock } from '../shared/components/EventBlock'
import { useTwoWeekView } from './hooks/useTwoWeekView'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import type { TwoWeekViewProps } from './TwoWeekView.types'
import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight'
import { useTimeCalculation } from '../shared/hooks/useTimeCalculation'

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

  // 時間計算機能（共通化）
  const { calculateTimeFromEvent } = useTimeCalculation()
  
  // 空き時間クリックハンドラー（共通化済みロジックを使用）
  const handleEmptySlotClick = React.useCallback((
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

  // 初期スクロールはScrollableCalendarLayoutに委謗

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
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[dateKey] || []
            
            return (
              <div
                key={date.toISOString()}
                className="flex-1 border-r border-neutral-900/20 dark:border-neutral-100/20 last:border-r-0 relative"
                style={{ width: `${100 / displayDates.length}%` }}
              >
                {/* 新しいCalendarDragSelectionを使用 */}
                <CalendarDragSelection
                  date={date}
                  className="absolute inset-0 z-10"
                  onTimeRangeSelect={(date, startTime, endTime) => {
                    // 時間範囲選択時の処理
                    const startDate = new Date(date)
                    const [startHour, startMinute] = startTime.split(':').map(Number)
                    startDate.setHours(startHour, startMinute, 0, 0)
                    
                    const endDate = new Date(date)
                    const [endHour, endMinute] = endTime.split(':').map(Number)
                    endDate.setHours(endHour, endMinute, 0, 0)
                    
                    onCreateEvent?.(startDate, endDate)
                  }}
                  onSingleClick={onEmptyClick}
                >
                  {/* クリック可能な背景エリア（グリッド生成を削除） */}
                  <div
                    className={`absolute inset-0 cursor-cell`}
                    style={{ height: 24 * HOUR_HEIGHT }}
                  />
                </CalendarDragSelection>
                
                {/* イベント表示エリア */}
                <div className="absolute inset-0 pointer-events-none" style={{ height: 24 * HOUR_HEIGHT }}>
                  {dayEvents.map(event => {
                    // startDate/endDateを使用した統一的なイベント位置計算
                    const startDate = event.startDate || new Date()
                    const startHour = startDate.getHours()
                    const startMinute = startDate.getMinutes()
                    const top = (startHour + startMinute / 60) * HOUR_HEIGHT
                    
                    // 高さ計算（統一）
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
                        className="absolute z-20 pointer-events-none"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: '2px',
                          right: '2px'
                        }}
                      >
                        <div className="pointer-events-auto h-full w-full">
                          <EventBlock
                            event={event}
                            onClick={() => onEventClick?.(event)}
                            onContextMenu={onEventContextMenu ? (e) => onEventContextMenu(event, e) : undefined}
                            className="h-full w-full"
                            compact={true}
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
        </div>
      </div>
    </CalendarViewAnimation>
  )
}