'use client'

import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'

interface DatePickerPopoverProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePickerPopover({
  selectedDate,
  onDateChange,
  placeholder = '日付を選択',
  className,
}: DatePickerPopoverProps) {
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
      <button
        className={cn(
          'bg-card text-card-foreground inline-flex items-center justify-start rounded-md px-2 py-2 text-left text-sm font-normal',
          'hover:bg-accent hover:text-accent-foreground transition-all',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          !selectedDate && 'text-muted-foreground',
          className
        )}
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        {selectedDate ? format(selectedDate, 'yyyy年MM月dd日', { locale: ja }) : placeholder}
      </button>
      {showCalendar && (
        <div className="border-input bg-popover absolute top-10 left-0 z-[9999] rounded-md border shadow-md">
          <Calendar mode="single" selected={selectedDate} captionLayout="dropdown" onSelect={handleDateSelect} />
        </div>
      )}
    </div>
  )
}
