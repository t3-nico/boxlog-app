'use client';

import { ChevronDown, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { COLLAPSED_SLEEP_HEIGHT } from '../constants/sleepCollapse.constants';

interface CollapsedSleepRowProps {
  /** 開始時間（0-23） */
  startHour: number;
  /** 終了時間（1-24） */
  endHour: number;
  /** 展開ボタンクリック時のコールバック */
  onExpand: () => void;
  /** 追加のクラス名 */
  className?: string;
  /** この時間帯に存在するプランの件数 */
  planCount?: number;
}

/**
 * 睡眠時間帯の折りたたみ行コンポーネント
 */
export function CollapsedSleepRow({
  startHour,
  endHour,
  onExpand,
  className,
  planCount = 0,
}: CollapsedSleepRowProps) {
  const t = useTranslations('calendar');

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const timeRangeLabel = `${formatHour(startHour)} - ${formatHour(endHour)}`;

  return (
    <button
      type="button"
      onClick={onExpand}
      className={cn(
        'group flex w-full items-center justify-center gap-2',
        'bg-muted/30 hover:bg-muted/50',
        'border-border/50 border-y',
        'text-muted-foreground text-sm',
        'transition-colors duration-150',
        'cursor-pointer',
        className,
      )}
      style={{ height: COLLAPSED_SLEEP_HEIGHT }}
      aria-label={t('sleepHours.expand')}
    >
      <Moon className="size-4 opacity-60" />
      <span className="font-medium">{timeRangeLabel}</span>
      {planCount > 0 && (
        <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
          {planCount}
        </span>
      )}
      <ChevronDown className="size-4 opacity-60 transition-transform group-hover:translate-y-0.5" />
    </button>
  );
}
