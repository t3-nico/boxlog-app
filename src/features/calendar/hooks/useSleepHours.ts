'use client';

import { useMemo } from 'react';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';

export interface SleepHoursRange {
  /** 上部の睡眠時間帯（0:00〜起床時間）- 日跨ぎの場合に存在 */
  morningRange: { startHour: 0; endHour: number } | null;
  /** 下部の睡眠時間帯（就寝時間〜24:00）- 日跨ぎの場合に存在 */
  eveningRange: { startHour: number; endHour: 24 } | null;
  /** 就寝時刻（0-23） */
  bedtime: number;
  /** 起床時刻（0-23） */
  wakeTime: number;
  /** 総睡眠時間（時間） */
  totalHours: number;
}

/**
 * 睡眠スケジュール設定から睡眠時間帯を計算するhook
 * 日跨ぎの睡眠時間帯（例：23:00-7:00）を上部/下部に分割して返す
 */
export function useSleepHours(): SleepHoursRange | null {
  const sleepSchedule = useCalendarSettingsStore((state) => state.sleepSchedule);

  return useMemo(() => {
    if (!sleepSchedule.enabled) {
      return null;
    }

    const { bedtime, wakeTime } = sleepSchedule;

    // 総睡眠時間を計算
    let totalHours: number;
    if (bedtime >= wakeTime) {
      // 日跨ぎ（例：23:00-7:00）
      totalHours = 24 - bedtime + wakeTime;
    } else {
      // 同日（例：1:00-9:00）
      totalHours = wakeTime - bedtime;
    }

    // 日跨ぎかどうかを判定
    const isCrossingMidnight = bedtime >= wakeTime;

    if (isCrossingMidnight) {
      // 日跨ぎの場合（例：23:00-7:00）
      // → 上部: 0:00-7:00, 下部: 23:00-24:00
      return {
        morningRange: { startHour: 0 as const, endHour: wakeTime },
        eveningRange: { startHour: bedtime, endHour: 24 as const },
        bedtime,
        wakeTime,
        totalHours,
      };
    } else {
      // 日跨ぎなしの場合（例：1:00-9:00）
      // → 上部のみ: 1:00-9:00（ただし0時からの場合）
      if (bedtime === 0) {
        return {
          morningRange: { startHour: 0 as const, endHour: wakeTime },
          eveningRange: null,
          bedtime,
          wakeTime,
          totalHours,
        };
      } else {
        // 中間の時間帯（通常ありえないが念のため）
        // 例：1:00-9:00 → 上部なし、下部もなし（特殊ケース）
        // この場合は上部として扱う
        return {
          morningRange: { startHour: 0 as const, endHour: wakeTime },
          eveningRange: { startHour: bedtime, endHour: 24 as const },
          bedtime,
          wakeTime,
          totalHours,
        };
      }
    }
  }, [sleepSchedule]);
}

/**
 * 睡眠時間帯の折りたたみ時のグリッド高さを計算
 */
export function calculateCollapsedGridHeight(
  sleepHours: SleepHoursRange | null,
  hourHeight: number,
  collapsedHeight: number,
): number {
  if (!sleepHours) {
    return 24 * hourHeight;
  }

  let height = 0;

  // 上部の折りたたみセクション
  if (sleepHours.morningRange) {
    height += collapsedHeight;
  }

  // 通常の時間帯
  const normalStartHour = sleepHours.morningRange?.endHour ?? 0;
  const normalEndHour = sleepHours.eveningRange?.startHour ?? 24;
  height += (normalEndHour - normalStartHour) * hourHeight;

  // 下部の折りたたみセクション
  if (sleepHours.eveningRange) {
    height += collapsedHeight;
  }

  return height;
}

/**
 * 指定した時間が睡眠時間帯に含まれるかチェック
 */
export function isInSleepRange(hour: number, sleepHours: SleepHoursRange | null): boolean {
  if (!sleepHours) {
    return false;
  }

  if (sleepHours.morningRange && hour >= 0 && hour < sleepHours.morningRange.endHour) {
    return true;
  }

  if (sleepHours.eveningRange && hour >= sleepHours.eveningRange.startHour && hour < 24) {
    return true;
  }

  return false;
}

/**
 * 指定した時間範囲が睡眠時間帯と重複する時間を計算（分単位）
 */
export function calculateOverlapWithSleep(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  sleepHours: SleepHoursRange | null,
): number {
  if (!sleepHours) {
    return 0;
  }

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  let overlapMinutes = 0;

  // 上部の睡眠時間帯との重複
  if (sleepHours.morningRange) {
    const sleepStart = 0;
    const sleepEnd = sleepHours.morningRange.endHour * 60;
    const overlapStart = Math.max(startTime, sleepStart);
    const overlapEnd = Math.min(endTime, sleepEnd);
    if (overlapEnd > overlapStart) {
      overlapMinutes += overlapEnd - overlapStart;
    }
  }

  // 下部の睡眠時間帯との重複
  if (sleepHours.eveningRange) {
    const sleepStart = sleepHours.eveningRange.startHour * 60;
    const sleepEnd = 24 * 60;
    const overlapStart = Math.max(startTime, sleepStart);
    const overlapEnd = Math.min(endTime, sleepEnd);
    if (overlapEnd > overlapStart) {
      overlapMinutes += overlapEnd - overlapStart;
    }
  }

  return overlapMinutes;
}
