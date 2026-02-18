import { calculateViewDateRange } from '@/features/calendar/lib/view-helpers';
import type { CalendarViewType } from '@/features/calendar/types/calendar.types';
import { createServerHelpers, dehydrate } from '@/lib/trpc/server';

/**
 * カレンダービュー用 prefetch（day/week/agenda/timesheet/Nday）
 *
 * ビュータイプに応じた日付範囲でプランデータを事前取得し、
 * クライアントでのデータ取得を高速化する。
 */
export async function prefetchCalendarData(view: CalendarViewType, targetDate: Date) {
  const helpers = await createServerHelpers();

  // weekStartsOnはZustandストアなのでSSRではデフォルト値1（月曜日）を使用
  const viewDateRange = calculateViewDateRange(view, targetDate, 1);
  const dateFilter = {
    startDate: viewDateRange.start.toISOString(),
    endDate: viewDateRange.end.toISOString(),
  };

  await Promise.all([
    helpers.plans.list.prefetch(dateFilter),
    helpers.plans.getTagStats.prefetch(),
    helpers.tags.list.prefetch(),
    helpers.tags.listParentTags.prefetch(),
  ]);

  return { helpers, dehydratedState: dehydrate(helpers.queryClient) };
}

/**
 * Stats ビュー用 prefetch
 *
 * 統計ビューで使用するデータを事前取得する。
 * カレンダービューとは異なるデータ要件（日付範囲なし、集計データ中心）。
 */
export async function prefetchStatsData() {
  const helpers = await createServerHelpers();

  await Promise.all([
    helpers.plans.getStreak.prefetch(),
    helpers.plans.getDailyHours.prefetch({ year: new Date().getFullYear() }),
    // 以下はデフォルト期間('all')ではinput不要
    helpers.plans.getTimeByTag.prefetch(),
    helpers.plans.getHourlyDistribution.prefetch(),
    helpers.plans.getDayOfWeekDistribution.prefetch(),
    helpers.plans.getMonthlyTrend.prefetch(),
  ]);

  return { helpers, dehydratedState: dehydrate(helpers.queryClient) };
}
