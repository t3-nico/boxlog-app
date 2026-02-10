import { useCallback } from 'react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { useCurrentPeriod, useDateUtilities, usePlansByDate } from '../../shared';

export interface UseMultiDayViewOptions {
  centerDate: Date;
  dayCount: number;
  events?: CalendarPlan[];
  showWeekends?: boolean;
}

export interface UseMultiDayViewReturn {
  displayDates: Date[];
  eventsByDate: Record<string, CalendarPlan[]>;
  centerIndex: number;
  todayIndex: number;
  isCurrentDay: boolean;
  scrollToNow: () => void;
}

/**
 * MultiDayView用の汎用フック
 *
 * @description
 * - centerDateを中心にdayCount日間を生成
 * - 2〜9日間に対応
 */
export function useMultiDayView({
  centerDate,
  dayCount,
  events = [],
  showWeekends = true,
}: UseMultiDayViewOptions): UseMultiDayViewReturn {
  const { dates: displayDates } = useDateUtilities({
    referenceDate: centerDate,
    viewType: 'multiday',
    dayCount,
    showWeekends,
  });

  const { isCurrentPeriod: isCurrentDay, todayIndex } = useCurrentPeriod({
    dates: displayDates,
    periodType: 'multiday',
  });

  const centerIndex = Math.floor(dayCount / 2);

  const { plansByDate: eventsByDate } = usePlansByDate({
    dates: displayDates,
    plans: events,
    sortType: 'standard',
  });

  // スクロール処理はScrollableCalendarLayoutに委譲
  const scrollToNow = useCallback(() => {}, []);

  return {
    displayDates,
    eventsByDate,
    centerIndex,
    todayIndex,
    isCurrentDay,
    scrollToNow,
  };
}
