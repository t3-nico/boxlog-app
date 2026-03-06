'use client';

/**
 * 汎用の時間入力行
 *
 * ラベル + ClockTimePicker × 2（開始→終了）+ Duration表示
 * 予定行にも記録行にも使える。
 */

import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

import { ClockTimePicker } from '@/components/ui/clock-time-picker';
import { cn } from '@/lib/utils';

interface TimeRowProps {
  label: string;
  icon?: LucideIcon;
  startTime: string;
  endTime: string;
  onStartChange: (time: string) => void;
  onEndChange: (time: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  durationDisplay?: string | undefined;
  diffDisplay?: string | undefined;
  diffType?: 'over' | 'under' | undefined;
  /** true で記録行（実績）を視覚的に強調 */
  isPrimary?: boolean;
}

export function TimeRow({
  label,
  icon: Icon,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  disabled = false,
  hasError = false,
  durationDisplay,
  diffDisplay,
  diffType,
  isPrimary = false,
}: TimeRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-muted-foreground size-4 flex-shrink-0" />}
        <span
          className={cn(
            'text-sm',
            isPrimary ? 'text-foreground font-medium' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <ClockTimePicker
          value={startTime}
          onChange={onStartChange}
          disabled={disabled}
          hasError={hasError}
        />
        <ArrowRight className="text-muted-foreground size-3.5 flex-shrink-0" />
        <ClockTimePicker
          value={endTime}
          onChange={onEndChange}
          disabled={disabled || !startTime}
          minTime={startTime}
          showDurationInMenu
          hasError={hasError}
        />
        {durationDisplay && (
          <span className="text-muted-foreground ml-1 text-xs tabular-nums">{durationDisplay}</span>
        )}
        {diffDisplay && (
          <span
            className={cn(
              'ml-1 text-xs tabular-nums',
              diffType === 'under' ? 'text-success' : 'text-warning',
            )}
          >
            {diffDisplay}
          </span>
        )}
      </div>
    </div>
  );
}

interface TimeRowPlaceholderProps {
  label: string;
  icon?: LucideIcon;
  message: string;
  muted?: boolean;
}

export function TimeRowPlaceholder({
  label,
  icon: Icon,
  message,
  muted = false,
}: TimeRowPlaceholderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-muted-foreground size-4 flex-shrink-0" />}
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
      <span className={cn('text-muted-foreground text-sm', muted && 'opacity-60')}>{message}</span>
    </div>
  );
}
