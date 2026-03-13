import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import type { StatsTab } from '@/features/stats';
import { StatsPageContent, prefetchStatsData } from '@/features/stats';
import type { Locale } from '@/platform/i18n/routing';
import { HydrationBoundary } from '@/platform/trpc/server';
import { PageSwitcher } from '@/shell/layout/PageSwitcher';

const VALID_TABS: StatsTab[] = ['review', 'progress', 'insights'];

function isValidTab(tab: string): tab is StatsTab {
  return (VALID_TABS as string[]).includes(tab);
}

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

const StatsTabPage = async ({ params }: { params: Promise<{ tab: string }> }) => {
  const { tab } = await params;

  if (!isValidTab(tab)) {
    notFound();
  }

  const { dehydratedState } = await prefetchStatsData();

  return (
    <HydrationBoundary state={dehydratedState}>
      <StatsPageContent tab={tab} headerSlot={<PageSwitcher />} />
    </HydrationBoundary>
  );
};

export default StatsTabPage;
