'use client';

/**
 * 日付選択ポップオーバー（共通コンポーネント）
 *
 * Plan/Record共通で使用する日付選択UI
 */

import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { MiniCalendar } from '@/components/ui/mini-calendar';
import { zIndex } from '@/config/ui/z-index';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';

interface DatePickerPopoverProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  /** Popover の z-index（デフォルト: overlayDropdown） */
  popoverZIndex?: number;
  /** アイコンを表示するか（デフォルト: false） */
  showIcon?: boolean;
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
  placeholder,
  popoverZIndex = zIndex.overlayDropdown,
  showIcon = false,
}: DatePickerPopoverProps) {
  const t = useTranslations();
  const { formatDate } = useDateFormat();
  const resolvedPlaceholder = placeholder ?? t('common.datePicker.placeholder');

  return (
    <MiniCalendar
      asPopover
      popoverTrigger={
        <button
          type="button"
          className="text-muted-foreground data-[state=selected]:text-foreground hover:bg-state-hover focus-visible:ring-ring inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          data-state={selectedDate ? 'selected' : undefined}
          aria-label={
            selectedDate
              ? t('common.datePicker.selectLabel', { date: formatDate(selectedDate) })
              : t('common.datePicker.notSelected')
          }
        >
          {showIcon && <Calendar className="size-4" />}
          {selectedDate ? formatDate(selectedDate) : resolvedPlaceholder}
        </button>
      }
      selectedDate={selectedDate}
      onDateSelect={onDateChange}
      popoverAlign="start"
      popoverZIndex={popoverZIndex}
    />
  );
}
