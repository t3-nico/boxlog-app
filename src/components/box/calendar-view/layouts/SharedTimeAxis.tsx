'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface SharedTimeAxisProps {
  /** 開始時間（24時間形式） */
  startHour?: number
  /** 終了時間（24時間形式） */
  endHour?: number
  /** グリッド間隔（分） */
  gridInterval?: 15 | 30 | 60
  /** 営業時間を表示するか */
  showBusinessHours?: boolean
  /** 営業時間の設定 */
  businessHours?: { start: number; end: number }
  /** 現在時刻を表示するか */
  showCurrentTime?: boolean
  /** 追加のクラス名 */
  className?: string
}

const HOUR_HEIGHT = 60 // 1時間あたりの高さ（px）

export function SharedTimeAxis({
  startHour = 0,
  endHour = 24,
  gridInterval = 15,
  showBusinessHours = false,
  businessHours = { start: 9, end: 18 },
  showCurrentTime = false,
  className
}: SharedTimeAxisProps) {
  
  // 時間スロットの生成
  const timeSlots = useMemo(() => {
    const slots = []
    const totalMinutes = (endHour - startHour) * 60
    const slotCount = totalMinutes / gridInterval
    
    for (let i = 0; i <= slotCount; i++) {
      const minutes = startHour * 60 + i * gridInterval
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      
      // 24時間を超える場合は翌日として処理
      const displayHours = hours % 24
      
      slots.push({
        time: `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
        hours: displayHours,
        minutes: mins,
        isMainHour: mins === 0,
        isBusinessHour: showBusinessHours && displayHours >= businessHours.start && displayHours < businessHours.end
      })
    }
    
    return slots
  }, [startHour, endHour, gridInterval, showBusinessHours, businessHours])

  // 現在時刻の位置計算
  const currentTimePosition = useMemo(() => {
    if (!showCurrentTime) return null
    
    const now = new Date()
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const totalCurrentMinutes = currentHours * 60 + currentMinutes
    const startMinutes = startHour * 60
    const endMinutes = endHour * 60
    
    if (totalCurrentMinutes < startMinutes || totalCurrentMinutes > endMinutes) {
      return null
    }
    
    const relativeMinutes = totalCurrentMinutes - startMinutes
    const position = (relativeMinutes / 60) * HOUR_HEIGHT
    
    return {
      top: position,
      time: `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`
    }
  }, [showCurrentTime, startHour, endHour])

  return (
    <div className={cn("w-16 flex-shrink-0 bg-background border-r border-border relative", className)}>
      {/* 時間ラベル */}
      {timeSlots.map((slot, index) => {
        if (!slot.isMainHour && gridInterval < 60) {
          return null // メイン時刻以外は15分・30分間隔では非表示
        }
        
        return (
          <div
            key={`${slot.hours}-${slot.minutes}`}
            className="absolute right-2 transform -translate-y-1/2 text-xs text-muted-foreground"
            style={{
              top: `${(index * gridInterval / 60) * HOUR_HEIGHT}px`
            }}
          >
            {slot.isMainHour ? slot.time : ''}
          </div>
        )
      })}

      {/* 営業時間のハイライト */}
      {showBusinessHours && (
        <div
          className="absolute left-0 w-2 bg-[var(--color-primary-200)] opacity-50"
          style={{
            top: `${((businessHours.start - startHour) * 60 / 60) * HOUR_HEIGHT}px`,
            height: `${((businessHours.end - businessHours.start) * 60 / 60) * HOUR_HEIGHT}px`
          }}
        />
      )}

      {/* 現在時刻インジケーター */}
      {currentTimePosition && (
        <div
          className="absolute left-0 right-0 z-30"
          style={{ top: `${currentTimePosition.top}px` }}
        >
          {/* 時刻ラベル */}
          <div className="absolute right-2 transform -translate-y-1/2 text-xs font-medium text-[var(--color-error-600)] bg-background px-1 rounded">
            {currentTimePosition.time}
          </div>
          {/* ドット */}
          <div className="absolute left-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* グリッド線（左端のマーカー） */}
      {timeSlots.map((slot, index) => (
        <div
          key={`grid-${slot.hours}-${slot.minutes}`}
          className={cn(
            "absolute right-0 w-2 border-t",
            slot.isMainHour 
              ? "border-border" 
              : "border-border/50"
          )}
          style={{
            top: `${(index * gridInterval / 60) * HOUR_HEIGHT}px`
          }}
        />
      ))}
    </div>
  )
}