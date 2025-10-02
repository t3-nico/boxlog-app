'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DateSelectorProps {
  value: Date
  endValue: Date
  onChange: (date: Date) => void
  onEndChange: (date: Date) => void
  onTabNext?: () => void
}

// Generate 15-minute interval time options
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push({ value: timeString, display: timeString, raw: { hour, minute } })
    }
  }
  return options
}

export const DateSelector = ({ value, endValue, onChange, onEndChange }: DateSelectorProps) => {
  // Duration (minutes)
  const [duration, setDuration] = useState(60)

  // タイムピッカー状態
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const timeOptions = generateTimeOptions()
  const startTimeRef = useRef<HTMLDivElement>(null)
  const endTimeRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  // Calculate duration
  useEffect(() => {
    const durationMs = endValue.getTime() - value.getTime()
    const durationMinutes = Math.floor(durationMs / (1000 * 60))
    setDuration(Math.max(0, durationMinutes))
  }, [value, endValue])

  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayOfWeek = weekdays[date.getDay()]
    return `${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`
  }

  // Generate calendar dates for mini calendar
  const generateCalendarDays = (currentDate: Date) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start week on Sunday

    const days = []
    for (let i = 0; i < 42; i++) {
      // 6 weeks × 7 days
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + i)
      days.push(currentDay)
    }
    return days
  }

  const [calendarDate, setCalendarDate] = useState(value)
  const calendarDays = generateCalendarDays(calendarDate)

  // Convert time to input format
  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5)
  }

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  // Date change handler
  const _handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    newDate.setHours(value.getHours(), value.getMinutes())
    onChange(newDate)

    // Adjust end time to same date
    const newEndDate = new Date(e.target.value)
    newEndDate.setHours(endValue.getHours(), endValue.getMinutes())
    onEndChange(newEndDate)
  }, [value, endValue, onChange, onEndChange])

  // Start time change handler
  const _handleStartTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newDate = new Date(value)
    newDate.setHours(hours, minutes)
    onChange(newDate)
  }, [value, onChange])

  // End time change handler
  const _handleEndTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newEndDate = new Date(endValue)
    newEndDate.setHours(hours, minutes)
    onEndChange(newEndDate)
  }, [endValue, onEndChange])

  // Time selection handler
  const handleStartTimeSelect = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const newDate = new Date(value)
    newDate.setHours(hours, minutes)
    onChange(newDate)
    setShowStartTimePicker(false)
  }, [value, onChange])

  const handleEndTimeSelect = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const newEndDate = new Date(endValue)
    newEndDate.setHours(hours, minutes)
    onEndChange(newEndDate)
    setShowEndTimePicker(false)
  }, [endValue, onEndChange])

  // Date selection handler
  const handleDateSelect = useCallback((selectedDate: Date) => {
    const newDate = new Date(selectedDate)
    newDate.setHours(value.getHours(), value.getMinutes())
    onChange(newDate)

    // Adjust end time to same date
    const newEndDate = new Date(selectedDate)
    newEndDate.setHours(endValue.getHours(), endValue.getMinutes())
    onEndChange(newEndDate)

    setShowDatePicker(false)
  }, [value, endValue, onChange, onEndChange])

  // Calendar month navigation
  const handlePrevMonth = useCallback(() => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCalendarDate(newDate)
  }, [calendarDate])

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCalendarDate(newDate)
  }, [calendarDate])

  // Toggle handlers
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker(!showDatePicker)
  }, [showDatePicker])

  const toggleStartTimePicker = useCallback(() => {
    setShowStartTimePicker(!showStartTimePicker)
  }, [showStartTimePicker])

  const toggleEndTimePicker = useCallback(() => {
    setShowEndTimePicker(!showEndTimePicker)
  }, [showEndTimePicker])

  // Quick select handlers
  const selectToday = useCallback(() => {
    handleDateSelect(new Date())
  }, [handleDateSelect])

  const selectTomorrow = useCallback(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    handleDateSelect(tomorrow)
  }, [handleDateSelect])

  // Dynamic date select handler
  const createDateSelectHandler = useCallback((day: Date) => {
    return () => handleDateSelect(day)
  }, [handleDateSelect])

  // Dynamic time select handlers
  const createStartTimeSelectHandler = useCallback((timeString: string) => {
    return () => handleStartTimeSelect(timeString)
  }, [handleStartTimeSelect])

  const createEndTimeSelectHandler = useCallback((timeString: string) => {
    return () => handleEndTimeSelect(timeString)
  }, [handleEndTimeSelect])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startTimeRef.current && !startTimeRef.current.contains(event.target as Node)) {
        setShowStartTimePicker(false)
      }
      if (endTimeRef.current && !endTimeRef.current.contains(event.target as Node)) {
        setShowEndTimePicker(false)
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-4">
      {/* Date and time in one row */}
      <div className="flex items-end gap-3">
        {/* Date selector */}
        <div className="relative w-36" ref={dateRef}>
          <label htmlFor="date-selector-button" className="text-sm text-muted-foreground mb-2 block">
            Date
          </label>
          <button
            type="button"
            id="date-selector-button"
            onClick={toggleDatePicker}
            className="w-full py-3 pl-3 pr-3 bg-background border border-border rounded-md text-base text-left focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-muted/50 flex items-center justify-between transition-colors duration-200"
          >
            <span>{formatDateForDisplay(value)}</span>
            <Calendar size={14} className="text-muted-foreground" />
          </button>

          {/* Mini calendar popup */}
          <AnimatePresence>
            {showDatePicker != null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 top-full z-50 mt-1 w-64 bg-background border border-border rounded-lg p-4 shadow-lg"
              >
                {/* Calendar header */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="rounded p-1 hover:bg-muted/50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h3 className="text-base font-semibold text-foreground">
                    {calendarDate.getFullYear()}/{(calendarDate.getMonth() + 1).toString().padStart(2, '0')}
                  </h3>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="rounded p-1 hover:bg-muted/50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar dates */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, _index) => {
                    const isCurrentMonth = day.getMonth() === calendarDate.getMonth()
                    const isSelected = day.toDateString() === value.toDateString()
                    const isToday = day.toDateString() === new Date().toDateString()

                    return (
                      <button
                        type="button"
                        key={day.toISOString().split('T')[0]}
                        onClick={createDateSelectHandler(day)}
                        className={cn(
                          "rounded p-2 text-center transition-colors duration-150 text-sm",
                          isSelected && "bg-blue-500 text-white",
                          !isSelected && isToday && "bg-muted text-foreground font-semibold",
                          !isSelected && !isToday && isCurrentMonth && "hover:bg-muted/50 text-foreground",
                          !isSelected && !isToday && !isCurrentMonth && "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>

                {/* Quick select */}
                <div className="mt-4 flex gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={selectToday}
                    className="rounded px-3 py-1.5 text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors duration-150"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={selectTomorrow}
                    className="rounded px-3 py-1.5 text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors duration-150"
                  >
                    Tomorrow
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Start time */}
        <div className="relative w-24" ref={startTimeRef}>
          <label htmlFor="start-time-selector-button" className="text-sm text-muted-foreground mb-2 block">
            Start
          </label>
          <button
            type="button"
            id="start-time-selector-button"
            onClick={toggleStartTimePicker}
            className="w-full py-3 pl-3 pr-3 bg-background border border-border rounded-md text-base text-left focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-muted/50 flex items-center justify-between transition-colors duration-200"
          >
            <span>{formatTimeForInput(value)}</span>
            <Clock size={14} className="text-muted-foreground" />
          </button>

          {/* Time picker dropdown */}
          <AnimatePresence>
            {showStartTimePicker != null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 top-full z-50 mt-1 w-32 bg-background border border-border rounded-lg max-h-48 overflow-y-auto shadow-lg"
              >
                {timeOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={createStartTimeSelectHandler(option.value)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors duration-150",
                      formatTimeForInput(value) === option.value && "bg-muted"
                    )}
                  >
                    {option.display}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* End time */}
        <div className="relative w-24" ref={endTimeRef}>
          <label htmlFor="end-time-selector-button" className="text-sm text-muted-foreground mb-2 block">
            End
          </label>
          <button
            type="button"
            id="end-time-selector-button"
            onClick={toggleEndTimePicker}
            className="w-full py-3 pl-3 pr-3 bg-background border border-border rounded-md text-base text-left focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-muted/50 flex items-center justify-between transition-colors duration-200"
          >
            <span>{formatTimeForInput(endValue)}</span>
            <Clock size={14} className="text-muted-foreground" />
          </button>

          {/* Time picker dropdown */}
          <AnimatePresence>
            {showEndTimePicker != null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 top-full z-50 mt-1 w-32 bg-background border border-border rounded-lg max-h-48 overflow-y-auto shadow-lg"
              >
                {timeOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={createEndTimeSelectHandler(option.value)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors duration-150",
                      formatTimeForInput(endValue) === option.value && "bg-muted"
                    )}
                  >
                    {option.display}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Duration display - right of end time */}
        {duration > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 mt-auto flex items-center gap-1.5"
          >
            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock size={12} />
              <span>{formatDuration(duration)}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
