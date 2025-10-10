'use client'

import React from 'react'

import { ja } from 'date-fns/locale'

import { Calendar } from '@/components/ui/calendar'
import { useI18n } from '@/features/i18n/lib/hooks'

export interface MiniCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onMonthChange?: (date: Date) => void
  className?: string
  showWeekNumbers?: boolean
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
 */
export const MiniCalendar = React.memo<MiniCalendarProps>(
  ({ selectedDate, onDateSelect, onMonthChange, className, showWeekNumbers = false }) => {
    const { locale } = useI18n()

    return (
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        onMonthChange={onMonthChange}
        showWeekNumber={showWeekNumbers}
        captionLayout="dropdown"
        className={className}
        locale={locale === 'ja' ? ja : undefined}
        weekStartsOn={1}
      />
    )
  }
)

MiniCalendar.displayName = 'MiniCalendar'
