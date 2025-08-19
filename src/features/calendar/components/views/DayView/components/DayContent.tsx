'use client'

import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { EventBlock } from '../../shared'
import type { DayContentProps } from '../DayView.types'

const HOUR_HEIGHT = 72 // 1時間の高さ（px）

export function DayContent({
  date,
  events,
  eventStyles,
  onEventClick,
  onEmptyClick,
  onEventUpdate,
  className
}: DayContentProps) {
  
  // 空白クリックハンドラー
  const handleEmptyClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onEmptyClick) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    
    // クリック位置から時刻を計算
    const hourDecimal = clickY / HOUR_HEIGHT
    const hour = Math.floor(hourDecimal)
    const minute = Math.round((hourDecimal - hour) * 60 / 15) * 15 // 15分単位に丸める
    
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    onEmptyClick(date, timeString)
  }, [date, onEmptyClick])
  
  // イベントクリックハンドラー
  const handleEventClick = useCallback((event: any) => {
    onEventClick?.(event)
  }, [onEventClick])
  
  // 時間グリッドの生成
  const timeGrid = Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      className="relative border-b border-border/30"
      style={{ height: HOUR_HEIGHT }}
    >
      {/* 15分間隔のサブグリッド */}
      <div className="absolute inset-0">
        {[15, 30, 45].map(minute => (
          <div
            key={minute}
            className="absolute w-full border-b border-border/10"
            style={{ top: `${(minute / 60) * HOUR_HEIGHT}px` }}
          />
        ))}
      </div>
      
      {/* 30分線を少し濃く */}
      <div
        className="absolute w-full border-b border-border/20"
        style={{ top: `${HOUR_HEIGHT / 2}px` }}
      />
    </div>
  ))
  
  return (
    <div className={cn('relative flex-1 bg-background', className)}>
      {/* クリック可能な背景グリッド */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleEmptyClick}
        style={{ height: 24 * HOUR_HEIGHT }}
      >
        {timeGrid}
      </div>
      
      {/* イベント表示エリア */}
      <div className="relative" style={{ height: 24 * HOUR_HEIGHT }}>
        {events.map(event => {
          const style = eventStyles[event.id]
          if (!style) return null
          
          return (
            <div
              key={event.id}
              style={style}
              className="absolute"
            >
              <EventBlock
                event={event}
                onClick={() => handleEventClick(event)}
                showTime={true}
                showDuration={true}
                variant="day" // 日表示専用のバリアント
                className="h-full w-full cursor-pointer hover:shadow-md transition-shadow"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}