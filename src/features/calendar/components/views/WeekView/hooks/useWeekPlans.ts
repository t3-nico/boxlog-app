import { useMemo } from 'react';

import { isSameDay } from 'date-fns';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { getDateKey, isValidEvent, sortEventsByDateKeys } from '../../shared';
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants';
import type { UseWeekPlansOptions, UseWeekPlansReturn, WeekPlanPosition } from '../WeekView.types';

/**
 * 週ビューでのプラン位置計算専用フック
 *
 * @description
 * - プランの重なり検出
 * - 位置とサイズの計算
 * - 最大同時プラン数の算出
 */
export function useWeekPlans({
  weekDates,
  events: plans = [],
}: UseWeekPlansOptions): UseWeekPlansReturn {
  // プランを日付ごとにグループ化
  const plansByDate = useMemo(() => {
    const grouped: Record<string, CalendarPlan[]> = {};

    // 各日付のキーを初期化
    weekDates.forEach((date) => {
      const dateKey = getDateKey(date);
      if (!(dateKey in grouped)) {
        grouped[dateKey] = [];
      }
    });

    // プランを適切な日付に配置
    plans.forEach((plan) => {
      if (!isValidEvent(plan)) return;

      // startDateがnullまたはundefinedの場合はスキップ
      if (!plan.startDate) return;

      const planStart = plan.startDate instanceof Date ? plan.startDate : new Date(plan.startDate);

      // 無効な日付は除外
      if (isNaN(planStart.getTime())) return;

      // 週の範囲内の日付を確認
      weekDates.forEach((date) => {
        if (isSameDay(planStart, date)) {
          const dateKey = getDateKey(date);
          if (Object.prototype.hasOwnProperty.call(grouped, dateKey) && grouped[dateKey]) {
            grouped[dateKey].push(plan);
          }
        }
      });
    });

    // 各日のプランを時刻順にソート
    return sortEventsByDateKeys(grouped);
  }, [weekDates, plans]);

  // プランの位置情報を計算
  const planPositions = useMemo(() => {
    const positions: WeekPlanPosition[] = [];

    const dayColumnWidth = weekDates.length > 0 ? 100 / weekDates.length : 100;

    weekDates.forEach((date, dayIndex) => {
      const dateKey = getDateKey(date);
      const dayPlans =
        (Object.prototype.hasOwnProperty.call(plansByDate, dateKey)
          ? plansByDate[dateKey]
          : null) || [];

      // その日のプランの重なりを検出
      const planColumns = calculatePlanColumns(dayPlans);

      dayPlans.forEach((plan, planIndex) => {
        if (!plan.startDate) return;

        // 時刻からピクセル位置を計算
        const startHour = plan.startDate.getHours();
        const startMinute = plan.startDate.getMinutes();
        const top = (startHour + startMinute / 60) * HOUR_HEIGHT;

        // 終了時刻から高さを計算
        let height = HOUR_HEIGHT; // デフォルト1時間
        if (plan.endDate) {
          const endHour = plan.endDate.getHours();
          const endMinute = plan.endDate.getMinutes();
          const duration = endHour + endMinute / 60 - (startHour + startMinute / 60);
          height = Math.max(20, duration * HOUR_HEIGHT); // 最小20px
        }

        // 重なりがある場合の列計算
        const columnInfo = planColumns[planIndex] ?? { column: 0, totalColumns: 1 };
        const columnWidth = dayColumnWidth / columnInfo.totalColumns;
        const left = dayIndex * dayColumnWidth + columnInfo.column * columnWidth;
        const width = columnWidth * 0.95; // 少し余白を作る

        positions.push({
          plan,
          dayIndex,
          top,
          height,
          left,
          width,
          zIndex: 20 + columnInfo.column,
          column: columnInfo.column,
          totalColumns: columnInfo.totalColumns,
        });
      });
    });

    return positions;
  }, [weekDates, plansByDate]);

  // 最大同時プラン数を計算
  const maxConcurrentPlans = useMemo(() => {
    let maxConcurrent = 0;

    Object.values(plansByDate).forEach((dayPlans) => {
      if (dayPlans.length <= 1) return;

      // 時間帯ごとの重なりを計算
      const timeSlots: { start: number; end: number }[] = [];

      dayPlans.forEach((plan) => {
        if (!plan.startDate) return;

        const start = plan.startDate.getHours() + plan.startDate.getMinutes() / 60;
        const end = plan.endDate
          ? plan.endDate.getHours() + plan.endDate.getMinutes() / 60
          : start + 1;

        timeSlots.push({ start, end });
      });

      // 各時刻での重なり数を計算
      for (let hour = 0; hour < 24; hour += 0.25) {
        const concurrent = timeSlots.filter((slot) => hour >= slot.start && hour < slot.end).length;

        maxConcurrent = Math.max(maxConcurrent, concurrent);
      }
    });

    return maxConcurrent;
  }, [plansByDate]);

  return {
    plansByDate,
    planPositions,
    maxConcurrentPlans,
  };
}

/**
 * プランの重なりを検出して列配置を計算
 */
function calculatePlanColumns(
  plans: CalendarPlan[],
): Array<{ column: number; totalColumns: number }> {
  if (plans.length === 0) return [];

  // 時間順にソート済みと仮定
  const columns: Array<{ column: number; totalColumns: number }> = [];
  const occupiedColumns: Array<{ end: number }> = [];

  plans.forEach((plan) => {
    if (!plan.startDate) {
      columns.push({ column: 0, totalColumns: 1 });
      return;
    }

    const start = plan.startDate.getHours() + plan.startDate.getMinutes() / 60;
    const end = plan.endDate ? plan.endDate.getHours() + plan.endDate.getMinutes() / 60 : start + 1;

    // 利用可能な列を探す
    let columnIndex = 0;
    while (columnIndex < occupiedColumns.length) {
      const col = occupiedColumns[columnIndex];
      if (!col || col.end <= start) break;
      columnIndex++;
    }

    // 列を占有
    if (columnIndex >= occupiedColumns.length) {
      occupiedColumns.push({ end });
    } else {
      const col = occupiedColumns[columnIndex];
      if (col) {
        col.end = end;
      }
    }

    columns.push({
      column: columnIndex,
      totalColumns: Math.max(occupiedColumns.length, 1),
    });
  });

  // すべてのプランの totalColumns を統一
  const maxColumns = Math.max(...columns.map((col) => col.totalColumns), 1);
  return columns.map((col) => ({
    ...col,
    totalColumns: maxColumns,
  }));
}
