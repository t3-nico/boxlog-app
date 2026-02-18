import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/i18n/routing';
import { HydrationBoundary } from '@/lib/trpc/server';

import { prefetchStatsData } from '../_helpers/calendar-prefetch';
import { CalendarViewClient } from '../_helpers/CalendarViewClient';
import { getCalendarTranslations } from '../_helpers/page-utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: Locale }>;
}): Promise<Metadata> {
  const { locale = 'ja' } = await params;
  const t = await getTranslations({ locale, namespace: 'calendar' });
  return {
    title: t('views.stats'),
    description: t('meta.description'),
  };
}

const StatsPage = async ({ params }: { params: Promise<{ locale?: Locale }> }) => {
  const { locale = 'ja' } = await params;

  const translations = await getCalendarTranslations(locale);
  const { dehydratedState } = await prefetchStatsData();

  return (
    <HydrationBoundary state={dehydratedState}>
      <CalendarViewClient view="stats" initialDate={null} translations={translations} />
    </HydrationBoundary>
  );
};

export default StatsPage;
