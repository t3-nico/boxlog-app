'use client'

import React from 'react'

import { Calendar } from '@/components/ui/calendar'

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
 */
export const MiniCalendar = React.memo<MiniCalendarProps>(
  ({ selectedDate, onDateSelect, onMonthChange, className, showWeekNumbers = false }) => {
    return (
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        onMonthChange={onMonthChange}
        showWeekNumber={showWeekNumbers}
        captionLayout="dropdown"
        className={className}
      />
    )
  }
)

MiniCalendar.displayName = 'MiniCalendar'
