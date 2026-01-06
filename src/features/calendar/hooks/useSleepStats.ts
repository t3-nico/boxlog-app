'use client';

import { useMemo } from 'react';

import { calculateOverlapWithSleep, type SleepHoursRange, useSleepHours } from './useSleepHours';

export interface Plan {
  id: string;
  start_time: string; // ISO形式の日時文字列
  end_time: string; // ISO形式の日時文字列
}

export interface SleepStats {
  /** 設定上の睡眠時間（時間） */
  scheduledHours: number;
  /** 実際の睡眠時間（プラン稼働分減算後、時間） */
  actualHours: number;
  /** 睡眠時間帯内の稼働時間（時間） */
  workDuringSleepHours: number;
  /** 睡眠時間帯内の稼働時間（分） */
  workDuringSleepMinutes: number;
  /** 睡眠時間帯に存在するプランの数 */
  plansInSleepCount: number;
}

/**
 * 日付文字列から時間と分を抽出
 */
function extractTimeFromDate(dateString: string): { hour: number; minute: number } {
  const date = new Date(dateString);
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

/**
 * プランが睡眠時間帯と重複するかチェック
 */
function getPlanOverlapMinutes(plan: Plan, sleepHours: SleepHoursRange): number {
  const start = extractTimeFromDate(plan.start_time);
  const end = extractTimeFromDate(plan.end_time);

  return calculateOverlapWithSleep(start.hour, start.minute, end.hour, end.minute, sleepHours);
}

/**
 * 睡眠時間の統計を計算するhook
 *
 * @param plans その日のプランリスト
 * @returns 睡眠統計情報
 */
export function useSleepStats(plans: Plan[]): SleepStats | null {
  const sleepHours = useSleepHours();

  return useMemo(() => {
    if (!sleepHours) {
      return null;
    }

    // 設定上の睡眠時間
    const scheduledHours = sleepHours.totalHours;

    // 睡眠時間帯内の稼働時間を計算
    let totalWorkMinutes = 0;
    let plansInSleepCount = 0;

    for (const plan of plans) {
      const overlapMinutes = getPlanOverlapMinutes(plan, sleepHours);
      if (overlapMinutes > 0) {
        totalWorkMinutes += overlapMinutes;
        plansInSleepCount++;
      }
    }

    // 時間に変換
    const workDuringSleepHours = totalWorkMinutes / 60;

    // 実際の睡眠時間（設定時間 - 稼働時間）
    const actualHours = Math.max(0, scheduledHours - workDuringSleepHours);

    return {
      scheduledHours,
      actualHours,
      workDuringSleepHours,
      workDuringSleepMinutes: totalWorkMinutes,
      plansInSleepCount,
    };
  }, [sleepHours, plans]);
}

/**
 * 睡眠統計を計算する純粋関数（非hook版）
 * Server Componentsやテストで使用可能
 */
export function calculateSleepStats(
  plans: Plan[],
  sleepHours: SleepHoursRange | null,
): SleepStats | null {
  if (!sleepHours) {
    return null;
  }

  // 設定上の睡眠時間
  const scheduledHours = sleepHours.totalHours;

  // 睡眠時間帯内の稼働時間を計算
  let totalWorkMinutes = 0;
  let plansInSleepCount = 0;

  for (const plan of plans) {
    const overlapMinutes = getPlanOverlapMinutes(plan, sleepHours);
    if (overlapMinutes > 0) {
      totalWorkMinutes += overlapMinutes;
      plansInSleepCount++;
    }
  }

  // 時間に変換
  const workDuringSleepHours = totalWorkMinutes / 60;

  // 実際の睡眠時間（設定時間 - 稼働時間）
  const actualHours = Math.max(0, scheduledHours - workDuringSleepHours);

  return {
    scheduledHours,
    actualHours,
    workDuringSleepHours,
    workDuringSleepMinutes: totalWorkMinutes,
    plansInSleepCount,
  };
}
