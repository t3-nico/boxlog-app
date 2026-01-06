'use client';

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
  /** 睡眠時間帯内のプラン数（日ごと） */
  planCountsByDate?: number[];
}

/**
 * 時間を "HH:00" 形式でフォーマット
 */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * 折りたたまれた睡眠時間帯セクション
 * 睡眠時間帯を1行に圧縮して表示（日ごとのバッジのみ）
 */
export function CollapsedSleepSection({
  startHour,
  endHour,
  className,
  position,
  planCountsByDate,
}: CollapsedSleepSectionProps) {
  const t = useTranslations('calendar');

  // 日が1つだけの場合は従来通りのレイアウト
  const isSingleDay = !planCountsByDate || planCountsByDate.length <= 1;

  return (
    <div
      className={cn(
        'bg-accent/10 border-accent/30 relative z-10 flex h-12 items-center',
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
      {/* 日ごとのプラン数表示エリア */}
      {!isSingleDay && planCountsByDate && (
        <div className="flex flex-1">
          {planCountsByDate.map((count, index) => (
            <div key={index} className="flex flex-1 items-center pl-2">
              {count > 0 && (
                <span className="text-muted-foreground text-xs">
                  {t('sleepHours.planCount', { count })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 単一日の場合（中央配置） */}
      {isSingleDay &&
        planCountsByDate &&
        planCountsByDate[0] != null &&
        planCountsByDate[0] > 0 && (
          <div className="flex flex-1 items-center pl-2">
            <span className="text-muted-foreground text-xs">
              {t('sleepHours.planCount', { count: planCountsByDate[0] })}
            </span>
          </div>
        )}
    </div>
  );
}

/** 折りたたみセクションの高さ（px） */
export const COLLAPSED_SECTION_HEIGHT = 48;
