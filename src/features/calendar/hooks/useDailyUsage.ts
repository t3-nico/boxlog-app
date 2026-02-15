'use client';

import { useMemo } from 'react';

import { format, isSameDay } from 'date-fns';

import { MS_PER_HOUR } from '@/constants/time';

import type { CalendarPlan } from '../types/calendar.types';

export interface DailyUsage {
  /** Plan合計時間（時間単位、小数1桁） */
  planHours: number;
  /** Record合計時間（時間単位、小数1桁） */
  recordHours: number;
}

/**
 * 日別の使用時間を計算するフック
 *
 * @param plans - 全CalendarPlan配列（plan + record 両方含む）
 * @param dates - 計算対象の日付配列
 * @returns Map<dateKey, DailyUsage>
 */
export function useDailyUsage(plans: CalendarPlan[], dates: Date[]): Map<string, DailyUsage> {
  return useMemo(() => {
    const usage = new Map<string, DailyUsage>();

    // 各日付のエントリを初期化
    for (const date of dates) {
      const key = format(date, 'yyyy-MM-dd');
      usage.set(key, { planHours: 0, recordHours: 0 });
    }

    // 各プラン/レコードの時間を集計
    for (const plan of plans) {
      if (!plan.startDate || !plan.endDate) continue;
      if (plan.isDraft) continue;

      const durationMs = plan.endDate.getTime() - plan.startDate.getTime();
      if (durationMs <= 0) continue;

      const hours = Math.round((durationMs / MS_PER_HOUR) * 10) / 10;

      // プランの開始日に紐づける
      for (const date of dates) {
        if (isSameDay(plan.startDate, date)) {
          const key = format(date, 'yyyy-MM-dd');
          const current = usage.get(key);
          if (current) {
            if (plan.type === 'record') {
              current.recordHours = Math.round((current.recordHours + hours) * 10) / 10;
            } else {
              current.planHours = Math.round((current.planHours + hours) * 10) / 10;
            }
          }
          break;
        }
      }
    }

    return usage;
  }, [plans, dates]);
}
