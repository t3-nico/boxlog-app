'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useTimeGrid } from '../../../shared/hooks/useTimeGrid'
import type { TimeGridConfig } from './types'

interface TimeGridProps extends TimeGridConfig {
  className?: string
  children?: React.ReactNode
  onClick?: (hour: number, minute: number) => void
  onDoubleClick?: (hour: number, minute: number) => void
}

/**
 * 時間軸グリッド（共通）
 * 全ビューで共有される時間グリッドのベースコンポーネント
 * 24時間分の横線を生成し、スクロール可能なコンテナを提供
 */
export function TimeGrid({
  startHour = 0,
  endHour = 24,
  hourHeight = 60,
  interval = 60,
  className,
  children,
  onClick,
  onDoubleClick
}: TimeGridProps) {
  const { timeSlots, gridHeight } = useTimeGrid({
    startHour,
    endHour,
    hourHeight,
    interval
  })

  const handleSlotClick = (event: React.MouseEvent, hour: number) => {
    if (!onClick) return
    
    // クリック位置から分を計算
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeY = event.clientY - rect.top
    const minuteInHour = Math.floor((relativeY / hourHeight) * 60)
    const snappedMinute = Math.round(minuteInHour / 15) * 15 // 15分刻みでスナップ
    
    onClick(hour, snappedMinute)
  }

  const handleSlotDoubleClick = (event: React.MouseEvent, hour: number) => {
    if (!onDoubleClick) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeY = event.clientY - rect.top
    const minuteInHour = Math.floor((relativeY / hourHeight) * 60)
    const snappedMinute = Math.round(minuteInHour / 15) * 15
    
    onDoubleClick(hour, snappedMinute)
  }

  return (
    <div 
      className={cn(
        'relative bg-background overflow-y-auto',
        className
      )}
      style={{ height: `${gridHeight}px` }}
    >
      {/* 時間グリッドライン */}
      {timeSlots.map((slot) => (
        <div
          key={slot.hour}
          className="absolute w-full border-b border-border hover:bg-accent/20 cursor-pointer transition-colors"
          style={{
            top: `${slot.position}px`,
            height: `${hourHeight}px`
          }}
          onClick={(e) => handleSlotClick(e, slot.hour)}
          onDoubleClick={(e) => handleSlotDoubleClick(e, slot.hour)}
        >
          {/* 30分線 */}
          <div
            className="absolute w-full border-b border-border/30"
            style={{
              top: `${hourHeight / 2}px`,
              height: '1px'
            }}
          />
          
          {/* ホバー時のタイムスロット表示 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              {slot.time}
            </span>
          </div>
        </div>
      ))}
      
      {/* 子要素（イベントなど）を描画 */}
      {children}
    </div>
  )
}