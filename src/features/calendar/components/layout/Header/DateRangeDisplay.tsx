'use client'

import { format, getWeek } from 'date-fns'
import { ChevronDown } from 'lucide-react'

import { border, secondary } from '@/config/theme/colors'
import { heading } from '@/config/theme/typography'
import { MiniCalendarPopover } from '@/features/calendar/components/common'
import { cn } from '@/lib/utils'

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
 * 日付範囲のテキストを生成
 */
const generateRangeText = (date: Date, endDate: Date): string => {
  const sameMonth = date.getMonth() === endDate.getMonth()
  const sameYear = date.getFullYear() === endDate.getFullYear()

  if (sameYear && sameMonth) {
    // 同月の場合: "1-7 January 2025"
    return `${format(date, 'd')}-${format(endDate, 'd')} ${format(date, 'MMMM yyyy')}`
  } else if (sameYear) {
    // 同年異月の場合: "30 Dec - 5 Jan 2025"
    return `${format(date, 'd MMM')} - ${format(endDate, 'd MMM yyyy')}`
  } else {
    // 異年の場合: "30 Dec 2024 - 5 Jan 2025"
    return `${format(date, 'd MMM yyyy')} - ${format(endDate, 'd MMM yyyy')}`
  }
}

/**
 * 日付ヘッダーコンテンツを作成
 */
const createDateContent = (text: string, isClickable: boolean) => (
  <div className="flex items-center gap-2">
    <h2 className={cn(heading.h2, isClickable && 'hover:text-primary cursor-pointer transition-colors')}>{text}</h2>
    {isClickable && <ChevronDown className="text-muted-foreground h-4 w-4" />}
  </div>
)

/**
 * 静的な日付表示コンテンツを作成
 */
const createStaticContent = (
  dateContent: React.ReactNode,
  showWeekNumber: boolean,
  weekNumber: number,
  weekBadgeClassName?: string,
  className?: string
) => (
  <div className={cn('flex items-center gap-2', className)}>
    {dateContent}
    {showWeekNumber && <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />}
  </div>
)

/**
 * クリック可能な日付表示コンテンツを作成
 */
const createClickableContent = (
  dateContent: React.ReactNode,
  selectedDate: Date,
  onDateSelect: (date: Date) => void,
  showWeekNumber: boolean,
  weekNumber: number,
  weekBadgeClassName?: string,
  className?: string
) => (
  <div className={cn('flex items-center gap-2', className)}>
    <MiniCalendarPopover selectedDate={selectedDate} onDateSelect={onDateSelect} align="start" side="bottom">
      {dateContent}
    </MiniCalendarPopover>
    {showWeekNumber && <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />}
  </div>
)

/**
 * 日付範囲表示
 * 単一日付または期間を表示し、オプションで週番号も表示
 */
export const DateRangeDisplay = ({
  date,
  endDate,
  _viewType,
  showWeekNumber = true,
  formatPattern = 'MMMM yyyy',
  className,
  weekBadgeClassName,
  onDateSelect,
  clickable = false,
}: DateRangeDisplayProps) => {
  const weekNumber = getWeek(date, { weekStartsOn: 1 })
  const isClickable = clickable && onDateSelect

  // 表示テキストを決定
  const displayText =
    endDate && date.getTime() !== endDate.getTime() ? generateRangeText(date, endDate) : format(date, formatPattern)

  // 日付コンテンツを作成
  const dateContent = createDateContent(displayText, !!isClickable)

  // クリック可能な場合とそうでない場合で分岐
  if (isClickable) {
    return createClickableContent(
      dateContent,
      date,
      onDateSelect,
      showWeekNumber,
      weekNumber,
      weekBadgeClassName,
      className
    )
  }

  return createStaticContent(dateContent, showWeekNumber, weekNumber, weekBadgeClassName, className)
}

/**
 * 週番号バッジ
 */
const WeekBadge = ({ weekNumber, className }: { weekNumber: number; className?: string }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1',
        'rounded-xs border',
        heading.h6, // スタイルは維持
        border.universal,
        secondary.text,
        className
      )}
      aria-label={`第${weekNumber}週`}
    >
      week{weekNumber}
    </span>
  )
}

/**
 * コンパクトな日付表示（モバイル用）
 */
export const CompactDateDisplay = ({
  date,
  showWeekNumber = false,
  className,
}: Pick<DateRangeDisplayProps, 'date' | 'showWeekNumber' | 'className'>) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-base font-medium">{format(date, 'MMM d')}</span>
      {showWeekNumber && <span className="text-muted-foreground text-xs">W{getWeek(date, { weekStartsOn: 1 })}</span>}
    </div>
  )
}
