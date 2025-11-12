'use client'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useState } from 'react'

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
  const [open, setOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    onDateChange(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'bg-card text-card-foreground inline-flex items-center justify-start rounded-md px-2 py-2 text-left text-sm font-normal',
            'hover:bg-accent hover:text-accent-foreground transition-all',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            !selectedDate && 'text-muted-foreground',
            className
          )}
          type="button"
          onClick={() => {
            console.log('DatePicker button clicked, current open:', open)
            setOpen(!open)
          }}
        >
          {selectedDate ? format(selectedDate, 'yyyy年MM月dd日', { locale: ja }) : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start" sideOffset={8}>
        <Calendar mode="single" selected={selectedDate} captionLayout="dropdown" onSelect={handleDateSelect} />
      </PopoverContent>
    </Popover>
  )
}
