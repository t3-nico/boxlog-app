/**
 * 現在時刻線コンポーネント
 */

'use client'

import React, { useMemo, useEffect, useState } from 'react'

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
      className="absolute z-30 pointer-events-none"
      style={{
        top: `${topPosition}px`,
        left: 0,  // 左端から開始
        right: 0, // 右端まで伸ばす
        width: '100%', // 明示的に100%幅を指定
      }}
    >
      {/* 時刻ラベル */}
      <div 
        className="absolute bg-red-500 text-white text-xs px-1 py-0.5 rounded"
        style={{
          top: '-10px',
          left: `${timeColumnWidth - 40}px`, // 時間列の位置に配置
          fontSize: '11px',
        }}
      >
        {timeString}
      </div>
      
      {/* 赤い点 */}
      <div 
        className="absolute w-2 h-2 bg-red-500 rounded-full"
        style={{
          top: '-3px', // 線の中央に配置
          left: `${timeColumnWidth}px`, // 時間列の右端
        }}
      />
      
      {/* 赤い線 - 時間列の右から画面端まで */}
      <div 
        className="absolute h-[2px] bg-red-500"
        style={{
          top: 0,
          left: `${timeColumnWidth}px`, // 時間列の幅分だけ左をオフセット
          right: 0, // 右端まで
          width: `calc(100% - ${timeColumnWidth}px)`, // 時間列を除いた幅
        }}
      />
    </div>
  )
}