'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'

interface DatePickerPopoverProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePickerPopover({ selectedDate, onDateChange, placeholder = '日付' }: DatePickerPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 gap-2 px-2" type="button">
          <span className="text-sm">{selectedDate ? format(selectedDate, 'yyyy/MM/dd') : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selectedDate} onSelect={onDateChange} />
      </PopoverContent>
    </Popover>
  )
}
