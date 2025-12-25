import { useIsToday } from '../../shared/hooks/useIsToday';
import { usePlanStyles } from '../../shared/hooks/usePlanStyles';
import { useTimeSlots } from '../../shared/hooks/useTimeSlots';
import type { UseDayViewOptions, UseDayViewReturn } from '../DayView.types';

import { useDayPlans } from './useDayPlans';

export function useDayView({
  date,
  plans,
  onPlanUpdate: _onPlanUpdate,
}: UseDayViewOptions): UseDayViewReturn {
  // プランデータ処理
  const { dayPlans, planPositions } = useDayPlans({ date, plans });

  // 今日かどうかの判定
  const isTodayFlag = useIsToday(date);

  // 時間スロットの生成（0:00-23:45、15分間隔）
  const timeSlots = useTimeSlots();

  // プランのCSSスタイルを計算
  const planStyles = usePlanStyles(planPositions);

  // スクロール処理はScrollableCalendarLayoutに委譲

  return {
    dayPlans,
    planStyles,
    isToday: isTodayFlag,
    timeSlots,
  };
}
