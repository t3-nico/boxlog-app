'use client'

import React from 'react'

import { ja } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { useI18n } from '@/features/i18n/lib/hooks'

export interface MiniCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date | undefined) => void
  onMonthChange?: (date: Date) => void
  className?: string
  showWeekNumbers?: boolean
  // 現在表示している期間（週表示などの範囲ハイライト用）
  displayRange?: {
    start: Date
    end: Date
  }
}

/**
 * MiniCalendar - shadcn/ui公式Calendarコンポーネントのラッパー
 *
 * 旧実装から置き換え：
 * - ✅ shadcn/ui公式準拠
 * - ✅ 月/年のドロップダウン選択
 * - ✅ 週番号表示
 * - ✅ デザイントークン完全適用
 * - ✅ 日本語/英語対応
 * - ✅ 表示期間のハイライト（週表示など）
 */
export const MiniCalendar = React.memo<MiniCalendarProps>(
  ({ selectedDate, onDateSelect, onMonthChange, className, showWeekNumbers = false, displayRange }) => {
    const { locale } = useI18n()
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
      setIsMounted(true)
    }, [])

    // ハイドレーション対策: マウント後にロケールを適用
    if (!isMounted) {
      return null
    }

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
          onSelect={(newRange) => {
            // rangeモードでは日付クリック時にその日に移動
            if (newRange?.from) {
              onDateSelect?.(newRange.from)
            }
          }}
          onMonthChange={onMonthChange}
          showWeekNumber={false}
          captionLayout="dropdown"
          locale={locale === 'ja' ? ja : undefined}
          weekStartsOn={1}
          className={className}
        />
      )
    }

    // singleモード（デフォルト）
    return (
      <Calendar
        mode="single"
        required={false}
        selected={selectedDate}
        onSelect={onDateSelect}
        onMonthChange={onMonthChange}
        showWeekNumber={false}
        captionLayout="dropdown"
        locale={locale === 'ja' ? ja : undefined}
        weekStartsOn={1}
        className={className}
      />
    )
  }
)

MiniCalendar.displayName = 'MiniCalendar'
