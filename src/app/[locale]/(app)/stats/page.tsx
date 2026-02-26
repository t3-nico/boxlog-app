import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { StatsPageContent, prefetchStatsData } from '@/features/stats';
import type { Locale } from '@/i18n/routing';
import { HydrationBoundary } from '@/lib/trpc/server';

import { renderStatsAsideContent } from './StatsAsideContent';

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
  };
}

const StatsPage = async () => {
  const { dehydratedState } = await prefetchStatsData();

  return (
    <HydrationBoundary state={dehydratedState}>
      <StatsPageContent renderAsideContent={renderStatsAsideContent} />
    </HydrationBoundary>
  );
};

export default StatsPage;
