import { useMemo } from 'react';

import { isBefore } from 'date-fns';

import type { CalendarPlan } from '../types/calendar.types';

/** 期限切れプランの情報 */
export interface OverduePlan {
  /** 元のプラン */
  plan: CalendarPlan;
  /** 超過分数 */
  overdueMinutes: number;
}

/**
 * 全プランから期限切れ（endDateが過去 & status=open）のプランを抽出する
 *
 * @param plans - カレンダープラン配列
 * @returns 期限切れプラン配列
 */
export function useAllOverduePlans(plans: CalendarPlan[]): OverduePlan[] {
  return useMemo(() => {
    const now = new Date();

    return plans
      .filter((plan) => {
        if (plan.status !== 'open') return false;
        if (!plan.endDate) return false;
        return isBefore(plan.endDate, now);
      })
      .map((plan) => {
        const overdueMinutes = plan.endDate
          ? Math.round((now.getTime() - plan.endDate.getTime()) / 60000)
          : 0;
        return { plan, overdueMinutes };
      });
  }, [plans]);
}
