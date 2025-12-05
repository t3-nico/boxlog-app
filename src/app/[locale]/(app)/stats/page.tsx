'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

import { Skeleton } from '@/components/ui/skeleton'
import { StatsPageHeader } from '@/features/stats/components/StatsPageHeader'

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
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 1. ヘッダー：タイトル */}
      <StatsPageHeader />

      {/* 2. ナビゲーション：セクション名 */}
      <div className="flex h-12 shrink-0 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">{t('stats.sidebar.overview')}</h2>
          <span className="text-muted-foreground text-xs">— {t('stats.overview.subtitle')}</span>
        </div>
      </div>

      {/* 3. コンテンツ：スクロール可能エリア */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-7xl space-y-6">
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
      </div>
    </div>
  )
}
