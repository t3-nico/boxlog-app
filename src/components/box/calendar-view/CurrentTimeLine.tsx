'use client'

import React, { useEffect, useState, useRef } from 'react'
import { getCurrentTimePosition, getCurrentTimeInUserTimezone, formatCurrentTime, useTimezoneChange } from '@/utils/timezone'

interface CurrentTimeLineProps {
  containerRef: React.RefObject<HTMLDivElement>
  gridInterval: number
  isVisible?: boolean
}

export function CurrentTimeLine({ 
  containerRef, 
  gridInterval,
  isVisible = true 
}: CurrentTimeLineProps) {
  const [currentTimePosition, setCurrentTimePosition] = useState(getCurrentTimePosition())
  const [currentTime, setCurrentTime] = useState(getCurrentTimeInUserTimezone())
  const hasScrolledToCurrentTime = useRef(false)

  // 現在時刻の更新関数
  const updateCurrentTime = () => {
    const userTime = getCurrentTimeInUserTimezone()
    setCurrentTime(userTime)
    setCurrentTimePosition(getCurrentTimePosition())
    
    console.log('🕐 CurrentTimeLine updated:', {
      userTime: userTime.toLocaleString(),
      position: getCurrentTimePosition()
    })
  }

  // 現在時刻の更新（1分ごと）
  useEffect(() => {
    // 初回実行
    updateCurrentTime()

    // 1分ごとに更新
    const interval = setInterval(updateCurrentTime, 60000)

    return () => clearInterval(interval)
  }, [])

  // タイムゾーン変更をリッスン
  useEffect(() => {
    const cleanup = useTimezoneChange((newTimezone) => {
      console.log('🌐 タイムゾーン変更を検知:', newTimezone)
      // タイムゾーン変更時に即座に現在時刻を更新
      updateCurrentTime()
    })

    return cleanup
  }, [])

  // 初回レンダリング時に現在時刻へスクロール
  useEffect(() => {
    if (
      !hasScrolledToCurrentTime.current && 
      containerRef.current && 
      isVisible
    ) {
      const container = containerRef.current
      const containerHeight = container.scrollHeight
      const viewportHeight = container.clientHeight
      
      // 現在時刻の位置を計算
      const targetScrollTop = (currentTimePosition / 100) * containerHeight - viewportHeight / 2
      
      // スムーズスクロール
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      })
      
      hasScrolledToCurrentTime.current = true
    }
  }, [containerRef, currentTimePosition, isVisible])

  // 現在時刻の表示フォーマット（utils/timezone.tsの関数を使用）

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{ top: `${currentTimePosition}%` }}
    >
      {/* 現在時刻ライン */}
      <div className="relative">
        {/* 時刻表示ドット */}
        <div className="absolute -left-1 -top-2 w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
        
        {/* 現在時刻ライン */}
        <div className="h-2 bg-red-500 shadow-sm"></div>
        
        {/* 時刻テキスト */}
        <div className="absolute -top-6 left-4">
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
            {formatCurrentTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  )
}