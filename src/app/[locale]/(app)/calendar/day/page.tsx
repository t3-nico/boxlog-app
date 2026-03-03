import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/i18n/routing';
import { HydrationBoundary } from '@/lib/trpc/server';

import { prefetchCalendarData } from '../_helpers/calendar-prefetch';
import { CalendarViewClient } from '../_helpers/CalendarViewClient';
import { getCalendarTranslations, parseDateParam } from '../_helpers/page-utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: Locale }>;
}): Promise<Metadata> {
  const { locale = 'ja' } = await params;
  const t = await getTranslations({ locale, namespace: 'calendar' });
  return {
    title: t('views.day'),
    description: t('meta.description'),
  };
}

const DayPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: Locale }>;
  searchParams: Promise<{ date?: string }>;
}) => {
  const { locale = 'ja' } = await params;
  const { date } = await searchParams;

  const initialDate = parseDateParam(date);
  const targetDate = initialDate ?? new Date();
  const translations = await getCalendarTranslations(locale);
  const { dehydratedState } = await prefetchCalendarData('day', targetDate);

  return (
    <HydrationBoundary state={dehydratedState}>
      <CalendarViewClient
        view="day"
        initialDate={initialDate ?? null}
        translations={translations}
      />
    </HydrationBoundary>
  );
};

export default DayPage;
