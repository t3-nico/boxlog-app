import type { CalendarViewType } from '@/features/calendar';
import { calculateViewDateRange } from '@/features/calendar';
import { createServerHelpers, dehydrate } from '@/lib/trpc/server';

/**
 * カレンダービュー用 prefetch（day/week/Nday）
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
    helpers.entries.list.prefetch(dateFilter),
    helpers.entries.getTagStats.prefetch(),
    helpers.tags.list.prefetch(),
  ]);

  return { helpers, dehydratedState: dehydrate(helpers.queryClient) };
}
