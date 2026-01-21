import type { Locale } from '@/lib/i18n';
import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';
import { getTranslations } from 'next-intl/server';

import { CalendarViewClient } from './[view]/client';

/**
 * Route Segment Config
 *
 * カレンダーはリアルタイムデータを表示するため、常に動的レンダリング
 */
export const dynamic = 'force-dynamic';

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
  // タグ関連もプリフェッチして初期読み込みを高速化
  const helpers = await createServerHelpers();
  await Promise.all([
    helpers.plans.list.prefetch({}),
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
