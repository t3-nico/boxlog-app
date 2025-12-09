'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface MiniCalendarProps {
  selectedDate?: Date | undefined
  onDateSelect?: ((date: Date | undefined) => void) | undefined
  onMonthChange?: ((date: Date) => void) | undefined
  className?: string | undefined
  month?: Date | undefined
  displayRange?:
    | {
        start: Date
        end: Date
      }
    | undefined
  asPopover?: boolean | undefined
  popoverTrigger?: React.ReactNode | undefined
  popoverClassName?: string | undefined
  popoverAlign?: 'start' | 'center' | 'end' | undefined
  popoverSide?: 'top' | 'right' | 'bottom' | 'left' | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
}

const WEEKDAYS_JA = ['月', '火', '水', '木', '金', '土', '日']
const WEEKDAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const MONTHS_JA = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const START_YEAR = 2020
const END_YEAR = 2050

/**
 * MiniCalendar - 自作カレンダーコンポーネント
 *
 * shadcn/ui Calendarのデザインを参考に実装
 * - date-fnsベースの軽量実装
 * - セマンティックトークン完全対応
 * - 8pxグリッド準拠（セルサイズ32px）
 * - 日本語/英語対応
 * - 週範囲ハイライト対応
 */
export const MiniCalendar = memo<MiniCalendarProps>(
  ({
    selectedDate,
    onDateSelect,
    onMonthChange,
    className,
    month,
    displayRange,
    asPopover = false,
    popoverTrigger,
    popoverClassName,
    popoverAlign = 'start',
    popoverSide = 'bottom',
    onOpenChange,
  }) => {
    const locale = useLocale()
    const [isMounted, setIsMounted] = useState(false)
    const [open, setOpen] = useState(false)
    const [viewMonth, setViewMonth] = useState(() => month ?? selectedDate ?? new Date())

    useEffect(() => {
      setIsMounted(true)
    }, [])

    // 外部からmonthが変更された場合に同期
    useEffect(() => {
      if (month) {
        setViewMonth(month)
      }
    }, [month])

    // selectedDateが変更された場合、その月を表示（メインカレンダーとの同期）
    useEffect(() => {
      if (selectedDate) {
        setViewMonth(selectedDate)
      }
    }, [selectedDate])

    const weekdays = locale === 'ja' ? WEEKDAYS_JA : WEEKDAYS_EN
    const months = locale === 'ja' ? MONTHS_JA : MONTHS_EN

    // カレンダーの日付配列を生成
    const calendarDays = useMemo(() => {
      const monthStart = startOfMonth(viewMonth)
      const monthEnd = endOfMonth(viewMonth)
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

      return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }, [viewMonth])

    // 週ごとにグループ化
    const weeks = useMemo(() => {
      const result: Date[][] = []
      for (let i = 0; i < calendarDays.length; i += 7) {
        result.push(calendarDays.slice(i, i + 7))
      }
      return result
    }, [calendarDays])

    // 年の選択肢を生成
    const years = useMemo(() => {
      const result: number[] = []
      for (let year = START_YEAR; year <= END_YEAR; year++) {
        result.push(year)
      }
      return result
    }, [])

    const handlePrevMonth = useCallback(() => {
      const newMonth = subMonths(viewMonth, 1)
      setViewMonth(newMonth)
      onMonthChange?.(newMonth)
    }, [viewMonth, onMonthChange])

    const handleNextMonth = useCallback(() => {
      const newMonth = addMonths(viewMonth, 1)
      setViewMonth(newMonth)
      onMonthChange?.(newMonth)
    }, [viewMonth, onMonthChange])

    const handleMonthSelect = useCallback(
      (monthIndex: string) => {
        const newMonth = new Date(getYear(viewMonth), parseInt(monthIndex, 10), 1)
        setViewMonth(newMonth)
        onMonthChange?.(newMonth)
      },
      [viewMonth, onMonthChange]
    )

    const handleYearSelect = useCallback(
      (year: string) => {
        const newMonth = new Date(parseInt(year, 10), getMonth(viewMonth), 1)
        setViewMonth(newMonth)
        onMonthChange?.(newMonth)
      },
      [viewMonth, onMonthChange]
    )

    const handleDateClick = useCallback(
      (date: Date) => {
        onDateSelect?.(date)
        if (asPopover) {
          setOpen(false)
        }
      },
      [onDateSelect, asPopover]
    )

    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        setOpen(newOpen)
        onOpenChange?.(newOpen)
      },
      [onOpenChange]
    )

    // 日付の状態を判定
    const getDayState = useCallback(
      (date: Date) => {
        const today = new Date()
        const isToday = isSameDay(date, today)
        const isSelected = selectedDate && isSameDay(date, selectedDate)
        const isCurrentMonth = isSameMonth(date, viewMonth)

        // 範囲内かどうか
        let isInRange = false
        let isRangeStart = false
        let isRangeEnd = false

        if (displayRange) {
          isInRange = isWithinInterval(date, { start: displayRange.start, end: displayRange.end })
          isRangeStart = isSameDay(date, displayRange.start)
          isRangeEnd = isSameDay(date, displayRange.end)
        }

        return { isToday, isSelected, isCurrentMonth, isInRange, isRangeStart, isRangeEnd }
      },
      [selectedDate, viewMonth, displayRange]
    )

    // ハイドレーション対策
    if (!isMounted) {
      return null
    }

    const renderCalendar = () => (
      <div className={cn('p-3 select-none', className)}>
        {/* ヘッダー: ナビゲーション + 月・年選択 */}
        <div className="mb-2 flex items-center justify-between">
          {/* 前月ボタン */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-state-hover hover:text-foreground size-8"
            onClick={handlePrevMonth}
            aria-label="前の月"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* 月・年ドロップダウン - 中央 */}
          <div className="flex items-center gap-1">
            <Select value={getMonth(viewMonth).toString()} onValueChange={handleMonthSelect}>
              <SelectTrigger
                size="sm"
                className="border-border hover:bg-state-hover h-7 gap-1 bg-transparent px-2 text-sm font-medium shadow-none focus-visible:ring-0"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={getYear(viewMonth).toString()} onValueChange={handleYearSelect}>
              <SelectTrigger
                size="sm"
                className="border-border hover:bg-state-hover h-7 gap-1 bg-transparent px-2 text-sm font-medium shadow-none focus-visible:ring-0"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 次月ボタン */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-state-hover hover:text-foreground size-8"
            onClick={handleNextMonth}
            aria-label="次の月"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="mb-1 grid grid-cols-7">
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-muted-foreground flex size-8 items-center justify-center text-xs font-normal"
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid gap-0">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((date) => {
                const { isToday, isSelected, isCurrentMonth, isInRange, isRangeStart, isRangeEnd } = getDayState(date)

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      // ベーススタイル - 32px正方形
                      'flex size-8 items-center justify-center text-sm transition-colors',
                      // 現在の月以外は薄く
                      !isCurrentMonth && 'text-muted-foreground',
                      // ホバー
                      'hover:bg-state-hover hover:rounded-md',
                      // 今日: primary
                      isToday && 'bg-primary text-primary-foreground rounded-md font-semibold',
                      // 範囲内（今日以外）
                      isInRange && !isToday && 'bg-state-hover text-foreground',
                      // 範囲の開始・終了のrounded
                      isRangeStart && !isToday && 'rounded-l-md',
                      isRangeEnd && !isToday && 'rounded-r-md',
                      // 選択中（単一選択、範囲外、今日以外）
                      isSelected && !isInRange && !isToday && 'bg-state-hover text-foreground rounded-md'
                    )}
                  >
                    {format(date, 'd')}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )

    // Popoverモード
    if (asPopover) {
      return (
        <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
          <PopoverTrigger asChild className="hover:bg-state-hover transition-colors">
            {popoverTrigger}
          </PopoverTrigger>
          <PopoverContent
            className={cn('bg-popover dark:border-input w-auto border p-0', popoverClassName)}
            align={popoverAlign}
            side={popoverSide}
          >
            {renderCalendar()}
          </PopoverContent>
        </Popover>
      )
    }

    // 直接表示モード
    return renderCalendar()
  }
)

MiniCalendar.displayName = 'MiniCalendar'
