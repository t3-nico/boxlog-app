/**
 * 現在時刻線コンポーネント
 */

'use client'

import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

const currentTimeLineStyles = {
  container: 'absolute z-30 pointer-events-none w-full',
  label: 'absolute bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-md shadow-sm top-[-11px] left-0',
  dot: 'absolute w-2.5 h-2.5 bg-primary rounded-full top-[-4px] shadow-sm',
  line: 'absolute h-[2px] bg-primary shadow-sm',
} as const

interface CurrentTimeLineProps {
  hourHeight: number
  displayDates: Date[]
  timeColumnWidth?: number
}

export const CurrentTimeLine = ({ hourHeight, displayDates, timeColumnWidth = 0 }: CurrentTimeLineProps) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // 現在時刻を1分ごとに更新
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date())
    updateTime() // 初回実行

    const interval = setInterval(updateTime, 60000) // 1分ごと
    return () => clearInterval(interval)
  }, [])

  // 表示ロジック：displayDatesに今日が含まれているかチェック
  const shouldShowLine = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return displayDates.some((date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
  }, [displayDates])

  // 現在時刻のY座標を計算
  const topPosition = useMemo(() => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / 60) * hourHeight
  }, [currentTime, hourHeight])

  // 時刻文字列を生成
  const timeString = useMemo(() => {
    return currentTime.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }, [currentTime])

  // 今日が含まれていない場合は表示しない
  if (!shouldShowLine) {
    return null
  }

  return (
    <div
      className={cn(currentTimeLineStyles.container)}
      style={{
        top: `${topPosition}px`,
        left: 0,
        right: 0,
        width: '100%',
      }}
    >
      {/* 時刻ラベル - 左側の時刻列内に配置 */}
      <div className={cn(currentTimeLineStyles.label)}>{timeString}</div>

      {/* 赤い点 */}
      <div
        className={cn(currentTimeLineStyles.dot)}
        style={{
          left: `${timeColumnWidth}px`,
        }}
      />

      {/* 赤い線 - 時間列の右から画面端まで */}
      <div
        className={cn(currentTimeLineStyles.line)}
        style={{
          left: `${timeColumnWidth}px`,
          right: 0,
          width: `calc(100% - ${timeColumnWidth}px)`,
        }}
      />
    </div>
  )
}
