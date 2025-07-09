'use client'

import React from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { HEADER_HEIGHT, TIME_LABEL_WIDTH, GRID_COLORS } from '../constants/grid-constants'

interface DateHeaderProps {
  dates: Date[]
  scrollLeft?: number
  onDateClick?: (date: Date) => void
}

export function DateHeader({ dates, scrollLeft = 0, onDateClick }: DateHeaderProps) {
  return (
    <div className="relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-20">
      <div className="flex" style={{ height: HEADER_HEIGHT }}>
        {/* 時間軸ラベル領域（固定） */}
        <div 
          className="shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
          style={{ width: TIME_LABEL_WIDTH }}
        />
        
        {/* 日付ヘッダー（スクロール対応） */}
        <div
          className="flex-1 flex overflow-hidden"
          style={{ transform: `translateX(-${scrollLeft}px)` }}
        >
          {dates.map((date, index) => (
            <div
              key={date.toISOString()}
              onClick={() => onDateClick?.(date)}
              className={cn(
                "flex-1 flex flex-col justify-center items-center cursor-pointer",
                "transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800",
                "border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                isToday(date) && "bg-blue-50 dark:bg-blue-900/20",
                isWeekend(date) && "bg-gray-50/50 dark:bg-gray-800/20"
              )}
            >
              {/* 曜日 */}
              <div className={cn(
                "text-xs font-medium uppercase tracking-wide mb-1",
                isToday(date) 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400"
              )}>
                {format(date, 'E', { locale: ja })}
              </div>
              
              {/* 日付 */}
              <div className={cn(
                "text-xl font-semibold",
                isToday(date) 
                  ? "text-blue-600 dark:text-blue-400 bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  : "text-gray-900 dark:text-white"
              )}>
                {format(date, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 単一日付用のコンパクトヘッダー
interface CompactDateHeaderProps {
  date: Date
  onDateClick?: (date: Date) => void
}

export function CompactDateHeader({ date, onDateClick }: CompactDateHeaderProps) {
  return (
    <div
      onClick={() => onDateClick?.(date)}
      className={cn(
        "flex items-center justify-center py-2 px-4 cursor-pointer",
        "transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800",
        "border-b border-gray-200 dark:border-gray-700",
        isToday(date) && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      <div className="text-center">
        <div className={cn(
          "text-xs font-medium uppercase tracking-wide mb-1",
          isToday(date) 
            ? "text-blue-600 dark:text-blue-400" 
            : "text-gray-600 dark:text-gray-400"
        )}>
          {format(date, 'E', { locale: ja })}
        </div>
        <div className={cn(
          "text-lg font-semibold",
          isToday(date) 
            ? "text-blue-600 dark:text-blue-400" 
            : "text-gray-900 dark:text-white"
        )}>
          {format(date, 'M/d')}
        </div>
      </div>
    </div>
  )
}

// 週表示用のヘッダー
interface WeekHeaderProps {
  dates: Date[]
  scrollLeft?: number
  showTaskCount?: boolean
  taskCounts?: Record<string, number>
  onDateClick?: (date: Date) => void
}

export function WeekHeader({ 
  dates, 
  scrollLeft = 0, 
  showTaskCount = false, 
  taskCounts = {},
  onDateClick 
}: WeekHeaderProps) {
  return (
    <div className="relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-20">
      <div className="flex" style={{ height: HEADER_HEIGHT }}>
        {/* 時間軸ラベル領域（固定） */}
        <div 
          className="shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
          style={{ width: TIME_LABEL_WIDTH }}
        />
        
        {/* 日付ヘッダー（スクロール対応） */}
        <div
          className="flex-1 flex overflow-hidden"
          style={{ transform: `translateX(-${scrollLeft}px)` }}
        >
          {dates.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd')
            const taskCount = taskCounts[dateKey] || 0
            
            return (
              <div
                key={date.toISOString()}
                onClick={() => onDateClick?.(date)}
                className={cn(
                  "flex-1 flex flex-col justify-center items-center cursor-pointer",
                  "transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800",
                  "border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                  isToday(date) && "bg-blue-50 dark:bg-blue-900/20",
                  isWeekend(date) && "bg-gray-50/50 dark:bg-gray-800/20"
                )}
              >
                {/* 曜日 */}
                <div className={cn(
                  "text-xs font-medium uppercase tracking-wide",
                  isToday(date) 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {format(date, 'E', { locale: ja })}
                </div>
                
                {/* 日付 */}
                <div className={cn(
                  "text-lg font-semibold",
                  isToday(date) 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-600 dark:bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                    : "text-gray-900 dark:text-white"
                )}>
                  {format(date, 'd')}
                </div>
                
                {/* タスク数（オプション） */}
                {showTaskCount && taskCount > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {taskCount}件
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}