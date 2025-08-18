'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTimeGrid } from '../../../shared/hooks/useTimeGrid'
import type { TimeGridConfig } from './types'

interface TimeColumnProps extends TimeGridConfig {
  className?: string
  width?: number
  highlightCurrentTime?: boolean
}

/**
 * 時間表示列
 * サイドに表示される時間軸ラベル列（0:00-23:00）
 * 固定幅で、スクロール時も固定表示（sticky）
 */
export function TimeColumn({
  startHour = 0,
  endHour = 24,
  hourHeight = 60,
  className,
  width = 60,
  highlightCurrentTime = true
}: TimeColumnProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { timeSlots } = useTimeGrid({ startHour, endHour, hourHeight })

  // 現在時刻の更新（1分ごと）
  useEffect(() => {
    if (!highlightCurrentTime) return

    const updateTime = () => setCurrentTime(new Date())
    updateTime() // 初回実行
    
    const interval = setInterval(updateTime, 60000) // 1分ごと
    return () => clearInterval(interval)
  }, [highlightCurrentTime])

  const isCurrentHour = (hour: number): boolean => {
    if (!highlightCurrentTime) return false
    return currentTime.getHours() === hour
  }

  return (
    <div 
      className={cn(
        'flex-shrink-0 relative bg-background border-r border-border sticky left-0 z-10',
        className
      )}
      style={{ 
        width: `${width}px`,
        height: `${(endHour - startHour) * hourHeight}px`
      }}
    >
      {timeSlots.map((slot) => (
        <div
          key={slot.hour}
          className={cn(
            'absolute flex items-start justify-end pr-2 pt-1 text-xs transition-colors',
            isCurrentHour(slot.hour)
              ? 'text-primary font-semibold bg-primary/5'
              : 'text-muted-foreground'
          )}
          style={{
            top: `${slot.position}px`,
            height: `${hourHeight}px`,
            width: '100%'
          }}
        >
          {/* 時刻ラベル */}
          <div className="leading-none">
            {slot.time}
          </div>
          
          {/* 現在時刻の詳細表示 */}
          {isCurrentHour(slot.hour) && (
            <div className="absolute -right-1 top-1/2 -translate-y-1/2">
              <div className="text-xs text-primary font-medium bg-primary/10 px-1 py-0.5 rounded whitespace-nowrap">
                {currentTime.getHours().toString().padStart(2, '0')}:
                {currentTime.getMinutes().toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* 現在時刻の正確な位置表示 */}
      {highlightCurrentTime && (
        <div
          className="absolute right-0 w-2 h-0.5 bg-primary z-20"
          style={{
            top: `${(currentTime.getHours() + currentTime.getMinutes() / 60 - startHour) * hourHeight}px`
          }}
        />
      )}
    </div>
  )
}