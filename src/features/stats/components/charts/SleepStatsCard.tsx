'use client';

import { useMemo } from 'react';

import {
  differenceInDays,
  endOfDay,
  getHours,
  getMinutes,
  isWithinInterval,
  startOfDay,
} from 'date-fns';
import { Moon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateOverlapWithSleep, useSleepHours } from '@/features/calendar/hooks/useSleepHours';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { api } from '@/lib/trpc';

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface SleepStatsCardProps {
  startDate: Date;
  endDate: Date;
}

export function SleepStatsCard({ startDate, endDate }: SleepStatsCardProps) {
  const sleepSchedule = useCalendarSettingsStore((state) => state.sleepSchedule);
  const sleepHours = useSleepHours();
  const { data: plans, isPending } = api.plans.list.useQuery();

  const stats = useMemo(() => {
    if (!sleepSchedule.enabled || !sleepHours) {
      return null;
    }

    const days = differenceInDays(endDate, startDate) + 1;
    const dailySleepHours = sleepHours.totalHours;
    const baseSleepHours = dailySleepHours * days;

    let overlapMinutes = 0;
    const periodStart = startOfDay(startDate);
    const periodEnd = endOfDay(endDate);

    if (plans) {
      for (const plan of plans) {
        if (plan.start_time && plan.end_time) {
          const planStart = new Date(plan.start_time);
          const planEnd = new Date(plan.end_time);

          if (!isWithinInterval(planStart, { start: periodStart, end: periodEnd })) {
            continue;
          }

          const overlap = calculateOverlapWithSleep(
            getHours(planStart),
            getMinutes(planStart),
            getHours(planEnd),
            getMinutes(planEnd),
            sleepHours,
          );
          overlapMinutes += overlap;
        }
      }
    }

    const overlapHrs = overlapMinutes / 60;
    const actualSleepHours = Math.max(0, baseSleepHours - overlapHrs);
    const avgActualSleepPerDay = days > 0 ? actualSleepHours / days : 0;

    return { actualSleepHours, avgActualSleepPerDay, overlapHours: overlapHrs };
  }, [sleepSchedule.enabled, sleepHours, plans, startDate, endDate]);

  if (!sleepSchedule.enabled || !stats) {
    return null;
  }

  if (isPending) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Sleep</CardTitle>
            <CardDescription>Estimated sleep hours</CardDescription>
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
          <CardTitle className="text-base">Sleep</CardTitle>
          <CardDescription>Estimated sleep hours</CardDescription>
        </div>
        <Moon className="text-muted-foreground size-5" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatHours(stats.actualSleepHours)}</div>
        <p className="text-muted-foreground mt-1 text-sm">
          Daily avg: {formatHours(stats.avgActualSleepPerDay)}
        </p>
        {stats.overlapHours > 0 && (
          <p className="text-muted-foreground mt-2 text-xs">
            Reduced by {formatHours(stats.overlapHours)} (schedule overlap)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
