'use client'

import { Button } from '@/components/ui/button'
import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

interface DatePickerPopoverProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

/**
 * DatePickerPopover - MiniCalendar Popover版のラッパー
 *
 * **機能**:
 * - ボタンクリックでカレンダーPopover表示
 * - 日付選択後に自動的に閉じる
 * - 月/年のドロップダウン選択対応
 */
export function DatePickerPopover({ selectedDate, onDateChange, placeholder = '日付を選択' }: DatePickerPopoverProps) {
  return (
    <MiniCalendar
      asPopover
      popoverTrigger={
        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 gap-2 px-2" type="button">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">{selectedDate ? format(selectedDate, 'M/d', { locale: ja }) : placeholder}</span>
        </Button>
      }
      selectedDate={selectedDate}
      onDateSelect={onDateChange}
      popoverAlign="start"
    />
  )
}
