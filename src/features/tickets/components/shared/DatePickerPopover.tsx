'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import * as Portal from '@radix-ui/react-portal'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface DatePickerPopoverProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePickerPopover({ selectedDate, onDateChange, placeholder = '日付を選択' }: DatePickerPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [showCalendar, setShowCalendar] = useState(false)

  const getPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      return {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      }
    }
    return { top: 0, left: 0 }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target as Node)
      const isOutsideCalendar = calendarRef.current && !calendarRef.current.contains(event.target as Node)

      if (isOutsideContainer && isOutsideCalendar) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showCalendar])

  const handleDateSelect = (date: Date | undefined) => {
    onDateChange(date)
    setShowCalendar(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-8 gap-2 px-2"
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setShowCalendar(!showCalendar)
        }}
      >
        <CalendarIcon className="h-4 w-4" />
        <span className="text-sm">{selectedDate ? format(selectedDate, 'M/d', { locale: ja }) : placeholder}</span>
      </Button>
      {showCalendar && (
        <Portal.Root>
          <div
            ref={calendarRef}
            className="bg-popover text-popover-foreground border-border fixed z-[9999] w-auto overflow-hidden rounded-md border p-0 shadow-lg"
            style={{
              top: `${getPosition().top}px`,
              left: `${getPosition().left}px`,
            }}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
              initialFocus
            />
          </div>
        </Portal.Root>
      )}
    </div>
  )
}
