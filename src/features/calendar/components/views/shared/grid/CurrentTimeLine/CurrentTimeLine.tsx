/**
 * 現在時刻線コンポーネント - シンプル版
 */

'use client'

import { memo, useMemo } from 'react'

import { HOUR_HEIGHT, Z_INDEX } from '../../constants/grid.constants'
import { useCurrentTime } from '../../hooks/useCurrentTime'
import type { CurrentTimeLineProps } from '../../types/grid.types'
import { timeToPixels } from '../../utils/gridCalculator'

export const CurrentTimeLine = memo<CurrentTimeLineProps>(function CurrentTimeLine({
  hourHeight = HOUR_HEIGHT,
  timeColumnWidth = 64,
  containerWidth = 800,
  className = '',
  showDot = true,
  updateInterval = 60000,
  displayDates,
  // viewModeはpropsとして受け取るが使用しない（将来の拡張用）
  viewMode: _viewMode = 'day',
}) {
  const currentTime = useCurrentTime({ updateInterval })

  // 現在時刻のY座標を計算
  const topPosition = timeToPixels(currentTime, hourHeight)

  // 今日かどうかをチェック
  const shouldShow = useMemo(() => {
    if (!displayDates || displayDates.length === 0) {
      return true // displayDatesがない場合は表示
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return displayDates.some((date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
  }, [displayDates])

  // 今日の列位置を計算（複数日表示の場合）
  const columnInfo = useMemo(() => {
    if (!displayDates || displayDates.length <= 1) {
      // 単一日表示の場合は全幅
      return {
        left: timeColumnWidth,
        width: '100%',
      }
    }

    // 複数日表示の場合、今日の列を特定
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayIndex = displayDates.findIndex((date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })

    if (todayIndex === -1) {
      return null // 今日が見つからない場合
    }

    // 今日の列の位置とサイズを計算
    const availableWidth = containerWidth - timeColumnWidth
    const columnWidth = availableWidth / displayDates.length
    const left = timeColumnWidth + todayIndex * columnWidth

    return {
      left,
      width: columnWidth,
    }
  }, [displayDates, timeColumnWidth, containerWidth])

  // 今日が含まれていない場合は表示しない
  if (!shouldShow || !columnInfo) {
    return null
  }

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        top: `${topPosition}px`,
        left: `${columnInfo.left}px`,
        width: typeof columnInfo.width === 'string' ? columnInfo.width : `${columnInfo.width}px`,
        height: '2px',
        zIndex: Z_INDEX.CURRENT_TIME,
      }}
    >
      {/* 時刻線 */}
      <div
        className="bg-primary h-full w-full shadow-sm"
        style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.7) 100%)',
          boxShadow: '0 1px 3px rgba(239, 68, 68, 0.5)',
        }}
      />

      {/* ドット */}
      {showDot != null && (
        <div
          className="border-background bg-primary absolute rounded-full border-2 shadow-sm"
          style={{
            left: `-5px`,
            top: `-4px`,
            width: '10px',
            height: '10px',
          }}
        />
      )}
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
}>(function CurrentTimeLineForColumn({ hourHeight = HOUR_HEIGHT, showDot = false, className = '' }) {
  const currentTime = useCurrentTime({ updateInterval: 60000 })

  // 現在時刻のY座標を計算
  const topPosition = timeToPixels(currentTime, hourHeight)

  return (
    <div
      className={`pointer-events-none absolute right-0 left-0 ${className}`}
      style={{
        top: `${topPosition}px`,
        zIndex: Z_INDEX.CURRENT_TIME,
      }}
    >
      {/* ドット（列の左端） */}
      {showDot != null && (
        <div
          className="border-background bg-primary absolute rounded-full border-2 shadow-sm"
          style={{
            left: `-4px`,
            top: `-4px`,
            width: '8px',
            height: '8px',
          }}
        />
      )}

      {/* 時刻線 */}
      <div className="bg-primary h-0.5 w-full shadow-sm" />
    </div>
  )
})
