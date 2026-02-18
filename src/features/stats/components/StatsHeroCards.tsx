'use client';

import { CalendarCheck, Flame, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { StatsHeroData } from '../types/stats.types';

interface StatsHeroCardsProps {
  hero: StatsHeroData;
  streak: { currentStreak: number; longestStreak: number; hasActivityToday: boolean } | null;
  /** 縦並び固定（アサイド用） */
  vertical?: boolean;
}

function formatMinutesToHours(minutes: number): string {
  const hours = minutes / 60;
  if (hours >= 10) return `${Math.round(hours)}h`;
  return `${Math.round(hours * 10) / 10}h`;
}

/**
 * Stats Hero カード（3カードグリッド）
 * Progress%, Today, Streak
 */
export function StatsHeroCards({ hero, streak, vertical }: StatsHeroCardsProps) {
  const t = useTranslations('calendar.stats');
  const {
    progressPercent,
    actualMinutes,
    plannedMinutes,
    todayPlannedMinutes,
    todayActualMinutes,
  } = hero;

  const todayProgressPercent =
    todayPlannedMinutes > 0
      ? Math.min(Math.round((todayActualMinutes / todayPlannedMinutes) * 100), 100)
      : 0;

  return (
    <div className={cn('grid grid-cols-1 gap-3 p-4', !vertical && 'md:grid-cols-3')}>
      {/* Progress Card */}
      <Card className="bg-card">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Target className="h-3.5 w-3.5" />
            {t('progress')}
          </div>
          <div className="text-2xl font-bold tracking-tight">{progressPercent}%</div>
          <div className="text-muted-foreground text-xs">
            {formatMinutesToHours(actualMinutes)} / {formatMinutesToHours(plannedMinutes)}
          </div>
          {/* Progress bar */}
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-primary',
              )}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Today Card */}
      <Card className="bg-card">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <CalendarCheck className="h-3.5 w-3.5" />
            {t('today')}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight">
              {formatMinutesToHours(todayActualMinutes)}
            </span>
            {todayPlannedMinutes > 0 && (
              <span className="text-muted-foreground text-sm">
                / {formatMinutesToHours(todayPlannedMinutes)}
              </span>
            )}
          </div>
          {todayPlannedMinutes > 0 && (
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  todayProgressPercent >= 100 ? 'bg-emerald-500' : 'bg-primary',
                )}
                style={{ width: `${todayProgressPercent}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card className="bg-card">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Flame className="h-3.5 w-3.5" />
            {t('streak')}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight">{streak?.currentStreak ?? 0}</span>
            <span className="text-muted-foreground text-sm">{t('days')}</span>
          </div>
          <div className="text-muted-foreground text-xs">
            {t('longestStreak', { days: streak?.longestStreak ?? 0 })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
