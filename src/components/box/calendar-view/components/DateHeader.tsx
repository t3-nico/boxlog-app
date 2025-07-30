'use client'

import React, { useEffect, useState } from 'react'
import { isToday, isWeekend, format } from 'date-fns'
import { cn } from '../utils/view-helpers'
import { formatShortWeekday } from '../utils/view-helpers'
import { getCalendarTimezoneLabel, useTimezoneChange } from '@/utils/timezone'

interface DateHeaderProps {
  dates: Date[]
  className?: string
  planRecordMode?: 'plan' | 'record' | 'both'
}

export function DateHeader({ dates, className = '', planRecordMode }: DateHeaderProps) {
  const [timezoneLabel, setTimezoneLabel] = useState(getCalendarTimezoneLabel())
  
  // タイムゾーン変更をリッスン
  useEffect(() => {
    const cleanup = useTimezoneChange(() => {
      setTimezoneLabel(getCalendarTimezoneLabel())
    })
    return cleanup
  }, [])
  
  return (
    <div className={cn("flex-shrink-0 bg-white dark:bg-gray-900", className)}>
      <div className="flex">
        {/* タイムゾーン表示エリア */}
        <div className="w-16 flex-shrink-0 bg-white dark:bg-gray-900 flex items-end justify-center pb-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center px-1">
            {timezoneLabel}
          </div>
        </div>
        
        {/* 日付ヘッダー */}
        {dates.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "flex-1 px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative",
              isWeekend(day) && "bg-gray-50/50 dark:bg-gray-800/50"
            )}
          >
            
            {/* 曜日 */}
            <div className={cn(
              "text-xs font-medium uppercase tracking-wide mb-1",
              isToday(day) 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-gray-600 dark:text-gray-400"
            )}>
              {formatShortWeekday(day)}
            </div>
            
            {/* 日付 */}
            <div className={cn(
              "text-lg font-semibold",
              isToday(day) 
                ? "bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                : "text-gray-900 dark:text-white"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}