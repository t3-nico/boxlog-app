'use client'

import { format, getWeek } from 'date-fns'
import { ChevronDown } from 'lucide-react'

import { MiniCalendar } from '@/components/common/MiniCalendar'
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
 * 週番号バッジ
 */
const WeekBadge = ({ weekNumber, className }: { weekNumber: number; className?: string | undefined }) => {
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
 * 日付範囲表示
 * 単一日付または期間を表示し、オプションで週番号も表示
 *
 * **モバイル対応**:
 * - モバイル（md未満）: クリックでMiniCalendarポップアップを表示
 * - PC（md以上）: 静的表示（サイドバーにMiniCalendarあり）
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
  displayRange,
}: DateRangeDisplayProps) => {
  const weekNumber = getWeek(date, { weekStartsOn: 1 })

  // 表示テキストを決定
  const displayText =
    endDate && date.getTime() !== endDate.getTime() ? generateRangeText(date, endDate) : format(date, formatPattern)

  // 日付コンテンツ
  const dateContent = <h2 className="text-lg font-semibold">{displayText}</h2>

  // モバイル用: MiniCalendarポップアップ付き（週番号はカレンダーグリッドに表示するため非表示）
  const mobileContent = clickable && onDateSelect && (
    <MiniCalendar
      asPopover
      popoverTrigger={
        <button
          type="button"
          className={cn('flex items-center gap-1 md:hidden', className)}
          aria-label="カレンダーを開く"
        >
          {dateContent}
          <ChevronDown className="text-muted-foreground size-4" />
        </button>
      }
      selectedDate={date}
      displayRange={displayRange}
      onDateSelect={(selectedDate) => {
        if (selectedDate) {
          onDateSelect(selectedDate)
        }
      }}
      popoverAlign="start"
      popoverSide="bottom"
    />
  )

  // PC用: 静的表示
  const desktopContent = (
    <div className={cn('hidden items-center gap-2 md:flex', className)}>
      {dateContent}
      {showWeekNumber && <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />}
    </div>
  )

  // クリック可能な場合: モバイル（ポップアップ）+ PC（静的）
  if (clickable && onDateSelect) {
    return (
      <>
        {mobileContent}
        {desktopContent}
      </>
    )
  }

  // クリック不可の場合: 静的表示のみ
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {dateContent}
      {showWeekNumber && <WeekBadge weekNumber={weekNumber} className={weekBadgeClassName} />}
    </div>
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
