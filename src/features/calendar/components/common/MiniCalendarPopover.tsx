'use client'

import React, { useState } from 'react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { MiniCalendarProps } from '@/features/calendar/components/common/MiniCalendar'
import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { cn } from '@/lib/utils'

interface MiniCalendarPopoverProps extends Omit<MiniCalendarProps, 'className'> {
  children: React.ReactNode
  className?: string
  popoverClassName?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  onOpenChange?: (open: boolean) => void
}

export const MiniCalendarPopover = ({
  children,
  selectedDate,
  onDateSelect,
  onMonthChange,
  className,
  popoverClassName,
  align = 'start',
  side = 'bottom',
  onOpenChange,
  ...miniCalendarProps
}: MiniCalendarPopoverProps) => {
  const [open, setOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect?.(date)
      setOpen(false) // 日付選択後にポップオーバーを閉じる
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild className={cn('hover:bg-accent transition-colors', className)}>
        {children}
      </PopoverTrigger>
      <PopoverContent className={cn('bg-popover w-auto border-none p-0', popoverClassName)} align={align} side={side}>
        <MiniCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={onMonthChange}
          {...miniCalendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}
