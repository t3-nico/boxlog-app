/**
 * 現在時刻線コンポーネント
 */

'use client'

import React, { memo } from 'react'
import { useCurrentTime } from '../../hooks/useCurrentTime'
import { timeToPixels } from '../../utils/gridCalculator'
import { HOUR_HEIGHT, CURRENT_TIME_LINE_COLOR, CURRENT_TIME_DOT_SIZE, Z_INDEX } from '../../constants/grid.constants'
import type { CurrentTimeLineProps } from '../../types/grid.types'

export const CurrentTimeLine = memo<CurrentTimeLineProps>(function CurrentTimeLine({
  hourHeight = HOUR_HEIGHT,
  timeColumnWidth = 60,
  containerWidth = 800,
  className = '',
  showDot = true,
  updateInterval = 60000 // 1分間隔
}) {
  const currentTime = useCurrentTime({ updateInterval })
  
  // 現在時刻のY座標を計算
  const topPosition = timeToPixels(currentTime, hourHeight)
  
  // 今日かどうかを判定（今日でなければ表示しない）
  const isToday = new Date().toDateString() === currentTime.toDateString()
  
  if (!isToday) {
    return null
  }
  
  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${className}`}
      style={{
        top: `${topPosition}px`,
        zIndex: Z_INDEX.CURRENT_TIME
      }}
    >
      {/* 時間列のドット */}
      {showDot && (
        <div
          className={`absolute ${CURRENT_TIME_LINE_COLOR} rounded-full border-2 border-white dark:border-gray-900`}
          style={{
            left: `${timeColumnWidth - CURRENT_TIME_DOT_SIZE / 2}px`,
            top: `${-CURRENT_TIME_DOT_SIZE / 2}px`,
            width: `${CURRENT_TIME_DOT_SIZE}px`,
            height: `${CURRENT_TIME_DOT_SIZE}px`
          }}
        />
      )}
      
      {/* 時刻線 */}
      <div
        className={`${CURRENT_TIME_LINE_COLOR} h-0.5`}
        style={{
          marginLeft: `${timeColumnWidth}px`,
          width: `${containerWidth - timeColumnWidth}px`
        }}
      />
      
      {/* 現在時刻ラベル（オプション） */}
      <div
        className="absolute text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 px-1 rounded"
        style={{
          left: `${timeColumnWidth + 4}px`,
          top: `-10px`
        }}
      >
        {currentTime.toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })}
      </div>
    </div>
  )
})

/**
 * 列専用の現在時刻線（DayColumn内で使用）
 */
export const CurrentTimeLineForColumn = memo<{
  hourHeight?: number
  showDot?: boolean
  className?: string
}>(function CurrentTimeLineForColumn({
  hourHeight = HOUR_HEIGHT,
  showDot = false,
  className = ''
}) {
  const currentTime = useCurrentTime({ updateInterval: 60000 })
  
  // 現在時刻のY座標を計算
  const topPosition = timeToPixels(currentTime, hourHeight)
  
  // 今日かどうかを判定
  const isToday = new Date().toDateString() === currentTime.toDateString()
  
  if (!isToday) {
    return null
  }
  
  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${className}`}
      style={{
        top: `${topPosition}px`,
        zIndex: Z_INDEX.CURRENT_TIME
      }}
    >
      {/* ドット（列の左端） */}
      {showDot && (
        <div
          className={`absolute ${CURRENT_TIME_LINE_COLOR} rounded-full border-2 border-white dark:border-gray-900`}
          style={{
            left: `${-CURRENT_TIME_DOT_SIZE / 2}px`,
            top: `${-CURRENT_TIME_DOT_SIZE / 2}px`,
            width: `${CURRENT_TIME_DOT_SIZE}px`,
            height: `${CURRENT_TIME_DOT_SIZE}px`
          }}
        />
      )}
      
      {/* 時刻線 */}
      <div className={`${CURRENT_TIME_LINE_COLOR} h-0.5 w-full`} />
    </div>
  )
})