'use client';

import { useTranslations } from 'next-intl';

import { SegmentedControl } from '@/components/ui/segmented-control';

import { useStatsFilterStore } from '../stores/useStatsFilterStore';

/**
 * Stats 期間セレクター
 *
 * Week / Month / Year / All で累積チャートの表示期間を切り替え
 */
export function StatsPeriodSelector() {
  const t = useTranslations('calendar.stats');
  const period = useStatsFilterStore((s) => s.period);
  const setPeriod = useStatsFilterStore((s) => s.setPeriod);

  const options = [
    { value: 'week' as const, label: t('periodWeek') },
    { value: 'month' as const, label: t('periodMonth') },
    { value: 'year' as const, label: t('periodYear') },
    { value: 'all' as const, label: t('periodAll') },
  ];

  return <SegmentedControl options={options} value={period} onChange={setPeriod} />;
}
