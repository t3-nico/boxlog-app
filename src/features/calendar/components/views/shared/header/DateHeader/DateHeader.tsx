'use client'

import React from 'react'
import { format, isToday, isWeekend } from 'date-fns'
import { cn } from '@/lib/utils'
import type { DateHeaderProps } from './DateHeader.types'

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
        'text-center',
        today && 'text-primary font-semibold',
        isSelected && 'bg-primary/10 rounded-md',
        weekend && !today && 'text-muted-foreground',
        onClick && 'cursor-pointer',
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
          <div className={cn(
            'text-xs font-medium',
            today ? 'text-primary' : 'text-muted-foreground'
          )}>
            {dayName}
          </div>
        )}
        
        <div className={cn(
          'text-lg font-medium',
          today && 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center'
        )}>
          {dateString}
        </div>
      </div>
    </div>
  )
}