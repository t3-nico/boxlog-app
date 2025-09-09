'use client'

import { format, getWeek } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { heading } from '@/config/theme/typography'
import { secondary, border } from '@/config/theme/colors'
import { MiniCalendarPopover } from '@/features/calendar/components/common'

interface DateRangeDisplayProps {
  date: Date
  endDate?: Date
  viewType?: string
  showWeekNumber?: boolean
  formatPattern?: string
  className?: string
  weekBadgeClassName?: string
  onDateSelect?: (date: Date) => void
  clickable?: boolean
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
  weekBadgeClassName,
  onDateSelect,
  clickable = false
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
    
    const dateContent = (
      <div className="flex items-center gap-2">
        <h2 className={cn(
          heading.h2,
          clickable && onDateSelect && 'cursor-pointer hover:text-primary transition-colors'
        )}>
          {rangeText}
        </h2>
        {clickable && onDateSelect && (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    )

    const content = (
      <div className={cn('flex items-center gap-2', className)}>
        {dateContent}
        {showWeekNumber && (
          <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />
        )}
      </div>
    )

    if (clickable && onDateSelect) {
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <MiniCalendarPopover
            selectedDate={date}
            onDateSelect={onDateSelect}
            align="start"
            side="bottom"
          >
            {dateContent}
          </MiniCalendarPopover>
          {showWeekNumber && (
            <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />
          )}
        </div>
      )
    }

    return content
  }
  
  // 単一日付表示
  const formattedDate = format(date, formatPattern)
  
  const singleDateContent = (
    <div className="flex items-center gap-2">
      <h2 className={cn(
        heading.h2,
        clickable && onDateSelect && 'cursor-pointer hover:text-primary transition-colors'
      )}>
        {formattedDate}
      </h2>
      {clickable && onDateSelect && (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  )

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      {singleDateContent}
      {showWeekNumber && (
        <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />
      )}
    </div>
  )

  if (clickable && onDateSelect) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <MiniCalendarPopover
          selectedDate={date}
          onDateSelect={onDateSelect}
          align="start"
          side="bottom"
        >
          {singleDateContent}
        </MiniCalendarPopover>
        {showWeekNumber && (
          <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />
        )}
      </div>
    )
  }

  return content
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
    <h6 className={cn(
      'inline-flex items-center px-2 py-1',
      'rounded-xs border',
      heading.h6,
      border.universal,
      secondary.text,
      className
    )}>
      week{weekNumber}
    </h6>
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