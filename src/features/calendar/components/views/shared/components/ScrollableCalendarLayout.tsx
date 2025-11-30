/**
 * 統一されたスクロール可能カレンダーレイアウト
 */

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import { TimeColumn } from '../grid/TimeColumn/TimeColumn'

import { useResponsiveHourHeight } from '../hooks/useResponsiveHourHeight'

import { TimezoneOffset } from './TimezoneOffset'

interface ScrollableCalendarLayoutProps {
  children: React.ReactNode
  className?: string | undefined
  timezone?: string | undefined
  scrollToHour?: number | undefined
  showTimeColumn?: boolean | undefined
  showCurrentTime?: boolean | undefined
  showTimezone?: boolean | undefined
  timeColumnWidth?: number | undefined
  onTimeClick?: ((hour: number, minute: number) => void) | undefined
  displayDates?: Date[] | undefined
  viewMode?: 'day' | '3day' | '5day' | 'week' | '2week' | undefined

  // スクロール機能の追加
  enableKeyboardNavigation?: boolean | undefined
  onScrollPositionChange?: ((scrollTop: number) => void) | undefined
}

interface CalendarDateHeaderProps {
  header: React.ReactNode
  showTimeColumn?: boolean | undefined
  showTimezone?: boolean | undefined
  timeColumnWidth?: number | undefined
  timezone?: string | undefined
}

const TIME_COLUMN_WIDTH = 48

/**
 * カレンダー日付ヘッダー（固定）
 */
export const CalendarDateHeader = ({
  header,
  showTimeColumn = true,
  showTimezone = true,
  timeColumnWidth = TIME_COLUMN_WIDTH,
  timezone,
}: CalendarDateHeaderProps) => {
  return (
    <div className="flex shrink-0 flex-col">
      <div className="flex px-4">
        {/* UTC/タイムゾーン表示エリア（ヘッダー左端） */}
        {showTimeColumn && showTimezone && timezone ? (
          <div className="flex shrink-0 items-end justify-start" style={{ width: timeColumnWidth }}>
            <TimezoneOffset timezone={timezone} className="text-xs" />
          </div>
        ) : null}

        {/* 各ビューが独自のヘッダーを配置するエリア */}
        <div className="flex-1">{header}</div>
      </div>
    </div>
  )
}

/**
 * スクロール可能カレンダーコンテンツ
 */
export const ScrollableCalendarLayout = ({
  children,
  className = '',
  timezone: _timezone,
  scrollToHour = 8,
  showTimeColumn = true,
  showCurrentTime = true,
  showTimezone: _showTimezone = true,
  timeColumnWidth = TIME_COLUMN_WIDTH,
  onTimeClick,
  displayDates = [],
  viewMode = 'week',
  enableKeyboardNavigation = true,
  onScrollPositionChange,
}: ScrollableCalendarLayoutProps) => {
  // ScrollableCalendarLayout がレンダリングされました

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const [_isScrolling, setIsScrolling] = useState(false)
  const [_containerWidth, setContainerWidth] = useState(800)

  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  })

  // 今日の列の位置を計算
  const todayColumnPosition = useMemo(() => {
    if (!displayDates || displayDates.length === 0) {
      return null
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 今日のインデックスを見つける
    const todayIndex = displayDates.findIndex((date) => {
      if (!date) return false
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })

    if (todayIndex === -1) {
      return null
    }

    // 単一日表示の場合
    if (displayDates.length === 1) {
      return {
        left: 0,
        width: '100%',
      }
    }

    // 複数日表示の場合、列の幅と位置を計算
    const columnWidth = 100 / displayDates.length // パーセント
    const leftPosition = todayIndex * columnWidth // パーセント

    return {
      left: `${leftPosition}%`,
      width: `${columnWidth}%`,
    }
  }, [displayDates])

  // 今日が表示範囲に含まれるか判定
  const shouldShowCurrentTimeLine = useMemo(() => {
    return showCurrentTime && todayColumnPosition !== null
  }, [showCurrentTime, todayColumnPosition])

  // 現在時刻の位置を計算
  const [currentTime, setCurrentTime] = useState(new Date())
  const currentTimePosition = useMemo(() => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const totalHours = hours + minutes / 60
    return totalHours * HOUR_HEIGHT
  }, [currentTime, HOUR_HEIGHT])

  // ScrollableCalendarLayoutの初期化完了

  // 初期スクロール位置の設定
  useEffect(() => {
    if (scrollContainerRef.current && scrollToHour) {
      const scrollTop = Math.max(0, (scrollToHour - 2) * HOUR_HEIGHT)

      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        })
      }, 100)
    }
  }, [scrollToHour, HOUR_HEIGHT])

  // コンテナ幅の動的取得
  useEffect(() => {
    const updateContainerWidth = () => {
      if (scrollContainerRef.current) {
        const width = scrollContainerRef.current.offsetWidth
        setContainerWidth(width)
      }
    }

    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)
    return () => window.removeEventListener('resize', updateContainerWidth)
  }, [])

  // スクロールイベントの処理
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return

    const { scrollTop } = scrollContainerRef.current
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
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
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
    },
    [enableKeyboardNavigation, HOUR_HEIGHT]
  )

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

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    if (!shouldShowCurrentTimeLine) return

    const updateCurrentTime = () => setCurrentTime(new Date())
    updateCurrentTime() // 初回実行

    const timer = setInterval(updateCurrentTime, 60000) // 1分ごと

    return () => clearInterval(timer)
  }, [shouldShowCurrentTimeLine])

  // グリッドクリックハンドラー
  const handleGridClick = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [onTimeClick, HOUR_HEIGHT, showTimeColumn, timeColumnWidth]
  )

  return (
    <ScrollArea className={cn('relative min-h-0 flex-1', className)}>
      <div
        ref={scrollContainerRef}
        className="relative flex w-full px-4"
        style={{ height: `${24 * HOUR_HEIGHT}px` }}
        onClick={handleGridClick}
        onKeyDown={handleKeyDown}
        tabIndex={enableKeyboardNavigation ? 0 : -1}
        role={enableKeyboardNavigation ? 'grid' : undefined}
        aria-label={enableKeyboardNavigation ? `${viewMode} view calendar` : undefined}
      >
        {/* 時間軸列 */}
        {showTimeColumn && (
          <div className="sticky left-0 z-10 shrink-0" style={{ width: timeColumnWidth }}>
            <TimeColumn startHour={0} endHour={24} hourHeight={HOUR_HEIGHT} format="24h" className="h-full" />
          </div>
        )}

        {/* グリッドコンテンツエリア */}
        <div className="relative flex flex-1">
          {/* メインコンテンツ */}
          {children}

          {/* 現在時刻線 - 今日の列のみに表示 */}
          {shouldShowCurrentTimeLine && todayColumnPosition ? (
            <>
              {/* 横線 - 今日の列のみ */}
              <div
                className={cn('bg-primary pointer-events-none absolute z-40 h-[2px] shadow-sm')}
                style={{
                  top: `${currentTimePosition}px`,
                  left: todayColumnPosition.left,
                  width: todayColumnPosition.width,
                }}
              />

              {/* 点 - 今日の列の左端 */}
              <div
                className={cn(
                  'border-background bg-primary pointer-events-none absolute z-40 h-2 w-2 rounded-full border shadow-md'
                )}
                style={{
                  top: `${currentTimePosition - 4}px`,
                  left: todayColumnPosition.left === 0 ? '-4px' : todayColumnPosition.left,
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    </ScrollArea>
  )
}
