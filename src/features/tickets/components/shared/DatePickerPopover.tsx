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

  // ボタンの位置を計算して返す関数
  const getPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      return {
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      }
    }
    return { top: 0, left: 0 }
  }

  // 外側クリックでカレンダーを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // コンテナとカレンダーの両方を確認
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target as Node)
      const isOutsideCalendar = calendarRef.current && !calendarRef.current.contains(event.target as Node)

      if (isOutsideContainer && isOutsideCalendar) {
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
            className="border-input bg-popover text-popover-foreground fixed z-[9999] w-fit rounded-md border p-3 shadow-lg"
            style={{
              top: `${getPosition().top}px`,
              left: `${getPosition().left}px`,
            }}
          >
            <div style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.7 }}>TEST: Render check</div>
            <div style={{ border: '2px solid lime', padding: '4px' }}>
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
            </div>
          </div>
        </Portal.Root>
      )}
    </div>
  )
}
