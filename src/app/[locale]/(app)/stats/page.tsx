'use client'

import dynamic from 'next/dynamic'

import { CheckCircle2, Clock, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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

      {/* 年次グリッド */}
      <YearlyHeatmap />

      {/* タグ別時間 */}
      <TagTimeChart />

      {/* サマリーカード（情報表示系: 背景なし、ボーダーのみ） */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.overview.completedTasks')}</CardTitle>
            <CheckCircle2 className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-muted-foreground text-xs">
              <Badge className="bg-green-600 hover:bg-green-700">+12%</Badge> {t('stats.overview.comparedToLastWeek')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.overview.workHours')}</CardTitle>
            <Clock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.5h</div>
            <p className="text-muted-foreground text-xs">
              <Badge className="bg-green-600 hover:bg-green-700">+5%</Badge> {t('stats.overview.comparedToLastWeek')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.overview.achievementRate')}</CardTitle>
            <TrendingUp className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <Progress value={87} className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
