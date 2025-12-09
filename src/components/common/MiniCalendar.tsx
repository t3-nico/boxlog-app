'use client'

import React, { useState } from 'react'

import { ja } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import type { DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface MiniCalendarProps {
  selectedDate?: Date | undefined
  onDateSelect?: ((date: Date | undefined) => void) | undefined
  onMonthChange?: ((date: Date) => void) | undefined
  className?: string | undefined
  showWeekNumbers?: boolean | undefined
  // 現在表示している期間（週表示などの範囲ハイライト用）
  displayRange?:
    | {
        start: Date
        end: Date
      }
    | undefined
  // 表示する月（メインカレンダーの日付に同期）
  month?: Date | undefined
  // Popoverモード
  asPopover?: boolean | undefined
  popoverTrigger?: React.ReactNode | undefined
  popoverClassName?: string | undefined
  popoverAlign?: 'start' | 'center' | 'end' | undefined
  popoverSide?: 'top' | 'right' | 'bottom' | 'left' | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
}

/**
 * MiniCalendar - 固定幅カレンダーコンポーネント
 *
 * **特徴**:
 * - ✅ shadcn/ui公式Calendarベース
 * - ✅ 固定幅240px（8の倍数準拠）
 * - ✅ 月/年のドロップダウン選択
 * - ✅ デザイントークン完全適用
 * - ✅ 日本語/英語対応
 * - ✅ 表示期間のハイライト（週表示など）
 * - ✅ Popoverモード対応
 *
 * **使い方**:
 * ```tsx
 * // 直接表示
 * <MiniCalendar selectedDate={date} onDateSelect={...} />
 *
 * // Popover版
 * <MiniCalendar
 *   asPopover
 *   popoverTrigger={<Button>...</Button>}
 *   selectedDate={date}
 *   onDateSelect={...}
 * />
 * ```
 */
export const MiniCalendar = React.memo<MiniCalendarProps>(
  ({
    selectedDate,
    onDateSelect,
    onMonthChange,
    className,
    displayRange,
    month,
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

    React.useEffect(() => {
      setIsMounted(true)
    }, [])

    // ハイドレーション対策: マウント後にロケールを適用
    if (!isMounted) {
      return null
    }

    const handleDateSelect = (date: Date | undefined) => {
      if (asPopover && date) {
        onDateSelect?.(date)
        setOpen(false) // Popoverモードでは日付選択後に閉じる
      } else {
        onDateSelect?.(date)
      }
    }

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    // 固定幅スタイル（240px = 8の倍数）
    const fixedWidthClassName = cn('w-60', className)

    // カレンダー本体のレンダリング
    const renderCalendar = () => {
      // displayRangeがある場合はrangeモード、ない場合はsingleモード
      if (displayRange) {
        const range: DateRange = {
          from: displayRange.start,
          to: displayRange.end,
        }

        return (
          <Calendar
            mode="range"
            selected={range}
            {...(month && { month })}
            onSelect={(newRange) => {
              // rangeモードでは日付クリック時にその日に移動
              if (newRange?.from) {
                handleDateSelect(newRange.from)
              }
            }}
            {...(onMonthChange && { onMonthChange })}
            showWeekNumber={false}
            captionLayout="dropdown"
            {...(locale === 'ja' && { locale: ja })}
            weekStartsOn={1}
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2050, 11)}
            className={fixedWidthClassName}
          />
        )
      }

      // singleモード（デフォルト）
      return (
        <Calendar
          mode="single"
          required={false}
          selected={selectedDate}
          {...(month && { month })}
          onSelect={handleDateSelect}
          {...(onMonthChange && { onMonthChange })}
          showWeekNumber={false}
          captionLayout="dropdown"
          {...(locale === 'ja' && { locale: ja })}
          weekStartsOn={1}
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2050, 11)}
          className={fixedWidthClassName}
        />
      )
    }

    // Popoverモード
    if (asPopover) {
      return (
        <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
          <PopoverTrigger asChild className={cn('hover:bg-state-hover transition-colors')}>
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
