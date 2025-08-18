'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ScrollContainerProps {
  children: React.ReactNode
  className?: string
  autoScrollToTime?: boolean
  initialScrollTime?: number // 時間（例：9 = 9:00）
  scrollToCurrentTime?: boolean
  onScroll?: (scrollTop: number) => void
}

/**
 * スクロールコンテナ
 * カレンダービュー用の共通スクロール管理
 */
export function ScrollContainer({
  children,
  className,
  autoScrollToTime = false,
  initialScrollTime = 9,
  scrollToCurrentTime = false,
  onScroll
}: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 指定した時間にスクロール
  const scrollToTime = useCallback((hour: number) => {
    if (!containerRef.current) return
    
    const hourHeight = 60 // 1時間の高さ（px）
    const targetScrollTop = hour * hourHeight
    
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
  }, [])

  // 現在時刻にスクロール
  const scrollToCurrentTimePosition = useCallback(() => {
    const now = new Date()
    const currentHour = now.getHours() + now.getMinutes() / 60
    scrollToTime(Math.max(0, currentHour - 1)) // 1時間前から表示
  }, [scrollToTime])

  // 初期スクロール位置の設定
  useEffect(() => {
    if (!containerRef.current) return

    if (scrollToCurrentTime) {
      scrollToCurrentTimePosition()
    } else if (autoScrollToTime) {
      scrollToTime(initialScrollTime)
    }
  }, [autoScrollToTime, initialScrollTime, scrollToCurrentTime, scrollToTime, scrollToCurrentTimePosition])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop
    onScroll?.(scrollTop)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden',
        'scroll-smooth',
        className
      )}
      onScroll={handleScroll}
    >
      {children}
    </div>
  )
}