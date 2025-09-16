'use client'

import React, { memo, useState, useMemo, useCallback } from 'react'

import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { secondary, selection } from '@/config/theme/colors'
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

export const MiniCalendar = memo<MiniCalendarProps>(({
  selectedDate = new Date(),
  onDateSelect,
  onMonthChange,
  className,
  highlightedDates = [],
  displayedPeriodDates = [],
  disabledDates = [],
  showWeekNumbers = false,
  firstDayOfWeek = 1 // Monday default
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))
  
  // selectedDate が変更されたら、必要に応じて表示月を自動調整
  React.useEffect(() => {
    const selectedMonth = startOfMonth(selectedDate)
    
    // 現在の表示月と選択された日付の月が異なる場合のみ調整
    setCurrentMonth(prev => {
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

  const handleDateClick = useCallback((date: Date) => {
    if (disabledDates.some(disabled => isSameDay(disabled, date))) {
      return
    }
    onDateSelect?.(date)
  }, [disabledDates, onDateSelect])


  const getWeekNumber = useCallback((date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + start.getDay() + 1) / 7)
  }, [])

  return (
    <div 
      className={cn(
        "mini-calendar w-full bg-background select-none",
        className
      )}
      role="application"
      aria-label="Mini Calendar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className={cn(
            'p-1.5 rounded-full transition-colors',
            secondary.hover,
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Previous Month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="font-medium text-base">
          {format(currentMonth, 'MMM yyyy')}
        </div>
        
        <button
          onClick={handleNextMonth}
          className={cn(
            'p-1.5 rounded-full transition-colors',
            secondary.hover,
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Next Month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Week headers */}
      <div className={cn(
        "grid grid-cols-7 gap-0.5 mb-2",
        showWeekNumbers && "grid-cols-8"
      )}>
        {showWeekNumbers && (
          <div className="h-6 text-xs text-muted-foreground flex items-center justify-center">
            W
          </div>
        )}
        {weekDays.map((day, index) => (
          <div 
            key={index}
            className="h-6 text-xs font-medium text-muted-foreground flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={cn(
        "grid grid-cols-7 gap-0.5",
        showWeekNumbers && "grid-cols-8"
      )}>
        {/* Render weeks */}
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => {
          const weekStart = weekIndex * 7
          const weekDays = calendarDays.slice(weekStart, weekStart + 7)
          
          return [
            // Week number
            showWeekNumbers && (
              <div
                key={`week-${weekIndex}`}
                className="h-8 w-8 text-xs text-muted-foreground flex items-center justify-center"
              >
                {getWeekNumber(weekDays[0])}
              </div>
            ),
            // Days of the week
            ...weekDays.map((date, dayIndex) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isToday = isSameDay(date, new Date())
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isHighlighted = highlightedDates.some(highlighted => {
                // より厳密な日付比較：年・月・日が完全に一致するかチェック
                const dateYear = date.getFullYear()
                const dateMonth = date.getMonth()
                const dateDay = date.getDate()
                
                const highlightYear = highlighted.getFullYear()
                const highlightMonth = highlighted.getMonth()
                const highlightDay = highlighted.getDate()
                
                const match = dateYear === highlightYear && 
                             dateMonth === highlightMonth && 
                             dateDay === highlightDay
                
                if (match) {
                  console.log('🔍 Highlight match found:', {
                    date: `${dateYear}-${dateMonth}-${dateDay}`,
                    highlighted: `${highlightYear}-${highlightMonth}-${highlightDay}`,
                    dateString: date.toDateString(),
                    highlightedString: highlighted.toDateString()
                  })
                }
                return match
              })
              const isInDisplayedPeriod = displayedPeriodDates.some(periodDate => 
                isSameDay(periodDate, date)
              )
              const isDisabled = disabledDates.some(disabled => 
                isSameDay(disabled, date)
              )


              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                  className={cn(
                    // Base styles
                    "h-8 w-8 text-sm rounded-md transition-colors",
                    "focus:outline-none",
                    
                    // Hover state (only for non-today dates)
                    !isToday && selection.hover,
                    
                    // Current month vs other months
                    isCurrentMonth 
                      ? "text-foreground" 
                      : "text-muted-foreground/50",
                    
                    // Displayed period (weakest highlight - 表示中の期間)
                    isInDisplayedPeriod && !isSelected && !isToday && !isHighlighted && [
                      displayPeriodState.background,
                    ],
                    
                    // Selected state (only for non-today dates)
                    isSelected && !isToday && [
                      selectedState.background,
                    ],
                    
                    // Today indicator (always maintains this style regardless of selected/hover state)
                    isToday && [
                      `!${secondary.today}`,
                      secondary.text,
                      "font-semibold"
                    ],
                    
                    // Highlighted dates (events, etc.)
                    isHighlighted && !isSelected && !isToday && [
                      'ring-2 ring-blue-500/30 dark:ring-blue-400/30',
                      'bg-blue-500/10 dark:bg-blue-400/10'
                    ],
                    
                    // Disabled state
                    isDisabled && [
                      "opacity-25 cursor-not-allowed",
                      "hover:bg-transparent focus:bg-transparent"
                    ]
                  )}
                  aria-label={format(date, 'EEEE, MMMM d, yyyy')}
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                >
                  {format(date, 'd')}
                </button>
              )
            })
          ]
        }).flat().filter(Boolean)}
      </div>

    </div>
  )
})

MiniCalendar.displayName = 'MiniCalendar'