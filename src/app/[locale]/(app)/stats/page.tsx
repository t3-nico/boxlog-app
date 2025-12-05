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

      {/* 年次グリッド */}
      <YearlyHeatmap />

      {/* タグ別時間 */}
      <TagTimeChart />
    </div>
  )
}
