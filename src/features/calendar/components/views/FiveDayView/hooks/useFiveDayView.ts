import { useCallback } from 'react';

import { useCurrentPeriod, useDateUtilities, usePlansByDate } from '../../shared';
import type { UseFiveDayViewOptions, UseFiveDayViewReturn } from '../FiveDayView.types';

/**
 * FiveDayView専用のロジックを管理するフック
 *
 * @description
 * - centerDateの前後2日を含む5日間を生成
 * - [day-2, day-1, today, day+1, day+2] の配列
 * - イベントを日付ごとにグループ化
 */
export function useFiveDayView({
  centerDate,
  events = [],
  showWeekends = true,
}: UseFiveDayViewOptions & { showWeekends?: boolean }): UseFiveDayViewReturn {
  // Phase 3統合フック: 5日間の日付を生成（centerDateを中心に前後2日）
  const { dates: fiveDayDates } = useDateUtilities({
    referenceDate: centerDate,
    viewType: 'fiveday',
    showWeekends,
  });

  // Phase 3統合フック: 現在期間判定とtodayIndex計算、相対インデックス計算
  const { isCurrentPeriod: isCurrentDay, todayIndex } = useCurrentPeriod({
    dates: fiveDayDates,
    periodType: 'fiveday',
  });

  // 中央の日付のインデックス（常に2）
  const centerIndex = 2;

  // Phase 3統合フック: プラン日付グループ化
  const { plansByDate: eventsByDate } = usePlansByDate({
    dates: fiveDayDates,
    plans: events,
    sortType: 'standard',
  });

  // スクロール処理はScrollableCalendarLayoutに委譲
  const scrollToNow = useCallback(() => {
    // ScrollableCalendarLayoutが処理するため、ここでは何もしない
  }, []);

  return {
    fiveDayDates,
    eventsByDate,
    centerIndex,
    todayIndex,
    isCurrentDay,
    scrollToNow,
  };
}
