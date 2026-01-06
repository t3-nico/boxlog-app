'use client';

import { Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface CollapsedSleepSectionProps {
  /** 開始時刻（0-23） */
  startHour: number;
  /** 終了時刻（0-24） */
  endHour: number;
  /** 追加のクラス名 */
  className?: string;
  /** セクションの位置（上部/下部） */
  position: 'top' | 'bottom';
}

/**
 * 時間を "HH:00" 形式でフォーマット
 */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * 折りたたまれた睡眠時間帯セクション
 * 睡眠時間帯を1行に圧縮して表示
 */
export function CollapsedSleepSection({
  startHour,
  endHour,
  className,
  position,
}: CollapsedSleepSectionProps) {
  const t = useTranslations('calendar');
  const timeRange = `${formatHour(startHour)} - ${formatHour(endHour === 24 ? 0 : endHour)}`;
  const duration = endHour - startHour;

  return (
    <div
      className={cn(
        'bg-accent/10 border-accent/30 flex h-12 items-center gap-2 px-3',
        position === 'top' && 'border-b',
        position === 'bottom' && 'border-t',
        className,
      )}
      role="row"
      aria-label={t('sleepHours.collapsed', {
        start: formatHour(startHour),
        end: formatHour(endHour === 24 ? 0 : endHour),
      })}
    >
      <Moon className="text-accent-foreground/60 size-4" />
      <span className="text-muted-foreground text-sm font-medium">{timeRange}</span>
      <span className="text-muted-foreground/60 text-xs">({duration}h)</span>
    </div>
  );
}

/** 折りたたみセクションの高さ（px） */
export const COLLAPSED_SECTION_HEIGHT = 48;
