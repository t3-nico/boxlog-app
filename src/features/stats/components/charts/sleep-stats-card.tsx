'use client';

import { Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSleepStats } from '@/features/stats/hooks/useSleepStats';
import { useStatsPeriodStore } from '@/features/stats/stores/useStatsPeriodStore';

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}m`;
}

export function SleepStatsCard() {
  const t = useTranslations('stats.sleep');
  const { startDate, endDate } = useStatsPeriodStore();
  const { actualSleepHours, avgActualSleepPerDay, overlapHours, enabled, isPending } =
    useSleepStats(startDate, endDate);

  // 睡眠設定が無効なら非表示
  if (!enabled) {
    return null;
  }

  if (isPending) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Moon className="text-muted-foreground size-5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="mt-2 h-4 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        <Moon className="text-muted-foreground size-5" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatHours(actualSleepHours)}</div>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('dailyAverage')}: {formatHours(avgActualSleepPerDay)}
        </p>
        {overlapHours > 0 && (
          <p className="text-muted-foreground mt-2 text-xs">
            {t('reducedBy', { hours: formatHours(overlapHours) })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
