'use client'

import React from 'react'
import { format, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DayDateHeaderProps {
  date: Date
  timezone?: string
  className?: string
}

/**
 * DayView専用の日付ヘッダー
 * シンプルな日付表示
 */
export function DayDateHeader({ 
  date, 
  timezone,
  className 
}: DayDateHeaderProps) {
  const today = isToday(date)
  
  return (
    <div className={cn(
      'flex items-center justify-between px-6 py-4 border-b bg-background',
      className
    )}>
      <div className="flex items-center gap-4">
        {/* 日付表示 */}
        <div className="flex items-baseline gap-2">
          <h1 className={cn(
            'text-2xl font-semibold',
            today && 'text-blue-600 dark:text-blue-400'
          )}>
            {format(date, 'yyyy年M月d日', { locale: ja })}
          </h1>
          <span className={cn(
            'text-lg text-muted-foreground',
            today && 'text-blue-600/70 dark:text-blue-400/70'
          )}>
            {format(date, 'EEEE', { locale: ja })}
          </span>
        </div>
        
        {/* 今日のインジケーター */}
        {today && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
            今日
          </span>
        )}
      </div>
      
      {/* タイムゾーン表示 */}
      {timezone && (
        <div className="text-sm text-muted-foreground">
          {timezone}
        </div>
      )}
    </div>
  )
}

export default DayDateHeader