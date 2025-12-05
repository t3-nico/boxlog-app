'use client'

import { MiniCalendar } from '@/features/calendar/components/common/MiniCalendar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

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
        <button
          type="button"
          className="hover:bg-state-hover inline-flex h-8 items-center justify-center rounded-md px-3 text-sm transition-colors"
        >
          {selectedDate ? format(selectedDate, 'yyyy/MM/dd', { locale: ja }) : placeholder}
        </button>
      }
      selectedDate={selectedDate}
      onDateSelect={onDateChange}
      popoverAlign="start"
    />
  )
}
