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
        console.log('[DatePickerPopover] Clicking outside, closing calendar')
        setShowCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    console.log('[DatePickerPopover] showCalendar changed:', showCalendar)
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
        onClick={() => {
          console.log('[DatePickerPopover] Button clicked, current showCalendar:', showCalendar)
          setShowCalendar(!showCalendar)
        }}
      >
        <CalendarIcon className="h-4 w-4" />
        <span className="text-sm">{selectedDate ? format(selectedDate, 'M/d', { locale: ja }) : placeholder}</span>
      </Button>
      {showCalendar && (
        <div
          className="border-input bg-popover absolute top-10 left-0 z-50 rounded-md border shadow-md"
          style={{ minWidth: '300px', backgroundColor: 'var(--popover)', border: '2px solid red' }}
        >
          <div style={{ padding: '8px', color: 'red' }}>Calendar should appear here</div>
          <Calendar mode="single" selected={selectedDate} captionLayout="dropdown" onSelect={handleDateSelect} />
        </div>
      )}
    </div>
  )
}
