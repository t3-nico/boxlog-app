'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { HOUR_HEIGHT, TIME_LABEL_WIDTH, BUSINESS_HOURS } from '../constants/grid-constants'
import { formatTimeForDisplay } from '../utils/time-grid-helpers'
import { useFormattedTime } from '@/hooks/useFormattedTime'
import { ChronotypeIndicatorCompact, ChronotypeIndicator } from './ChronotypeIndicator'

interface TimeAxisLabelsProps {
  startHour?: number
  endHour?: number
  interval: 15 | 30 | 60
  showBusinessHours?: boolean
  className?: string
  planRecordMode?: 'plan' | 'record' | 'both'
}

export function TimeAxisLabels({ 
  startHour = 0, 
  endHour = 24, 
  interval,
  showBusinessHours = false,
  className,
  planRecordMode
}: TimeAxisLabelsProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const { formatHourLabel } = useFormattedTime()
  
  const isBusinessHour = (hour: number) => {
    return hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end
  }
  
  return (
    <div 
      className={cn(
        "shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative",
        className
      )}
      style={{ width: TIME_LABEL_WIDTH }}
    >
      {hours.map(hour => (
        <div
          key={hour}
          className={cn(
            "relative border-b border-gray-100 dark:border-gray-800 last:border-b-0",
            showBusinessHours && !isBusinessHour(hour) && "bg-gray-50/50 dark:bg-gray-800/20"
          )}
          style={{ height: HOUR_HEIGHT }}
        >
          {/* クロノタイプ縦線インジケーター（右端に表示） */}
          <ChronotypeIndicator hour={hour} className="z-0" />
          
          
          {/* 正時のラベルのみ表示 */}
          {hour > 0 && (
            <div className="absolute -top-2 right-2 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-1 z-10">
              {formatHourLabel(hour)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// コンパクト版（モバイル用）
interface CompactTimeAxisLabelsProps {
  startHour?: number
  endHour?: number
  interval: 15 | 30 | 60
  className?: string
}

export function CompactTimeAxisLabels({ 
  startHour = 0, 
  endHour = 24, 
  interval,
  className
}: CompactTimeAxisLabelsProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const { formatHourLabel } = useFormattedTime()
  
  return (
    <div 
      className={cn(
        "shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        className
      )}
      style={{ width: TIME_LABEL_WIDTH * 0.75 }}
    >
      {hours.map(hour => (
        <div
          key={hour}
          className="relative border-b border-gray-100 dark:border-gray-800 last:border-b-0"
          style={{ height: HOUR_HEIGHT }}
        >
          {/* 正時のラベルのみ表示 */}
          {hour > 0 && (
            <div className="absolute -top-2 right-1 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-1">
              {formatHourLabel(hour)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// 営業時間のみ表示版
interface BusinessHoursLabelsProps {
  interval: 15 | 30 | 60
  className?: string
}

export function BusinessHoursLabels({ 
  interval,
  className
}: BusinessHoursLabelsProps) {
  const hours = Array.from(
    { length: BUSINESS_HOURS.end - BUSINESS_HOURS.start }, 
    (_, i) => BUSINESS_HOURS.start + i
  )
  const { formatHourLabel } = useFormattedTime()
  
  return (
    <div 
      className={cn(
        "shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        className
      )}
      style={{ width: TIME_LABEL_WIDTH }}
    >
      {hours.map(hour => (
        <div
          key={hour}
          className="relative border-b border-gray-100 dark:border-gray-800 last:border-b-0"
          style={{ height: HOUR_HEIGHT }}
        >
          {/* 正時のラベルのみ表示 */}
          <div className="absolute -top-2 right-2 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-1">
            {formatHourLabel(hour)}
          </div>
        </div>
      ))}
    </div>
  )
}

// 時間ラベルのスタイル用ヘルパー
export function getTimeSlotStyle(hour: number, isBusinessHour: boolean) {
  const baseStyle = {
    height: HOUR_HEIGHT,
    borderBottom: '1px solid',
    borderColor: 'rgb(243 244 246)' // gray-100
  }
  
  if (!isBusinessHour) {
    return {
      ...baseStyle,
      backgroundColor: 'rgb(249 250 251)', // gray-50
      opacity: 0.7
    }
  }
  
  return baseStyle
}

// 現在時刻インジケーター
interface CurrentTimeIndicatorProps {
  currentHour: number
  currentMinute: number
  startHour?: number
}

export function CurrentTimeIndicator({ 
  currentHour, 
  currentMinute, 
  startHour = 0 
}: CurrentTimeIndicatorProps) {
  const topPosition = ((currentHour - startHour) * HOUR_HEIGHT) + (currentMinute * (HOUR_HEIGHT / 60))
  
  return (
    <div 
      className="absolute right-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2 z-10"
      style={{ top: topPosition }}
    />
  )
}

// 時間スロットのハイライト用
interface TimeSlotHighlightProps {
  hour: number
  duration: number
  startHour?: number
  color?: string
}

export function TimeSlotHighlight({ 
  hour, 
  duration, 
  startHour = 0, 
  color = 'rgb(59 130 246)' // blue-500
}: TimeSlotHighlightProps) {
  const topPosition = (hour - startHour) * HOUR_HEIGHT
  const height = duration * HOUR_HEIGHT
  
  return (
    <div 
      className="absolute left-0 w-2 bg-opacity-50 rounded-r"
      style={{ 
        top: topPosition,
        height,
        backgroundColor: color
      }}
    />
  )
}