'use client'

import React from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { cn } from '@/lib/utils'
import type { DateHeaderProps } from './DateHeader.types'
import { primary, secondary, selection } from '@/config/theme/colors'

export function DateHeader({
  date,
  className,
  isToday: todayProp,
  isSelected = false,
  showDayName = true,
  showMonthYear = true,
  dayNameFormat = 'short',
  dateFormat = 'd',
  onClick,
  onDoubleClick
}: DateHeaderProps) {
  const today = todayProp ?? isToday(date)
  const weekend = isWeekend(date)

  const handleClick = () => {
    onClick?.(date)
  }

  const handleDoubleClick = () => {
    onDoubleClick?.(date)
  }

  const dayName = showDayName 
    ? format(date, dayNameFormat === 'short' ? 'EEE' : dayNameFormat === 'long' ? 'EEEE' : 'EEEEE')
    : undefined

  const dateString = format(date, dateFormat)
  const monthYear = showMonthYear ? format(date, 'MMM yyyy') : undefined

  return (
    <div
      className={cn(
        'text-center py-2 px-1 transition-colors',
        // ホバー効果（当日以外のみ）
        onClick && !today && 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20',
        // クリック可能だが当日の場合
        onClick && today && 'cursor-pointer',
        // 選択状態（当日以外）
        isSelected && !today && `${selection.active} ${selection.text}`,
        // 週末（当日以外）
        weekend && !today && 'text-muted-foreground',
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {monthYear && (
        <div className="text-xs text-muted-foreground mb-1">
          {monthYear}
        </div>
      )}
      
      <div className="flex flex-col items-center">
        {dayName && (
          <div className="text-xs font-medium text-muted-foreground">
            {dayName}
          </div>
        )}
        
        <div className={cn(
          'text-lg font-medium w-8 h-8 rounded-full flex items-center justify-center',
          today && 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
        )}>
          {dateString}
        </div>
      </div>
    </div>
  )
}