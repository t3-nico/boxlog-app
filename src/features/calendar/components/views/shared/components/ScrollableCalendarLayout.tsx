/**
 * 統一されたスクロール可能カレンダーレイアウト
 */

'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
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
  
  // スクロール機能の追加
  enableKeyboardNavigation?: boolean
  onScrollPositionChange?: (scrollTop: number) => void
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
  header,
  enableKeyboardNavigation = true,
  onScrollPositionChange
}: ScrollableCalendarLayoutProps) {
  // ScrollableCalendarLayout がレンダリングされました
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const [isScrolling, setIsScrolling] = useState(false)
  
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72
  })

  // ScrollableCalendarLayoutの初期化完了
  
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

  // スクロールイベントの処理
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    
    const scrollTop = scrollContainerRef.current.scrollTop
    setIsScrolling(true)
    
    if (onScrollPositionChange) {
      onScrollPositionChange(scrollTop)
    }
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [onScrollPositionChange])

  // スクロールリスナーの設定
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // キーボードナビゲーション（グローバルキーボードイベントも監視）
  const handleKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent) => {
    // キーボードイベント処理開始
    
    if (!enableKeyboardNavigation || !scrollContainerRef.current) {
      // キーボード処理をスキップ
      return
    }
    
    const container = scrollContainerRef.current
    const currentScroll = container.scrollTop
    
    // スクロール実行
    
    switch (e.key) {
      case 'PageUp':
        e.preventDefault()
        const newScrollUp = Math.max(0, currentScroll - container.clientHeight)
        container.scrollTop = newScrollUp
        // PageUp スクロール実行
        break
      case 'PageDown':
        e.preventDefault()
        const newScrollDown = currentScroll + container.clientHeight
        container.scrollTop = newScrollDown
        // PageDown スクロール実行
        break
      case 'Home':
        if (e.ctrlKey) {
          e.preventDefault()
          container.scrollTop = 0
          // Ctrl+Home スクロール実行
        }
        break
      case 'End':
        if (e.ctrlKey) {
          e.preventDefault()
          const newScrollEnd = container.scrollHeight
          container.scrollTop = newScrollEnd
          // Ctrl+End スクロール実行
        }
        break
      case 'ArrowUp':
        if (e.ctrlKey) {
          e.preventDefault()
          const newScrollArrowUp = Math.max(0, currentScroll - HOUR_HEIGHT)
          container.scrollTop = newScrollArrowUp
          // Ctrl+ArrowUp スクロール実行
        }
        break
      case 'ArrowDown':
        if (e.ctrlKey) {
          e.preventDefault()
          const newScrollArrowDown = currentScroll + HOUR_HEIGHT
          container.scrollTop = newScrollArrowDown
          // Ctrl+ArrowDown スクロール実行
        }
        break
    }
  }, [enableKeyboardNavigation, HOUR_HEIGHT])

  // グローバルキーボードイベントのリスナー
  useEffect(() => {
    if (!enableKeyboardNavigation) {
      return
    }
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e)
    }
    
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [enableKeyboardNavigation, handleKeyDown])
  
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
          className={cn(
            'flex-1 overflow-y-auto relative',
            enableKeyboardNavigation && 'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2'
          )}
          onClick={handleGridClick}
          onKeyDown={handleKeyDown}
          tabIndex={enableKeyboardNavigation ? 0 : -1}
          role={enableKeyboardNavigation ? "region" : undefined}
          aria-label={enableKeyboardNavigation ? `${viewMode} view calendar` : undefined}
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
  // CalendarLayoutWithHeader が呼び出されました
  return (
    <ScrollableCalendarLayout {...props} header={header}>
      {children}
    </ScrollableCalendarLayout>
  )
}