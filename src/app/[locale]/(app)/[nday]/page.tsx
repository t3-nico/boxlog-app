import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import type { MultiDayViewType } from '@/features/calendar';
import type { Locale } from '@/i18n/routing';
import { HydrationBoundary } from '@/lib/trpc/server';

import { prefetchCalendarData } from '../_helpers/calendar-prefetch';
import { CalendarViewClient } from '../_helpers/CalendarViewClient';
import { getCalendarTranslations, parseDateParam } from '../_helpers/page-utils';

export const dynamic = 'force-dynamic';

/**
 * 有効な multi-day ビュー（2day〜9day）かバリデーション
 */
function parseMultiDay(nday: string): MultiDayViewType | null {
  const match = nday.match(/^(\d+)day$/);
  if (!match) return null;
  const n = parseInt(match[1]!);
  if (n < 2 || n > 9) return null;
  return nday as MultiDayViewType;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nday: string; locale?: Locale }>;
}): Promise<Metadata> {
  const { nday, locale = 'ja' } = await params;
  const t = await getTranslations({ locale, namespace: 'calendar' });

  const match = nday.match(/^(\d+)day$/);
  const viewTitle = match ? t('views.multiday', { count: parseInt(match[1]!) }) : t('title');

  return {
    title: viewTitle,
    description: t('meta.description'),
  };
}

const MultiDayPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ nday: string; locale?: Locale }>;
  searchParams: Promise<{ date?: string }>;
}) => {
  const { nday, locale = 'ja' } = await params;
  const { date } = await searchParams;

  const viewType = parseMultiDay(nday);
  if (!viewType) {
    notFound();
  }

  const initialDate = parseDateParam(date);
  const targetDate = initialDate ?? new Date();
  const translations = await getCalendarTranslations(locale);
  const { dehydratedState } = await prefetchCalendarData(viewType, targetDate);

  return (
    <HydrationBoundary state={dehydratedState}>
      <CalendarViewClient
        view={viewType}
        initialDate={initialDate ?? null}
        translations={translations}
      />
    </HydrationBoundary>
  );
};

export default MultiDayPage;
