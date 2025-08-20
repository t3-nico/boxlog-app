'use client'

import { format, getWeek } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateRangeDisplayProps {
  date: Date
  endDate?: Date
  viewType?: string
  showWeekNumber?: boolean
  formatPattern?: string
  className?: string
  weekBadgeClassName?: string
}

/**
 * 日付範囲表示
 * 単一日付または期間を表示し、オプションで週番号も表示
 */
export function DateRangeDisplay({
  date,
  endDate,
  viewType,
  showWeekNumber = true,
  formatPattern = 'MMMM yyyy',
  className,
  weekBadgeClassName
}: DateRangeDisplayProps) {
  const weekNumber = getWeek(date, { weekStartsOn: 1 })
  
  // 期間表示の場合
  if (endDate && date.getTime() !== endDate.getTime()) {
    const sameMonth = date.getMonth() === endDate.getMonth()
    const sameYear = date.getFullYear() === endDate.getFullYear()
    
    let rangeText = ''
    if (sameYear && sameMonth) {
      // 同月の場合: "1-7 January 2025"
      rangeText = `${format(date, 'd')}-${format(endDate, 'd')} ${format(date, 'MMMM yyyy')}`
    } else if (sameYear) {
      // 同年異月の場合: "30 Dec - 5 Jan 2025"
      rangeText = `${format(date, 'd MMM')} - ${format(endDate, 'd MMM yyyy')}`
    } else {
      // 異年の場合: "30 Dec 2024 - 5 Jan 2025"
      rangeText = `${format(date, 'd MMM yyyy')} - ${format(endDate, 'd MMM yyyy')}`
    }
    
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <h1 className="text-xl font-semibold">
          {rangeText}
        </h1>
        {showWeekNumber && (
          <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />
        )}
      </div>
    )
  }
  
  // 単一日付表示
  const formattedDate = format(date, formatPattern)
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <h1 className="text-xl font-semibold">
        {formattedDate}
      </h1>
      {showWeekNumber && (
        <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />
      )}
    </div>
  )
}

/**
 * 週番号バッジ
 */
function WeekBadge({ 
  weekNumber, 
  className 
}: { 
  weekNumber: number
  className?: string 
}) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1',
      'rounded-full text-xs font-medium',
      'border border-secondary text-secondary-foreground',
      'bg-transparent',
      className
    )}>
      week{weekNumber}
    </span>
  )
}

/**
 * コンパクトな日付表示（モバイル用）
 */
export function CompactDateDisplay({
  date,
  showWeekNumber = false,
  className
}: Pick<DateRangeDisplayProps, 'date' | 'showWeekNumber' | 'className'>) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-base font-medium">
        {format(date, 'MMM d')}
      </span>
      {showWeekNumber && (
        <span className="text-xs text-muted-foreground">
          W{getWeek(date, { weekStartsOn: 1 })}
        </span>
      )}
    </div>
  )
}