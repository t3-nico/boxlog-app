'use client'

import React from 'react'
import { isWeekend, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { HOUR_HEIGHT, BUSINESS_HOURS } from '../constants/grid-constants'

interface GridBackgroundProps {
  dates: Date[]
  startHour?: number
  endHour?: number
  gridInterval: 15 | 30 | 60
  showBusinessHours?: boolean
  showWeekends?: boolean
  className?: string
}

export function GridBackground({ 
  dates, 
  startHour = 0, 
  endHour = 24, 
  gridInterval,
  showBusinessHours = false,
  showWeekends = true,
  className
}: GridBackgroundProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const totalHeight = (endHour - startHour) * HOUR_HEIGHT
  
  const isBusinessHour = (hour: number) => {
    return hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end
  }
  
  return (
    <div 
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ height: totalHeight }}
    >
      {/* 縦線（日付の境界） */}
      <div className="absolute inset-0 flex">
        {dates.map((date, index) => (
          <div
            key={date.toISOString()}
            className="flex-1 border-r border-border last:border-r-0"
            style={{ height: totalHeight }}
          />
        ))}
      </div>
      
      {/* 横線（時間の境界 - 1時間毎のみ） */}
      <div className="absolute inset-0">
        {hours.map((hour, index) => (
          <div
            key={hour}
            className={cn(
              "absolute w-full border-t",
              hour === 0 ? "border-transparent" : "border-border"
            )}
            style={{ top: index * HOUR_HEIGHT }}
          />
        ))}
      </div>
      
    </div>
  )
}

// シンプルなグリッド背景（パフォーマンス重視）
interface SimpleGridBackgroundProps {
  dates: Date[]
  totalHeight: number
  gridInterval: 15 | 30 | 60
  className?: string
}

export function SimpleGridBackground({ 
  dates, 
  totalHeight, 
  gridInterval,
  className
}: SimpleGridBackgroundProps) {
  const intervalCount = Math.floor((24 * 60) / gridInterval)
  const intervalHeight = totalHeight / intervalCount
  
  return (
    <div 
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ height: totalHeight }}
    >
      {/* 縦線 */}
      <div className="absolute inset-0 flex">
        {dates.map((date, index) => (
          <div
            key={date.toISOString()}
            className="flex-1 border-r border-border last:border-r-0"
          />
        ))}
      </div>
      
      {/* 横線 */}
      <div className="absolute inset-0">
        {Array.from({ length: intervalCount }, (_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-full border-t",
              i % (60 / gridInterval) === 0 
                ? "border-border" 
                : "border-border/50 border-dashed"
            )}
            style={{ top: i * intervalHeight }}
          />
        ))}
      </div>
    </div>
  )
}

// 時間範囲のハイライト用
interface TimeRangeHighlightProps {
  startHour: number
  endHour: number
  dates: Date[]
  color?: string
  opacity?: number
  startHourOffset?: number
}

export function TimeRangeHighlight({
  startHour,
  endHour,
  dates,
  color = 'rgb(59 130 246)', // blue-500
  opacity = 0.1,
  startHourOffset = 0
}: TimeRangeHighlightProps) {
  const topPosition = (startHour - startHourOffset) * HOUR_HEIGHT
  const height = (endHour - startHour) * HOUR_HEIGHT
  
  return (
    <div 
      className="absolute inset-x-0 pointer-events-none"
      style={{ 
        top: topPosition,
        height,
        backgroundColor: color,
        opacity
      }}
    />
  )
}

// 現在時刻の背景ハイライト
interface CurrentTimeBackgroundProps {
  currentTime: Date
  dates: Date[]
  startHour?: number
  width?: number
}

export function CurrentTimeBackground({
  currentTime,
  dates,
  startHour = 0,
  width = 100
}: CurrentTimeBackgroundProps) {
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const topPosition = ((currentHour - startHour) * HOUR_HEIGHT) + (currentMinute * (HOUR_HEIGHT / 60))
  
  return (
    <div 
      className="absolute inset-x-0 bg-blue-100/50 dark:bg-blue-900/20 pointer-events-none"
      style={{ 
        top: topPosition - 1,
        height: 2,
        width: `${width}%`
      }}
    />
  )
}

// カスタムグリッド（特定の時間間隔用）
interface CustomGridProps {
  dates: Date[]
  timeSlots: { hour: number; minute: number; label?: string }[]
  totalHeight: number
  className?: string
}

export function CustomGrid({ 
  dates, 
  timeSlots, 
  totalHeight,
  className
}: CustomGridProps) {
  return (
    <div 
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ height: totalHeight }}
    >
      {/* 縦線 */}
      <div className="absolute inset-0 flex">
        {dates.map((date) => (
          <div
            key={date.toISOString()}
            className={cn(
              "flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0",
              isWeekend(date) && "bg-muted/50",
              isToday(date) && "bg-accent/30"
            )}
          />
        ))}
      </div>
      
      {/* カスタム時間線 */}
      <div className="absolute inset-0">
        {timeSlots.map((slot, index) => {
          const position = ((slot.hour * 60 + slot.minute) / (24 * 60)) * totalHeight
          
          return (
            <div
              key={`${slot.hour}-${slot.minute}`}
              className={cn(
                "absolute w-full border-t",
                slot.minute === 0 
                  ? "border-border" 
                  : "border-border/50 border-dashed"
              )}
              style={{ top: position }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ドラッグ中のドロップゾーン表示
interface DropZoneHighlightProps {
  dates: Date[]
  activeDate?: Date
  activeTimeSlot?: { hour: number; minute: number }
  startHour?: number
  className?: string
}

export function DropZoneHighlight({
  dates,
  activeDate,
  activeTimeSlot,
  startHour = 0,
  className
}: DropZoneHighlightProps) {
  if (!activeDate || !activeTimeSlot) return null
  
  const dateIndex = dates.findIndex(date => 
    date.toDateString() === activeDate.toDateString()
  )
  
  if (dateIndex === -1) return null
  
  const leftPosition = (dateIndex / dates.length) * 100
  const topPosition = ((activeTimeSlot.hour - startHour) * HOUR_HEIGHT) + 
                     (activeTimeSlot.minute * (HOUR_HEIGHT / 60))
  
  return (
    <div 
      className={cn(
        "absolute bg-accent/50 border-2 border-accent border-dashed pointer-events-none",
        className
      )}
      style={{ 
        left: `${leftPosition}%`,
        width: `${100 / dates.length}%`,
        top: topPosition,
        height: HOUR_HEIGHT
      }}
    />
  )
}