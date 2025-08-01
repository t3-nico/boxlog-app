'use client'

import React, { useEffect, useState } from 'react'
import { isToday, isWeekend, format } from 'date-fns'
import { cn } from '../utils/view-helpers'
import { formatShortWeekday } from '../utils/view-helpers'
import { getCalendarTimezoneLabel, listenToTimezoneChange } from '@/utils/timezone'

interface DateHeaderProps {
  dates: Date[]
  className?: string
  planRecordMode?: 'plan' | 'record' | 'both'
}

export function DateHeader({ dates, className = '', planRecordMode }: DateHeaderProps) {
  const [timezoneLabel, setTimezoneLabel] = useState(getCalendarTimezoneLabel())
  
  // タイムゾーン変更をリッスン
  useEffect(() => {
    const cleanup = listenToTimezoneChange(() => {
      setTimezoneLabel(getCalendarTimezoneLabel())
    })
    return cleanup
  }, [setTimezoneLabel])
  
  return (
    <div className={cn("flex-shrink-0 bg-background", className)}>
      <div className="flex">
        {/* 時間軸のスペース（タイムゾーン表示付き） */}
        <div className="w-16 flex-shrink-0 bg-background h-[72px] flex items-end justify-center pb-2">
          <div className="text-xs text-muted-foreground font-medium">
            {timezoneLabel}
          </div>
        </div>
        
        {/* 日付ヘッダー */}
        {dates.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "flex-1 px-2 py-3 text-center border-r border-border last:border-r-0 relative h-[72px] flex flex-col justify-center",
              isWeekend(day) && "bg-muted/50"
            )}
          >
            
            {/* 曜日 */}
            <div className={cn(
              "text-xs font-medium uppercase tracking-wide mb-1",
              isToday(day) 
                ? "text-accent-foreground" 
                : "text-muted-foreground"
            )}>
              {formatShortWeekday(day)}
            </div>
            
            {/* 日付 */}
            <div className={cn(
              "text-lg font-semibold",
              isToday(day) 
                ? "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                : "text-foreground"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}