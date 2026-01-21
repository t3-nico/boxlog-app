'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';

// LCP改善: Rechartsは重いため遅延ロード（約250KB削減）
const YearlyHeatmap = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.YearlyHeatmap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[200px] w-full" />,
  },
);

const StatsSummary = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.StatsSummary),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
    ),
  },
);

const StreakCard = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.StreakCard),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[160px] w-full" />,
  },
);

const TagTimeChart = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.TagTimeChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
  },
);

const TotalTimeCard = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.TotalTimeCard),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[160px] w-full" />,
  },
);

const HourlyDistributionChart = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.HourlyDistributionChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
  },
);

const DayOfWeekChart = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.DayOfWeekChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
  },
);

const MonthlyTrendChart = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.MonthlyTrendChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
  },
);

const SleepStatsCard = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.SleepStatsCard),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[160px] w-full" />,
  },
);

/**
 * 統計ページ - ダッシュボード（クライアントコンポーネント）
 *
 * 年次グリッド、サマリー、ストリーク、タグ別時間などを表示
 * Rechartsは重いため遅延ロード（ssr: false）
 */
export function StatsContent() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* サマリーカード（完了タスク、今月の作業時間、累計時間） */}
      <StatsSummary />

      {/* 年次グリッド（GitHub風ヒートマップ） */}
      <YearlyHeatmap />

      {/* ストリーク + 睡眠 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StreakCard />
        <SleepStatsCard />
      </div>

      {/* 予定合計時間 + タグ別時間 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TotalTimeCard />
        <TagTimeChart />
      </div>

      {/* 時間帯別 + 曜日別 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HourlyDistributionChart />
        <DayOfWeekChart />
      </div>

      {/* 月次トレンド */}
      <MonthlyTrendChart />
    </div>
  );
}
