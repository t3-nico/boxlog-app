'use client'

import { MiniCalendar } from '@/components/common/MiniCalendar'
import { useDateFormat } from '@/features/settings/hooks/useDateFormat'
import { X } from 'lucide-react'

interface DatePickerPopoverProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  /** 「日付なし」ボタンを表示するか */
  allowClear?: boolean
}

/**
 * DatePickerPopover - MiniCalendar Popover版のラッパー
 *
 * **機能**:
 * - ボタンクリックでカレンダーPopover表示
 * - 日付選択後に自動的に閉じる
 * - 月/年のドロップダウン選択対応
 * - 日付横の✗ボタンでクイッククリア
 */
export function DatePickerPopover({
  selectedDate,
  onDateChange,
  placeholder = '日付を選択',
  allowClear = false,
}: DatePickerPopoverProps) {
  const { formatDate } = useDateFormat()

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDateChange(undefined)
  }

  return (
    <div className="hover:bg-state-hover relative flex items-center rounded-md transition-colors">
      <MiniCalendar
        asPopover
        popoverTrigger={
          <button
            type="button"
            className={`flex h-8 items-center bg-transparent px-2 text-sm ${
              selectedDate ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </button>
        }
        selectedDate={selectedDate}
        onDateSelect={onDateChange}
        popoverAlign="start"
        allowClear={allowClear}
      />
      {/* クリアボタン（日付選択時のみ表示） */}
      {allowClear && selectedDate && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground hover:bg-state-hover -ml-1 flex size-6 items-center justify-center rounded-md transition-colors"
          aria-label="日付をクリア"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
