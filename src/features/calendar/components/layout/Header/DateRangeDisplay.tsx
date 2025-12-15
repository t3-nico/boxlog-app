'use client'

import { format, getWeek } from 'date-fns'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface DateRangeDisplayProps {
  date: Date
  endDate?: Date | undefined
  viewType?: string | undefined
  showWeekNumber?: boolean | undefined
  formatPattern?: string | undefined
  className?: string | undefined
  weekBadgeClassName?: string | undefined
  onDateSelect?: ((date: Date | undefined) => void) | undefined
  clickable?: boolean | undefined
  // 現在表示している期間（MiniCalendarでのハイライト用）
  displayRange?:
    | {
        start: Date
        end: Date
      }
    | undefined
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
 * PageHeaderと同じtext-lg（18px）を使用
 */
const createDateContent = (text: string) => (
  <div className="flex items-center gap-2">
    <h2 className="text-lg font-semibold">{text}</h2>
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
    {showWeekNumber ? (
      <WeekBadge weekNumber={weekNumber} {...(weekBadgeClassName && { className: weekBadgeClassName })} />
    ) : null}
  </div>
)

/**
 * クリック可能な日付表示コンテンツを作成（ポップアップ削除）
 * 注意: ヘッダーの日付表示はクリック対象ではないため、現在は静的表示と同じ
 */
const createClickableContent = (
  dateContent: React.ReactNode,
  showWeekNumber: boolean,
  weekNumber: number,
  weekBadgeClassName?: string,
  className?: string
) => (
  <div className={cn('flex items-center gap-2', className)}>
    {dateContent}
    {showWeekNumber ? (
      <WeekBadge weekNumber={weekNumber} {...(weekBadgeClassName && { className: weekBadgeClassName })} />
    ) : null}
  </div>
)

/**
 * 日付範囲表示
 * 単一日付または期間を表示し、オプションで週番号も表示
 */
export const DateRangeDisplay = ({
  date,
  endDate,
  showWeekNumber = true,
  formatPattern = 'MMMM yyyy',
  className,
  weekBadgeClassName,
  onDateSelect,
  clickable = false,
  displayRange: _displayRange,
}: DateRangeDisplayProps) => {
  const weekNumber = getWeek(date, { weekStartsOn: 1 })
  const isClickable = clickable && onDateSelect

  // 表示テキストを決定
  const displayText =
    endDate && date.getTime() !== endDate.getTime() ? generateRangeText(date, endDate) : format(date, formatPattern)

  // 日付コンテンツを作成
  const dateContent = createDateContent(displayText)

  // クリック可能な場合とそうでない場合で分岐（ポップアップは削除）
  if (isClickable) {
    return createClickableContent(dateContent, showWeekNumber, weekNumber, weekBadgeClassName, className)
  }

  return createStaticContent(dateContent, showWeekNumber, weekNumber, weekBadgeClassName, className)
}

/**
 * 週番号バッジ
 */
const WeekBadge = ({ weekNumber, className }: { weekNumber: number; className?: string }) => {
  const t = useTranslations()

  return (
    <span
      className={cn('text-muted-foreground inline-flex items-center text-sm font-normal', className)}
      aria-label={t('calendar.dateRange.weekLabel', { weekNumber })}
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
      {showWeekNumber ? (
        <span className="text-muted-foreground text-xs">W{getWeek(date, { weekStartsOn: 1 })}</span>
      ) : null}
    </div>
  )
}
