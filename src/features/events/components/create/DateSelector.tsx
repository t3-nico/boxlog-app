'use client'

import React, { useState, useEffect, useRef } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

import { text, border } from '@/config/theme/colors'
import { rounded } from '@/config/theme/rounded'
import { body } from '@/config/theme/typography'

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

export const DateSelector = ({ 
  value, 
  endValue, 
  onChange,
  onEndChange,
  _onTabNext 
}: DateSelectorProps) => {
  
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
    const _lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start week on Sunday
    
    const days = []
    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
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
  const _handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    newDate.setHours(value.getHours(), value.getMinutes())
    onChange(newDate)
    
    // Adjust end time to same date
    const newEndDate = new Date(e.target.value)
    newEndDate.setHours(endValue.getHours(), endValue.getMinutes())
    onEndChange(newEndDate)
  }

  // Start time change handler
  const _handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newDate = new Date(value)
    newDate.setHours(hours, minutes)
    onChange(newDate)
  }

  // End time change handler
  const _handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newEndDate = new Date(endValue)
    newEndDate.setHours(hours, minutes)
    onEndChange(newEndDate)
  }

  // Time selection handler
  const handleStartTimeSelect = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const newDate = new Date(value)
    newDate.setHours(hours, minutes)
    onChange(newDate)
    setShowStartTimePicker(false)
  }

  const handleEndTimeSelect = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const newEndDate = new Date(endValue)
    newEndDate.setHours(hours, minutes)
    onEndChange(newEndDate)
    setShowEndTimePicker(false)
  }

  // Date selection handler
  const handleDateSelect = (selectedDate: Date) => {
    const newDate = new Date(selectedDate)
    newDate.setHours(value.getHours(), value.getMinutes())
    onChange(newDate)
    
    // Adjust end time to same date
    const newEndDate = new Date(selectedDate)
    newEndDate.setHours(endValue.getHours(), endValue.getMinutes())
    onEndChange(newEndDate)
    
    setShowDatePicker(false)
  }

  // Calendar month navigation
  const handlePrevMonth = () => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCalendarDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCalendarDate(newDate)
  }

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
      <div className="flex gap-3 items-end">
        {/* Date selector */}
        <div className="w-36 relative" ref={dateRef}>
          <label htmlFor="date-selector-button" className={`${body.small} ${text.muted} block mb-2`}>
            Date
          </label>
          <button
            id="date-selector-button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`
              w-full pl-3 pr-3 py-3 ${colors.background.surface} ${border.universal} 
              ${rounded.component.input.md} ${body.DEFAULT} text-left
              focus:outline-none focus:ring-2 focus:ring-blue-500
              hover:${colors.background.elevated} transition-colors duration-200
              flex items-center justify-between
            `}
          >
            <span>{formatDateForDisplay(value)}</span>
            <Calendar size={14} className={text.muted} />
          </button>

          {/* Mini calendar popup */}
          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                  absolute top-full left-0 mt-1 z-50 w-64
                  ${colors.background.base} ${border.universal} ${rounded.component.button.lg}
                  shadow-lg p-4
                `}
              >
                {/* Calendar header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className={`p-1 rounded hover:${colors.background.surface} transition-colors`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h3 className={`${body.DEFAULT} font-semibold ${text.primary}`}>
                    {calendarDate.getFullYear()}/{(calendarDate.getMonth() + 1).toString().padStart(2, '0')}
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className={`p-1 rounded hover:${colors.background.surface} transition-colors`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className={`text-center p-2 ${body.small} ${text.muted}`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar dates */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === calendarDate.getMonth()
                    const isSelected = day.toDateString() === value.toDateString()
                    const isToday = day.toDateString() === new Date().toDateString()
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(day)}
                        className={`
                          p-2 text-center rounded transition-colors duration-150
                          ${isSelected 
                            ? 'bg-blue-500 text-white' 
                            : isToday 
                              ? `${colors.background.elevated} ${text.primary} font-semibold`
                              : isCurrentMonth 
                                ? `hover:${colors.background.surface} ${text.primary}`
                                : `${text.muted} hover:${colors.background.surface}`
                          }
                          ${body.small}
                        `}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>

                {/* Quick select */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => handleDateSelect(new Date())}
                    className={`
                      px-3 py-1.5 rounded ${body.small}
                      ${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}
                      transition-colors duration-150
                    `}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      handleDateSelect(tomorrow)
                    }}
                    className={`
                      px-3 py-1.5 rounded ${body.small}
                      ${colors.background.surface} ${text.secondary} hover:${colors.background.elevated}
                      transition-colors duration-150
                    `}
                  >
                    Tomorrow
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Start time */}
        <div className="w-24 relative" ref={startTimeRef}>
          <label htmlFor="start-time-selector-button" className={`${body.small} ${text.muted} block mb-2`}>
            Start
          </label>
          <button
            id="start-time-selector-button"
            onClick={() => setShowStartTimePicker(!showStartTimePicker)}
            className={`
              w-full pl-3 pr-3 py-3 ${colors.background.surface} ${border.universal} 
              ${rounded.component.input.md} ${body.DEFAULT} text-left
              focus:outline-none focus:ring-2 focus:ring-blue-500
              hover:${colors.background.elevated} transition-colors duration-200
              flex items-center justify-between
            `}
          >
            <span>{formatTimeForInput(value)}</span>
            <Clock size={14} className={text.muted} />
          </button>

          {/* Time picker dropdown */}
          <AnimatePresence>
            {showStartTimePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                  absolute top-full left-0 mt-1 z-50 w-32
                  ${colors.background.base} ${border.universal} ${rounded.component.button.lg}
                  shadow-lg max-h-48 overflow-y-auto
                `}
              >
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStartTimeSelect(option.value)}
                    className={`
                      w-full px-3 py-2 text-left text-sm
                      hover:${colors.background.surface} transition-colors duration-150
                      ${formatTimeForInput(value) === option.value ? `${colors.background.elevated}` : ''}
                    `}
                  >
                    {option.display}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* End time */}
        <div className="w-24 relative" ref={endTimeRef}>
          <label htmlFor="end-time-selector-button" className={`${body.small} ${text.muted} block mb-2`}>
            End
          </label>
          <button
            id="end-time-selector-button"
            onClick={() => setShowEndTimePicker(!showEndTimePicker)}
            className={`
              w-full pl-3 pr-3 py-3 ${colors.background.surface} ${border.universal} 
              ${rounded.component.input.md} ${body.DEFAULT} text-left
              focus:outline-none focus:ring-2 focus:ring-blue-500
              hover:${colors.background.elevated} transition-colors duration-200
              flex items-center justify-between
            `}
          >
            <span>{formatTimeForInput(endValue)}</span>
            <Clock size={14} className={text.muted} />
          </button>

          {/* Time picker dropdown */}
          <AnimatePresence>
            {showEndTimePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                  absolute top-full left-0 mt-1 z-50 w-32
                  ${colors.background.base} ${border.universal} ${rounded.component.button.lg}
                  shadow-lg max-h-48 overflow-y-auto
                `}
              >
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleEndTimeSelect(option.value)}
                    className={`
                      w-full px-3 py-2 text-left text-sm
                      hover:${colors.background.surface} transition-colors duration-150
                      ${formatTimeForInput(endValue) === option.value ? `${colors.background.elevated}` : ''}
                    `}
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
            className="flex items-center gap-1.5 mt-auto mb-3"
          >
            <div className={`${body.small} ${text.muted} flex items-center gap-1.5`}>
              <Clock size={12} />
              <span>{formatDuration(duration)}</span>
            </div>
          </motion.div>
        )}

      </div>

    </div>
  )
}