'use client'

import React, { memo, useCallback, useMemo, useState } from 'react'

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { calendarColors } from '@/features/calendar/theme/colors'
import { cn } from '@/lib/utils'

const selectedState = calendarColors.states.selected
const displayPeriodState = calendarColors.states.displayPeriod

export interface MiniCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onMonthChange?: (date: Date) => void
  className?: string
  highlightedDates?: Date[]
  displayedPeriodDates?: Date[]
  disabledDates?: Date[]
  showWeekNumbers?: boolean
  firstDayOfWeek?: 0 | 1 // 0: Sunday, 1: Monday
}

export const MiniCalendar = memo<MiniCalendarProps>(
  ({
    selectedDate = new Date(),
    onDateSelect,
    onMonthChange,
    className,
    highlightedDates = [],
    displayedPeriodDates = [],
    disabledDates = [],
    showWeekNumbers = false,
    firstDayOfWeek = 1, // Monday default
  }) => {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))

    // selectedDate が変更されたら、必要に応じて表示月を自動調整
    React.useEffect(() => {
      const selectedMonth = startOfMonth(selectedDate)

      // 現在の表示月と選択された日付の月が異なる場合のみ調整
      setCurrentMonth((prev) => {
        if (selectedMonth.getTime() !== prev.getTime()) {
          console.log('📅 MiniCalendar: Auto-adjusting month to:', selectedMonth)
          return selectedMonth
        }
        return prev
      })
    }, [selectedDate])

    const calendarDays = useMemo(() => {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek })
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek })

      return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }, [currentMonth, firstDayOfWeek])

    const weekDays = useMemo(() => {
      const start = firstDayOfWeek === 0 ? 0 : 1 // Sunday or Monday
      return Array.from({ length: 7 }, (_, i) => {
        const dayIndex = (start + i) % 7
        return format(new Date(2024, 0, dayIndex), 'E')
      })
    }, [firstDayOfWeek])

    const handlePrevMonth = useCallback(() => {
      const newMonth = subMonths(currentMonth, 1)
      setCurrentMonth(newMonth)
      onMonthChange?.(newMonth)
    }, [currentMonth, onMonthChange])

    const handleNextMonth = useCallback(() => {
      const newMonth = addMonths(currentMonth, 1)
      setCurrentMonth(newMonth)
      onMonthChange?.(newMonth)
    }, [currentMonth, onMonthChange])

    const handleDateClick = useCallback(
      (date: Date) => {
        if (disabledDates.some((disabled) => isSameDay(disabled, date))) {
          return
        }
        onDateSelect?.(date)
      },
      [disabledDates, onDateSelect]
    )

    const getWeekNumber = useCallback((date: Date) => {
      const start = new Date(date.getFullYear(), 0, 1)
      const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      return Math.ceil((days + start.getDay() + 1) / 7)
    }, [])

    // 日付のクラス名を計算するヘルパー関数
    const getDayButtonClassNames = useCallback(
      (
        date: Date,
        isSelected: boolean,
        isToday: boolean,
        isCurrentMonth: boolean,
        isHighlighted: boolean,
        isInDisplayedPeriod: boolean,
        isDisabled: boolean
      ) => {
        return cn(
          // Base styles
          'h-8 w-8 rounded-md text-sm transition-colors',
          'focus:outline-none',

          // Hover state (only for non-today dates)
          !isToday && 'hover:bg-blue-50 dark:hover:bg-blue-900/20',

          // Current month vs other months
          isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50',

          // Displayed period (weakest highlight - 表示中の期間)
          isInDisplayedPeriod && !isSelected && !isToday && !isHighlighted && [displayPeriodState.background],

          // Selected state (only for non-today dates)
          isSelected && !isToday && [selectedState.background],

          // Today indicator (always maintains this style regardless of selected/hover state)
          isToday && [
            '!bg-neutral-100 dark:!bg-neutral-800',
            'text-neutral-700 dark:text-neutral-300',
            'font-semibold',
          ],

          // Highlighted dates (events, etc.)
          isHighlighted &&
            !isSelected &&
            !isToday && ['ring-2 ring-blue-500/30 dark:ring-blue-400/30', 'bg-blue-500/10 dark:bg-blue-400/10'],

          // Disabled state
          isDisabled && ['cursor-not-allowed opacity-25', 'hover:bg-transparent focus:bg-transparent']
        )
      },
      []
    )

    // 日付のハイライト状態を判定するヘルパー関数
    const getDateStates = useCallback(
      (date: Date) => {
        const isSelected = selectedDate && isSameDay(date, selectedDate)
        const isToday = isSameDay(date, new Date())
        const isCurrentMonth = isSameMonth(date, currentMonth)

        const isHighlighted = highlightedDates.some((highlighted) => {
          // より厳密な日付比較：年・月・日が完全に一致するかチェック
          const dateYear = date.getFullYear()
          const dateMonth = date.getMonth()
          const dateDay = date.getDate()

          const highlightYear = highlighted.getFullYear()
          const highlightMonth = highlighted.getMonth()
          const highlightDay = highlighted.getDate()

          const match = dateYear === highlightYear && dateMonth === highlightMonth && dateDay === highlightDay

          if (match) {
            console.log('🔍 Highlight match found:', {
              date: `${dateYear}-${dateMonth}-${dateDay}`,
              highlighted: `${highlightYear}-${highlightMonth}-${highlightDay}`,
              dateString: date.toDateString(),
              highlightedString: highlighted.toDateString(),
            })
          }
          return match
        })

        const isInDisplayedPeriod = displayedPeriodDates.some((periodDate) => isSameDay(periodDate, date))

        const isDisabled = disabledDates.some((disabled) => isSameDay(disabled, date))

        return {
          isSelected,
          isToday,
          isCurrentMonth,
          isHighlighted,
          isInDisplayedPeriod,
          isDisabled,
        }
      },
      [selectedDate, currentMonth, highlightedDates, displayedPeriodDates, disabledDates]
    )

    return (
      <div
        className={cn('mini-calendar bg-background w-full select-none', className)}
        role="application"
        aria-label="Mini Calendar"
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className={cn(
              'rounded-full p-1.5 transition-colors',
              'hover:bg-neutral-300 dark:hover:bg-neutral-600',
              'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50'
            )}
            aria-label="Previous Month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-base font-medium">{format(currentMonth, 'MMM yyyy')}</div>

          <button
            type="button"
            onClick={handleNextMonth}
            className={cn(
              'rounded-full p-1.5 transition-colors',
              'hover:bg-neutral-300 dark:hover:bg-neutral-600',
              'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50'
            )}
            aria-label="Next Month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Week headers */}
        <div className={cn('mb-2 grid grid-cols-7 gap-0.5', showWeekNumbers && 'grid-cols-8')}>
          {showWeekNumbers != null && (
            <div className="text-muted-foreground flex h-6 items-center justify-center text-xs">W</div>
          )}
          {weekDays.map((day) => (
            <div
              key={`weekday-${day}`}
              className="text-muted-foreground flex h-6 items-center justify-center text-xs font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={cn('grid grid-cols-7 gap-0.5', showWeekNumbers && 'grid-cols-8')}>
          {/* Render weeks */}
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => {
            const weekStart = weekIndex * 7
            const weekDays = calendarDays.slice(weekStart, weekStart + 7)

            return [
              // Week number
              showWeekNumbers && (
                <div
                  key={`week-${weekIndex}`}
                  className="text-muted-foreground flex h-8 w-8 items-center justify-center text-xs"
                >
                  {getWeekNumber(weekDays[0])}
                </div>
              ),
              // Days of the week
              ...weekDays.map((date) => {
                const states = getDateStates(date)

                return (
                  <button
                    key={`day-${date.toISOString().split('T')[0]}`}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    disabled={states.isDisabled}
                    className={getDayButtonClassNames(
                      date,
                      states.isSelected,
                      states.isToday,
                      states.isCurrentMonth,
                      states.isHighlighted,
                      states.isInDisplayedPeriod,
                      states.isDisabled
                    )}
                    aria-label={format(date, 'EEEE, MMMM d, yyyy')}
                    aria-pressed={states.isSelected}
                    aria-current={states.isToday ? 'date' : undefined}
                  >
                    {format(date, 'd')}
                  </button>
                )
              }),
            ]
          })
            .flat()
            .filter(Boolean)}
        </div>
      </div>
    )
  }
)

MiniCalendar.displayName = 'MiniCalendar'
