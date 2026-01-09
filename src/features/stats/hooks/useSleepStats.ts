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

import { calculateOverlapWithSleep, useSleepHours } from '@/features/calendar/hooks/useSleepHours';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { api } from '@/lib/trpc';

interface SleepStatsResult {
  /** 設定上の睡眠時間（時間） */
  baseSleepHours: number;
  /** 睡眠時間帯と重複する予定の時間（時間） */
  overlapHours: number;
  /** 実際の睡眠可能時間（時間） */
  actualSleepHours: number;
  /** 1日あたりの設定睡眠時間 */
  dailySleepHours: number;
  /** 1日あたりの実際の睡眠時間（平均） */
  avgActualSleepPerDay: number;
  /** 期間の日数 */
  days: number;
  /** 睡眠設定が有効か */
  enabled: boolean;
  /** ローディング中か */
  isPending: boolean;
}

/**
 * 睡眠統計を計算するフック
 *
 * 計算ロジック:
 * 実際の睡眠時間 = (設定上の睡眠時間 × 日数) - (睡眠時間帯と重複する予定の時間)
 *
 * @param startDate 期間の開始日
 * @param endDate 期間の終了日
 */
export function useSleepStats(startDate: Date, endDate: Date): SleepStatsResult {
  const sleepSchedule = useCalendarSettingsStore((state) => state.sleepSchedule);
  const sleepHours = useSleepHours();

  // 全プランを取得（日付フィルターはクライアント側で実行）
  const { data: plans, isPending } = api.plans.list.useQuery();

  return useMemo(() => {
    if (!sleepSchedule.enabled || !sleepHours) {
      return {
        baseSleepHours: 0,
        overlapHours: 0,
        actualSleepHours: 0,
        dailySleepHours: 0,
        avgActualSleepPerDay: 0,
        days: 0,
        enabled: false,
        isPending,
      };
    }

    const days = differenceInDays(endDate, startDate) + 1;
    const dailySleepHours = sleepHours.totalHours;
    const baseSleepHours = dailySleepHours * days;

    // 睡眠時間帯と重複する予定の時間を計算
    let overlapMinutes = 0;

    const periodStart = startOfDay(startDate);
    const periodEnd = endOfDay(endDate);

    if (plans) {
      for (const plan of plans) {
        if (plan.start_time && plan.end_time) {
          const planStart = new Date(plan.start_time);
          const planEnd = new Date(plan.end_time);

          // 期間内のプランのみ処理
          if (!isWithinInterval(planStart, { start: periodStart, end: periodEnd })) {
            continue;
          }

          // 睡眠時間帯との重複を計算
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

    const overlapHours = overlapMinutes / 60;
    const actualSleepHours = Math.max(0, baseSleepHours - overlapHours);
    const avgActualSleepPerDay = days > 0 ? actualSleepHours / days : 0;

    return {
      baseSleepHours,
      overlapHours,
      actualSleepHours,
      dailySleepHours,
      avgActualSleepPerDay,
      days,
      enabled: true,
      isPending,
    };
  }, [sleepSchedule.enabled, sleepHours, plans, startDate, endDate, isPending]);
}
