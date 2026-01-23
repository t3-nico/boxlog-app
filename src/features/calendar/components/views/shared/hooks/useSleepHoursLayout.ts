/**
 * 睡眠時間帯のレイアウト計算
 *
 * ScrollableCalendarLayoutから抽出したカスタムフック
 */

import { useMemo } from 'react';

import { format } from 'date-fns';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { COLLAPSED_SECTION_HEIGHT } from '../components/CollapsedSleepSection';

interface SleepHoursInfo {
  wakeTime: number;
  bedtime: number;
  totalHours: number;
}

interface UseSleepHoursLayoutOptions {
  sleepHours: SleepHoursInfo | null;
  sleepHoursCollapsed: boolean;
  hourHeight: number;
  plans?: CalendarPlan[] | undefined;
  displayDates?: Date[] | undefined;
}

interface CollapsedLayout {
  collapsedHeight: number;
  awakeHeight: number;
  awakeStartY: number;
  totalHeight: number;
  wakeTime: number;
  bedtime: number;
}

interface TodayColumnPosition {
  left: string | number;
  width: string;
}

interface UseSleepHoursLayoutReturn {
  collapsedLayout: CollapsedLayout | null;
  gridHeight: number;
  sleepHoursPlanCountByDate: number[];
  todayColumnPosition: TodayColumnPosition | null;
  hasToday: boolean;
}

/**
 * 睡眠時間帯のレイアウト計算フック
 */
export const useSleepHoursLayout = ({
  sleepHours,
  sleepHoursCollapsed,
  hourHeight,
  plans = [],
  displayDates = [],
}: UseSleepHoursLayoutOptions): UseSleepHoursLayoutReturn => {
  // 折りたたみ時のグリッドレイアウト計算
  const collapsedLayout = useMemo(() => {
    if (!sleepHours || !sleepHoursCollapsed) {
      return null;
    }

    const { wakeTime, bedtime, totalHours } = sleepHours;

    // 起きている時間（時間数）= 24時間 - 睡眠時間
    const awakeHours = 24 - totalHours;

    // 折りたたみセクションは上部に1つだけ（睡眠時間帯全体を表示）
    const collapsedHeight = COLLAPSED_SECTION_HEIGHT;
    const awakeHeight = awakeHours * hourHeight;

    // 起きている時間帯の開始位置（Y座標）= 折りたたみセクションの直後
    const awakeStartY = collapsedHeight;

    return {
      collapsedHeight,
      awakeHeight,
      awakeStartY,
      totalHeight: collapsedHeight + awakeHeight,
      // 時間→Y座標変換用
      wakeTime,
      bedtime,
    };
  }, [sleepHours, sleepHoursCollapsed, hourHeight]);

  // グリッド高さ
  const gridHeight = collapsedLayout ? collapsedLayout.totalHeight : 24 * hourHeight;

  // 睡眠時間帯内のプラン数を日ごとに計算
  const sleepHoursPlanCountByDate = useMemo(() => {
    if (!sleepHours || plans.length === 0 || displayDates.length === 0) {
      return [];
    }

    const { wakeTime, bedtime } = sleepHours;
    // 日跨ぎの場合（bedtime >= wakeTime、例: 23:00-07:00）
    const isCrossingMidnight = bedtime >= wakeTime;

    // プランが睡眠時間帯内かどうかをチェック
    const isInSleepHours = (plan: CalendarPlan): boolean => {
      if (!plan.startDate) return false;
      const startHour = new Date(plan.startDate).getHours();

      if (isCrossingMidnight) {
        // 日跨ぎ: 23:00以降 または 7:00未満
        return startHour >= bedtime || startHour < wakeTime;
      } else {
        // 同日: 1:00以上 かつ 9:00未満
        return startHour >= bedtime && startHour < wakeTime;
      }
    };

    // 日ごとにカウント
    return displayDates.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return plans.filter((plan) => {
        if (!plan.startDate) return false;
        const planDateStr = format(new Date(plan.startDate), 'yyyy-MM-dd');
        return planDateStr === dateStr && isInSleepHours(plan);
      }).length;
    });
  }, [sleepHours, plans, displayDates]);

  // 今日の列の位置を計算
  const todayColumnPosition = useMemo((): TodayColumnPosition | null => {
    if (displayDates.length === 0) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日のインデックスを見つける
    const todayIndex = displayDates.findIndex((date) => {
      if (!date) return false;
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayIndex === -1) {
      return null;
    }

    // 単一日表示の場合
    if (displayDates.length === 1) {
      return {
        left: 0,
        width: '100%',
      };
    }

    // 複数日表示の場合、列の幅と位置を計算
    const columnWidth = 100 / displayDates.length; // パーセント
    const leftPosition = todayIndex * columnWidth; // パーセント

    return {
      left: `${leftPosition}%`,
      width: `${columnWidth}%`,
    };
  }, [displayDates]);

  // 今日が表示範囲に含まれるか
  const hasToday = todayColumnPosition !== null;

  return {
    collapsedLayout,
    gridHeight,
    sleepHoursPlanCountByDate,
    todayColumnPosition,
    hasToday,
  };
};
