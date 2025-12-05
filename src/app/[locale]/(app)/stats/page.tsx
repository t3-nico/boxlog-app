'use client'

import dynamic from 'next/dynamic'

import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

// LCP改善: 重いコンポーネントは遅延ロード
const YearlyHeatmap = dynamic(() => import('@/features/stats/components/charts').then((mod) => mod.YearlyHeatmap), {
  ssr: false,
  loading: () => <Skeleton className="h-[200px] w-full" />,
})

const TagTimeChart = dynamic(() => import('@/features/stats/components/charts').then((mod) => mod.TagTimeChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
})

const StatsSummary = dynamic(() => import('@/features/stats/components/charts').then((mod) => mod.StatsSummary), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <Skeleton className="h-[120px] w-full" />
      <Skeleton className="h-[120px] w-full" />
      <Skeleton className="h-[120px] w-full" />
    </div>
  ),
})

const StreakCard = dynamic(() => import('@/features/stats/components/charts').then((mod) => mod.StreakCard), {
  ssr: false,
  loading: () => <Skeleton className="h-[180px] w-full" />,
})

const HourlyDistributionChart = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.HourlyDistributionChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
  }
)

const DayOfWeekChart = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.DayOfWeekChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
  }
)

const MonthlyTrendChart = dynamic(
  () => import('@/features/stats/components/charts').then((mod) => mod.MonthlyTrendChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
  }
)

/**
 * 統計ページ - 概要ダッシュボード
 *
 * 年次グリッドとサマリーを表示
 */
export default function StatsPage() {
  const t = useTranslations()

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ページタイトル */}
      <div>
        <h1 className="text-2xl font-bold">{t('stats.sidebar.overview')}</h1>
        <p className="text-muted-foreground text-sm">{t('stats.overview.subtitle')}</p>
      </div>

      {/* サマリーカード */}
      <StatsSummary />

      {/* ストリーク + 時間帯別（2カラム） */}
      <div className="grid gap-4 md:grid-cols-2">
        <StreakCard />
        <HourlyDistributionChart />
      </div>

      {/* 曜日別 + 月次トレンド（2カラム） */}
      <div className="grid gap-4 md:grid-cols-2">
        <DayOfWeekChart />
        <MonthlyTrendChart />
      </div>

      {/* 年次グリッド */}
      <YearlyHeatmap />

      {/* タグ別時間 */}
      <TagTimeChart />
    </div>
  )
}
