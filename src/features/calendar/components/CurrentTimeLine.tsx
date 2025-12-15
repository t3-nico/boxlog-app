/**
 * 現在時刻線コンポーネント
 */

'use client'

import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

const currentTimeLineStyles = {
  container: 'absolute z-30 pointer-events-none w-full',
  label:
    'absolute bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-md shadow-sm top-[-11px] left-0',
  dot: 'absolute w-2.5 h-2.5 bg-primary rounded-full top-[-4px] shadow-sm',
  line: 'absolute h-[2px] bg-primary shadow-sm',
  // 他の日用（薄い表示）
  lineFaded: 'absolute h-[1px] bg-primary/30',
} as const

interface CurrentTimeLineProps {
  hourHeight: number
  displayDates: Date[]
  timeColumnWidth?: number
  /** 他の日にも薄い線を表示するか（デフォルト: true） */
  showOnOtherDays?: boolean
}

export const CurrentTimeLine = ({
  hourHeight,
  displayDates,
  timeColumnWidth = 0,
  showOnOtherDays = true,
}: CurrentTimeLineProps) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // 現在時刻を1分ごとに更新
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date())
    updateTime() // 初回実行

    const interval = setInterval(updateTime, 60000) // 1分ごと
    return () => clearInterval(interval)
  }, [])

  // 今日のインデックスを取得
  const todayIndex = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return displayDates.findIndex((date) => {
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

  // 今日が含まれている場合のメインライン
  const hasToday = todayIndex !== -1

  // 他の日に線を表示するか（今日がない場合または showOnOtherDays が true の場合）
  const showFadedLine = showOnOtherDays && displayDates.length > 0

  // 何も表示しない場合
  if (!hasToday && !showFadedLine) {
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
      {/* 時刻ラベル - 今日が含まれている場合のみ表示 */}
      {hasToday && <div className={cn(currentTimeLineStyles.label)}>{timeString}</div>}

      {/* 今日の赤い点 */}
      {hasToday && (
        <div
          className={cn(currentTimeLineStyles.dot)}
          style={{
            left: `${timeColumnWidth}px`,
          }}
        />
      )}

      {/* 今日の赤い線 - 時間列の右から画面端まで */}
      {hasToday && (
        <div
          className={cn(currentTimeLineStyles.line)}
          style={{
            left: `${timeColumnWidth}px`,
            right: 0,
            width: `calc(100% - ${timeColumnWidth}px)`,
          }}
        />
      )}

      {/* 他の日の薄い線（今日がない場合） */}
      {!hasToday && showFadedLine && (
        <div
          className={cn(currentTimeLineStyles.lineFaded)}
          style={{
            left: `${timeColumnWidth}px`,
            right: 0,
            width: `calc(100% - ${timeColumnWidth}px)`,
          }}
        />
      )}
    </div>
  )
}

/**
 * 列ごとの現在時刻線（複数日表示で各列に個別表示する場合に使用）
 */
interface CurrentTimeLineForColumnProps {
  hourHeight: number
  /** この列の日付 */
  date: Date
  /** 他の日でも薄く表示するか */
  showOnOtherDays?: boolean
}

export const CurrentTimeLineForColumn = ({
  hourHeight,
  date,
  showOnOtherDays = true,
}: CurrentTimeLineForColumnProps) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // 現在時刻を1分ごとに更新
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date())
    updateTime() // 初回実行

    const interval = setInterval(updateTime, 60000) // 1分ごと
    return () => clearInterval(interval)
  }, [])

  // 今日かどうかをチェック
  const isToday = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }, [date])

  // 現在時刻のY座標を計算
  const topPosition = useMemo(() => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / 60) * hourHeight
  }, [currentTime, hourHeight])

  // 今日でない場合で、他の日に表示しない設定なら非表示
  if (!isToday && !showOnOtherDays) {
    return null
  }

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-30"
      style={{
        top: `${topPosition}px`,
      }}
    >
      {/* 今日の場合：赤い点と濃い線 */}
      {isToday && (
        <>
          <div
            className="bg-primary border-background absolute rounded-full border-2 shadow-sm"
            style={{
              left: '-4px',
              top: '-4px',
              width: '10px',
              height: '10px',
            }}
          />
          <div className="bg-primary h-0.5 w-full shadow-sm" />
        </>
      )}

      {/* 他の日の場合：薄い線のみ */}
      {!isToday && showOnOtherDays && <div className="bg-primary/30 h-px w-full" />}
    </div>
  )
}
