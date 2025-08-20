/**
 * 現在時刻線コンポーネント
 */

'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { currentTimeLineStyles } from '@/styles/themes/components'
import { cn } from '@/lib/utils'

interface CurrentTimeLineProps {
  hourHeight: number
  displayDates: Date[]
  timeColumnWidth?: number
}

export function CurrentTimeLine({
  hourHeight,
  displayDates,
  timeColumnWidth = 0
}: CurrentTimeLineProps) {
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
    // 1. 今日の日付を取得（時刻部分は無視）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 2. displayDates配列の各日付を今日と比較
    const hasToday = displayDates.some(date => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0) // 時刻部分は無視
      return d.getTime() === today.getTime()
    })
    
    // 3. デバッグログ出力
    console.log('🔍 CurrentTimeLine 表示判定:', {
      today: today.toDateString(),
      displayDates: displayDates.map(d => d.toDateString()),
      hasToday
    })
    
    return hasToday
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
      hour12: false 
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
        width: '100%'
      }}
    >
      {/* 時刻ラベル */}
      <div 
        className={cn(currentTimeLineStyles.label)}
        style={{
          left: `${timeColumnWidth - 40}px`
        }}
      >
        {timeString}
      </div>
      
      {/* 赤い点 */}
      <div 
        className={cn(currentTimeLineStyles.dot)}
        style={{
          left: `${timeColumnWidth}px`
        }}
      />
      
      {/* 赤い線 - 時間列の右から画面端まで */}
      <div 
        className={cn(currentTimeLineStyles.line)}
        style={{
          left: `${timeColumnWidth}px`,
          right: 0,
          width: `calc(100% - ${timeColumnWidth}px)`
        }}
      />
    </div>
  )
}