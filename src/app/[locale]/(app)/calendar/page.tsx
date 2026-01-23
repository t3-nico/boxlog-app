import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { calculateViewDateRange } from '@/features/calendar/lib/view-helpers';
import type { Locale } from '@/lib/i18n';
import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';

import { CalendarViewClient } from './[view]/client';

/**
 * Route Segment Config
 *
 * カレンダーはリアルタイムデータを表示するため、常に動的レンダリング
 */
export const dynamic = 'force-dynamic';

/**
 * メタデータ生成
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calendar' });

  return {
    title: t('views.day'),
    description: t('meta.description'),
  };
}

interface CalendarPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ date?: string }>;
}

/**
 * カレンダールートページ
 *
 * リダイレクトではなく、直接 day ビューをレンダリング（パフォーマンス最適化）
 * 以前: redirect → /calendar/day?date=today（余分なSSR処理）
 * 現在: 直接レンダリング（リダイレクト不要）+ Server-side prefetch
 */
export default async function CalendarPage({ params, searchParams }: CalendarPageProps) {
  const { locale } = await params;
  const { date } = await searchParams;

  // 日付パラメータの解析（なければ今日）
  let initialDate: Date | undefined;
  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      initialDate = parsedDate;
    }
  }

  // サーバーサイドで翻訳辞書を取得
  const t = await getTranslations({ locale });

  const translations = {
    errorTitle: t('calendar.errors.loadFailed'),
    errorMessage: t('calendar.errors.displayFailed'),
    reloadButton: t('common.reload'),
  };

  // Server-side prefetch: クライアントでのデータ取得を高速化
  // クライアントと同じクエリキーでprefetchしてキャッシュヒット率を向上
  const helpers = await createServerHelpers();

  // 日付範囲を計算（dayビューのデフォルト）
  // weekStartsOnはZustandストアなのでSSRではデフォルト値1（月曜日）を使用
  const targetDate = initialDate ?? new Date();
  const viewDateRange = calculateViewDateRange('day', targetDate, 1);
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
        view="day"
        initialDate={initialDate ?? null}
        translations={translations}
      />
    </HydrationBoundary>
  );
}
