'use client'

import React from 'react'
import { isToday, isWeekend, format } from 'date-fns'
import { cn } from '../utils/view-helpers'
import { formatShortWeekday } from '../utils/view-helpers'

interface DateHeaderProps {
  dates: Date[]
  className?: string
  planRecordMode?: 'plan' | 'record' | 'both'
}

export function DateHeader({ dates, className = '', planRecordMode }: DateHeaderProps) {
  return (
    <div className={cn("flex-shrink-0 bg-white dark:bg-gray-900", className)}>
      <div className="flex">
        {/* 時間軸のスペース */}
        <div className="w-16 flex-shrink-0 bg-white dark:bg-gray-900"></div>
        
        {/* 日付ヘッダー */}
        {dates.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "flex-1 px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative",
              isToday(day) && "bg-blue-50 dark:bg-blue-900/20",
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