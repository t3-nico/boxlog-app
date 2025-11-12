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
  const [showCalendar, setShowCalendar] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  // ボタンの位置を計算
  useEffect(() => {
    if (showCalendar && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      })
    }
  }, [showCalendar])

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
        <Portal.Root>
          <div
            className="border-input bg-popover text-popover-foreground fixed z-[9999] w-auto rounded-md border shadow-md"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} captionLayout="dropdown" />
          </div>
        </Portal.Root>
      )}
    </div>
  )
}
