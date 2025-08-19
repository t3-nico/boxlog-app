'use client'

import React, { memo, useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { cn } from '@/lib/utils'
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

export interface MiniCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  className?: string
  highlightedDates?: Date[]
  disabledDates?: Date[]
  showWeekNumbers?: boolean
  firstDayOfWeek?: 0 | 1 // 0: Sunday, 1: Monday
}

export const MiniCalendar = memo<MiniCalendarProps>(({
  selectedDate = new Date(),
  onDateSelect,
  className,
  highlightedDates = [],
  disabledDates = [],
  showWeekNumbers = false,
  firstDayOfWeek = 1 // Monday default
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))
  
  // selectedDate が変更されたら、必要に応じて表示月を自動調整
  React.useEffect(() => {
    const selectedMonth = startOfMonth(selectedDate)
    const currentDisplayMonth = currentMonth
    
    // 選択された日付の月が現在表示している月と異なる場合、月を移動
    if (selectedMonth.getTime() !== currentDisplayMonth.getTime()) {
      console.log('📅 MiniCalendar: Auto-adjusting month to:', selectedMonth)
      setCurrentMonth(selectedMonth)
    }
  }, [selectedDate, currentMonth])

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
    setCurrentMonth(prev => subMonths(prev, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }, [])

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
        "mini-calendar w-full bg-background p-2 select-none",
        className
      )}
      role="application"
      aria-label="Mini Calendar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-7 w-7 p-0"
          aria-label="Previous Month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-medium text-sm">
          {format(currentMonth, 'MMM yyyy')}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-7 w-7 p-0"
          aria-label="Next Month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week headers */}
      <div className={cn(
        "grid grid-cols-7 gap-0.5 mb-2",
        showWeekNumbers && "grid-cols-8"
      )}>
        {showWeekNumbers && (
          <div className="h-5 text-xs text-muted-foreground flex items-center justify-center">
            W
          </div>
        )}
        {weekDays.map((day, index) => (
          <div 
            key={index}
            className="h-5 text-xs font-medium text-muted-foreground flex items-center justify-center"
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
                className="h-7 w-7 text-xs text-muted-foreground flex items-center justify-center"
              >
                {getWeekNumber(weekDays[0])}
              </div>
            ),
            // Days of the week
            ...weekDays.map((date, dayIndex) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isToday = isSameDay(date, new Date())
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isHighlighted = highlightedDates.some(highlighted => 
                isSameDay(highlighted, date)
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
                    "h-7 w-7 text-xs rounded-md transition-colors",
                    "hover:bg-accent focus:bg-accent focus:outline-none",
                    
                    // Current month vs other months
                    isCurrentMonth 
                      ? "text-foreground" 
                      : "text-muted-foreground/50",
                    
                    // Selected state
                    isSelected && [
                      "bg-primary text-primary-foreground",
                      "hover:bg-primary focus:bg-primary"
                    ],
                    
                    // Today indicator
                    isToday && !isSelected && [
                      "bg-accent font-semibold"
                    ],
                    
                    // Highlighted dates (events, etc.)
                    isHighlighted && !isSelected && [
                      "ring-2 ring-primary/20 bg-primary/10"
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