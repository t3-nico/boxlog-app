import { useCallback } from 'react'

import { addDays, isWeekend } from 'date-fns'

import type { CalendarViewType } from '../types/calendar.types'

interface UseWeekendNavigationProps {
  viewType: CalendarViewType
  currentDate: Date
  showWeekends: boolean
  navigateToDate: (date: Date) => void
}

/**
 * 週末スキップナビゲーション機能を提供するフック
 */
export function useWeekendNavigation({
  viewType,
  currentDate,
  showWeekends,
  navigateToDate,
}: UseWeekendNavigationProps) {
  /**
   * 週末を考慮して日付を調整
   */
  const adjustWeekendDate = useCallback(
    (date: Date): Date => {
      if (showWeekends || viewType !== 'day') {
        return date
      }

      // 日ビューで週末非表示の場合、週末をスキップ
      let adjustedDate = date
      while (isWeekend(adjustedDate)) {
        adjustedDate = addDays(adjustedDate, 1)
      }

      return adjustedDate
    },
    [showWeekends, viewType]
  )

  /**
   * Todayボタン押下時の週末スキップ処理
   */
  const handleTodayWithWeekendSkip = useCallback((): boolean => {
    if (!showWeekends && viewType === 'day') {
      const today = new Date()
      if (isWeekend(today)) {
        // 週末の場合は次の平日に移動
        const nextWeekday = adjustWeekendDate(today)
        navigateToDate(nextWeekday)
        return true
      }
    }
    return false
  }, [showWeekends, viewType, adjustWeekendDate, navigateToDate])

  /**
   * prev/nextナビゲーション時の週末スキップ処理
   */
  const handleWeekendSkipNavigation = useCallback(
    (direction: 'prev' | 'next'): boolean => {
      if (!showWeekends && viewType === 'day') {
        const nextDate = direction === 'next' ? addDays(currentDate, 1) : addDays(currentDate, -1)

        if (isWeekend(nextDate)) {
          // 週末の場合はスキップ
          const daysToSkip =
            direction === 'next' ? (nextDate.getDay() === 6 ? 2 : 1) : nextDate.getDay() === 0 ? -2 : -1

          const skipDate = addDays(nextDate, daysToSkip)
          navigateToDate(skipDate)
          return true
        }
      }
      return false
    },
    [showWeekends, viewType, currentDate, navigateToDate]
  )

  return {
    handleTodayWithWeekendSkip,
    handleWeekendSkipNavigation,
    adjustWeekendDate,
  }
}
