'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
  const [showCalendar, setShowCalendar] = useState(false)

  // 外側クリックでカレンダーを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <CalendarIcon className="h-4 w-4" />
        <span className="text-sm">{selectedDate ? format(selectedDate, 'M/d', { locale: ja }) : placeholder}</span>
      </Button>
      {showCalendar && (
        <div className="border-input bg-popover absolute top-10 left-0 z-50 w-auto rounded-md border p-0 shadow-md">
          <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} captionLayout="dropdown" />
        </div>
      )}
    </div>
  )
}
