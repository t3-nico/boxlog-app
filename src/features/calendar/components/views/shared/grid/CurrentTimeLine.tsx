'use client'

import React, { useState, useEffect } from 'react'
import { isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTimeGrid } from '../../../shared/hooks/useTimeGrid'
import type { TimeGridConfig } from './types'

interface CurrentTimeLineProps extends Partial<TimeGridConfig> {
  className?: string
  date?: Date              // 表示している日付
  showTimeLabel?: boolean  // 時刻ラベルを表示するか
  lineColor?: string       // ラインの色
  showDot?: boolean        // 左端の丸を表示するか
}

/**
 * 現在時刻ライン
 * 現在時刻を示す赤い線のコンポーネント
 * 1分ごとに位置更新し、時刻も表示
 */
export function CurrentTimeLine({
  startHour = 0,
  hourHeight = 60,
  className,
  date,
  showTimeLabel = true,
  lineColor = 'rgb(239 68 68)', // red-500
  showDot = true
}: CurrentTimeLineProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { getCurrentTimePosition } = useTimeGrid({ startHour, hourHeight })

  // 現在時刻の更新（1分ごと）
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date())
    updateTime() // 初回実行
    
    const interval = setInterval(updateTime, 60000) // 1分ごと
    return () => clearInterval(interval)
  }, [])

  // 指定された日付が今日でない場合は表示しない
  if (date && !isToday(date)) {
    return null
  }

  const position = getCurrentTimePosition()
  const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`

  // 時間範囲外の場合は表示しない
  const currentHour = currentTime.getHours()
  if (currentHour < startHour || currentHour >= (startHour + 24)) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute left-0 right-0 pointer-events-none z-30',
        className
      )}
      style={{
        top: `${position}px`,
        color: lineColor
      }}
    >
      {/* メインライン */}
      <div
        className="h-0.5 relative"
        style={{ backgroundColor: lineColor }}
      >
        {/* 左端の丸 */}
        {showDot && (
          <div
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: lineColor }}
          />
        )}
        
        {/* 時刻ラベル */}
        {showTimeLabel && (
          <div className="absolute -left-8 -top-2">
            <div
              className="text-xs font-medium px-1 py-0.5 rounded text-white"
              style={{ backgroundColor: lineColor }}
            >
              {timeString}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 複数列用の現在時刻ライン
 * 週表示など、複数の日付列がある場合に使用
 */
export function CurrentTimeLineForColumn({
  date,
  columnIndex,
  columnWidth,
  ...props
}: CurrentTimeLineProps & {
  columnIndex: number
  columnWidth: number
}) {
  if (!date || !isToday(date)) {
    return null
  }

  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{
        left: `${columnIndex * columnWidth}%`,
        width: `${columnWidth}%`
      }}
    >
      <CurrentTimeLine date={date} {...props} />
    </div>
  )
}