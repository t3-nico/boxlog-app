'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

interface DatePickerPopoverProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePickerPopover({ selectedDate, onDateChange, placeholder = '日付' }: DatePickerPopoverProps) {
  const dateRef = useRef<HTMLDivElement>(null)
  const [showCalendar, setShowCalendar] = useState(false)

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dateRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-auto gap-2 px-2"
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowCalendar(!showCalendar)
        }}
      >
        <span className="text-sm">{selectedDate ? format(selectedDate, 'yyyy/MM/dd') : placeholder}</span>
      </Button>
      {/* カレンダーポップアップ */}
      {showCalendar && (
        <div className="border-input bg-popover absolute top-10 left-0 z-50 rounded-md border shadow-md">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onDateChange(date)
              setShowCalendar(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
