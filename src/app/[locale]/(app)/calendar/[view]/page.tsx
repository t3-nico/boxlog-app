import { redirect } from 'next/navigation';

import type { CalendarViewType } from '@/features/calendar/types/calendar.types';
import type { Locale } from '@/i18n/routing';
import { createServerHelpers, dehydrate, HydrationBoundary } from '@/lib/trpc/server';
import { getTranslations } from 'next-intl/server';

import { CalendarViewClient } from './client';

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
  const validTypes: CalendarViewType[] = ['day', '3day', '5day', 'week', 'agenda'];

  return validTypes.includes(view as CalendarViewType);
}

const CalendarViewPage = async ({ params, searchParams }: CalendarViewPageProps) => {
  const { view, locale = 'ja' } = await params;
  const { date } = await searchParams;

  // 有効なビュータイプかチェック
  if (!isValidViewType(view)) {
    redirect(`/${locale}/calendar/day`);
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
  const helpers = await createServerHelpers();
  await Promise.all([helpers.plans.list.prefetch({}), helpers.plans.getTagStats.prefetch()]);

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
