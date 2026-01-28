'use client';

import { MiniCalendar } from '@/components/common/MiniCalendar';
import { zIndex } from '@/config/ui/z-index';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';

interface DatePickerPopoverProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  /** Popover の z-index（デフォルト: overlayDropdown） */
  popoverZIndex?: number;
}

/**
 * DatePickerPopover - MiniCalendar Popover版のラッパー
 *
 * **機能**:
 * - ボタンクリックでカレンダーPopover表示
 * - 日付選択後に自動的に閉じる
 * - 月/年のドロップダウン選択対応
 */
export function DatePickerPopover({
  selectedDate,
  onDateChange,
  placeholder = '日付を選択',
  popoverZIndex = zIndex.overlayDropdown,
}: DatePickerPopoverProps) {
  const { formatDate } = useDateFormat();

  return (
    <MiniCalendar
      asPopover
      popoverTrigger={
        <button
          type="button"
          className="text-muted-foreground data-[state=selected]:text-foreground hover:bg-state-hover focus-visible:ring-ring inline-flex h-8 items-center rounded-md px-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          data-state={selectedDate ? 'selected' : undefined}
          aria-label={`日付選択: ${selectedDate ? formatDate(selectedDate) : '未選択'}`}
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </button>
      }
      selectedDate={selectedDate}
      onDateSelect={onDateChange}
      popoverAlign="start"
      popoverZIndex={popoverZIndex}
    />
  );
}
