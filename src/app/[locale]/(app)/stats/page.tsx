import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { StatsPageContent } from '@/features/stats/components/StatsPageContent';
import { prefetchStatsData } from '@/features/stats/lib/prefetch';
import type { Locale } from '@/i18n/routing';
import { HydrationBoundary } from '@/lib/trpc/server';

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
      <StatsPageContent />
    </HydrationBoundary>
  );
};

export default StatsPage;
