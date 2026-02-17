import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { calculateViewDateRange } from '@/features/calendar/lib/view-helpers';
import type { CalendarViewType } from '@/features/calendar/types/calendar.types';
import type { Locale } from '@/i18n/routing';
import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { CalendarViewClient } from './client';

/**
 * Route Segment Config
 *
 * カレンダーはリアルタイムデータを表示するため、常に動的レンダリング
 */
export const dynamic = 'force-dynamic';

/**
 * メタデータ生成（ビュータイプに応じたタイトル）
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ view: string; locale?: Locale }>;
}): Promise<Metadata> {
  const { view, locale = 'ja' } = await params;
  const t = await getTranslations({ locale, namespace: 'calendar' });

  // ビュータイプに応じたタイトルを取得
  const multiDayMatch = view.match(/^(\d+)day$/);
  const viewTitle = multiDayMatch
    ? t('views.multiday', { count: parseInt(multiDayMatch[1]!) })
    : t(`views.${view}` as Parameters<typeof t>[0]) || t('title');

  return {
    title: viewTitle,
    description: t('meta.description'),
  };
}

interface CalendarViewPageProps {
  params: Promise<{
    view: string;
    locale?: Locale;
  }>;
  searchParams: Promise<{
    date?: string;
  }>;
}

// 有効なビュータイプかチェック
function isValidViewType(view: string): view is CalendarViewType {
  if (['day', 'week', 'agenda', 'timesheet', 'stats'].includes(view)) return true;
  const match = view.match(/^(\d+)day$/);
  if (match) {
    const n = parseInt(match[1]!);
    return n >= 2 && n <= 9;
  }
  return false;
}

const CalendarViewPage = async ({ params, searchParams }: CalendarViewPageProps) => {
  const { view, locale = 'ja' } = await params;
  const { date } = await searchParams;

  // 有効なビュータイプかチェック
  if (!isValidViewType(view)) {
    redirect(`/${locale}/day`);
  }

  // 日付パラメータの解析
  let initialDate: Date | undefined;
  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      initialDate = parsedDate;
    }
  }

  // サーバーサイドで翻訳辞書を取得
  const t = await getTranslations({ locale });

  // 翻訳テキストを抽出
  const translations = {
    errorTitle: t('calendar.errors.loadFailed'),
    errorMessage: t('calendar.errors.displayFailed'),
    reloadButton: t('common.reload'),
  };

  // Server-side prefetch: クライアントでのデータ取得を高速化
  // クライアントと同じクエリキーでprefetchしてキャッシュヒット率を向上
  const helpers = await createServerHelpers();

  // 日付範囲を計算（ビュータイプに応じた範囲）
  // weekStartsOnはZustandストアなのでSSRではデフォルト値1（月曜日）を使用
  const targetDate = initialDate ?? new Date();
  const viewDateRange = calculateViewDateRange(view, targetDate, 1);
  const dateFilter = {
    startDate: viewDateRange.start.toISOString(),
    endDate: viewDateRange.end.toISOString(),
  };

  await Promise.all([
    // 日付フィルタ付きでprefetch（クライアントと同じクエリキー）
    helpers.plans.list.prefetch(dateFilter),
    helpers.plans.getTagStats.prefetch(),
    helpers.tags.list.prefetch(),
    helpers.tags.listParentTags.prefetch(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <CalendarViewClient
        view={view}
        initialDate={initialDate ?? null}
        translations={translations}
      />
    </HydrationBoundary>
  );
};

export default CalendarViewPage;
