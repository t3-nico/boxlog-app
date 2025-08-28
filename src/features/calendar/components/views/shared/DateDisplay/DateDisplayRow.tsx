'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { DateDisplay } from './DateDisplay'
import type { DateDisplayRowProps } from './DateDisplay.types'

export function DateDisplayRow({
  dates,
  className,
  selectedDate,
  showDayNames = true,
  showMonthYear = false,
  dayNameFormat = 'short',
  dateFormat = 'd',
  onDateClick,
  onDateDoubleClick
}: DateDisplayRowProps) {
  return (
    <div className={cn(
      'flex bg-background',
      className
    )}>
      {dates.map((date, index) => (
        <DateDisplay
          key={date.toISOString()}
          date={date}
          className={cn(
            'flex-1',
            // 最後の日付以外は右ボーダーを表示
            index < dates.length - 1 && 'border-r border-neutral-900/20 dark:border-neutral-100/20'
          )}
          isSelected={selectedDate ? 
            date.toDateString() === selectedDate.toDateString() : 
            false
          }
          showDayName={showDayNames}
          showMonthYear={showMonthYear}
          dayNameFormat={dayNameFormat}
          dateFormat={dateFormat}
          onClick={onDateClick}
          onDoubleClick={onDateDoubleClick}
        />
      ))}
    </div>
  )
}