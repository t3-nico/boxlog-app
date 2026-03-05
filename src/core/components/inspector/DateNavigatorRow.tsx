'use client';

/**
 * 日付ナビゲーション行
 *
 * ◀ [日付] ▶ 形式のグループ化ボタンバー + ラベル
 */

import { addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DatePickerPopover } from '@/components/ui/date-picker-popover';

interface DateNavigatorRowProps {
  label: string;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DateNavigatorRow({
  label,
  selectedDate,
  onDateChange,
  disabled = false,
}: DateNavigatorRowProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground w-12 flex-shrink-0 text-sm">{label}</span>
      <div className="divide-border border-border inline-flex h-8 items-center divide-x overflow-hidden rounded-md border">
        <button
          type="button"
          className="text-muted-foreground hover:bg-state-hover flex h-full w-8 items-center justify-center transition-colors"
          onClick={() => selectedDate && onDateChange(subDays(selectedDate, 1))}
          disabled={disabled || !selectedDate}
          aria-label={t('common.previous')}
        >
          <ChevronLeft className="size-4" />
        </button>
        <DatePickerPopover
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          placeholder={t('common.schedule.datePlaceholder')}
        />
        <button
          type="button"
          className="text-muted-foreground hover:bg-state-hover flex h-full w-8 items-center justify-center transition-colors"
          onClick={() => selectedDate && onDateChange(addDays(selectedDate, 1))}
          disabled={disabled || !selectedDate}
          aria-label={t('common.next')}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
