/**
 * 統一されたスクロール可能カレンダーレイアウト
 */

'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { TimeColumn, CurrentTimeLine, TimezoneOffset } from '../'
import { useResponsiveHourHeight } from '../hooks/useResponsiveHourHeight'

interface ScrollableCalendarLayoutProps {
  children: React.ReactNode
  className?: string
  timezone?: string
  scrollToHour?: number
  showTimeColumn?: boolean
  showCurrentTime?: boolean
  showTimezone?: boolean
  timeColumnWidth?: number
  onTimeClick?: (hour: number, minute: number) => void
  displayDates?: Date[]
  viewMode?: 'day' | '3day' | 'week' | '2week'
  header?: React.ReactNode
}

const TIME_COLUMN_WIDTH = 64

export function ScrollableCalendarLayout({
  children,
  className = '',
  timezone,
  scrollToHour = 8,
  showTimeColumn = true,
  showCurrentTime = true,
  showTimezone = true,
  timeColumnWidth = TIME_COLUMN_WIDTH,
  onTimeClick,
  displayDates = [],
  viewMode = 'week',
  header
}: ScrollableCalendarLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72
  })
  
  // 初期スクロール位置の設定
  useEffect(() => {
    if (scrollContainerRef.current && scrollToHour) {
      const scrollTop = Math.max(0, (scrollToHour - 2) * HOUR_HEIGHT)
      
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [scrollToHour, HOUR_HEIGHT])
  
  // グリッドクリックハンドラー
  const handleGridClick = useCallback((e: React.MouseEvent) => {
    if (!onTimeClick || !scrollContainerRef.current) return
    
    const rect = scrollContainerRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top + scrollContainerRef.current.scrollTop
    const x = e.clientX - rect.left
    
    // 時間列以外の領域のクリックのみ処理
    if (showTimeColumn && x < timeColumnWidth) return
    
    // 15分単位でスナップ
    const totalMinutes = Math.max(0, Math.floor((y / HOUR_HEIGHT) * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round((totalMinutes % 60) / 15) * 15
    
    if (hours >= 0 && hours < 24) {
      onTimeClick(hours, minutes)
    }
  }, [onTimeClick, HOUR_HEIGHT, showTimeColumn, timeColumnWidth])
  
  return (
    <div className={cn('flex flex-col flex-1 min-h-0', className)}>
      {/* ヘッダーエリア（非スクロール） */}
      <div className="shrink-0 flex">
        {/* UTC/タイムゾーン表示エリア（ヘッダー左端） */}
        {showTimeColumn && showTimezone && (
          <div 
            className="shrink-0 bg-muted/5 flex items-end justify-center pb-1 border-b border-border"
            style={{ width: timeColumnWidth }}
          >
            <TimezoneOffset timezone={timezone} className="text-xs" />
          </div>
        )}
        
        {/* 各ビューが独自のヘッダーを配置するエリア */}
        <div className="flex-1">
          {header}
        </div>
      </div>
      
      {/* スクロール可能コンテンツエリア */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* メインスクロールエリア */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto relative"
          onClick={handleGridClick}
        >
          <div 
            className="flex w-full"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
          >
            {/* 時間軸列 - スクロールと同期 */}
            {showTimeColumn && (
              <div 
                className="shrink-0 bg-muted/5 sticky left-0 z-10"
                style={{ width: timeColumnWidth }}
              >
                <TimeColumn
                  startHour={0}
                  endHour={24}
                  hourHeight={HOUR_HEIGHT}
                  format="24h"
                  className="h-full"
                />
              </div>
            )}
            
            {/* グリッドコンテンツエリア */}
            <div className="flex-1 relative">
              {/* 現在時刻線 */}
              {showCurrentTime && (
                <CurrentTimeLine
                  hourHeight={HOUR_HEIGHT}
                  timeColumnWidth={showTimeColumn ? timeColumnWidth : 0}
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  displayDates={displayDates}
                  viewMode={viewMode}
                />
              )}
              
              {/* メインコンテンツ */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * ヘッダー付きの統一レイアウト
 */
interface CalendarLayoutWithHeaderProps extends ScrollableCalendarLayoutProps {
  header: React.ReactNode
}

export function CalendarLayoutWithHeader({
  header,
  children,
  ...props
}: CalendarLayoutWithHeaderProps) {
  return (
    <ScrollableCalendarLayout {...props} header={header}>
      {children}
    </ScrollableCalendarLayout>
  )
}