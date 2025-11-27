'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ArrowRight, CheckCircle2, Clock, FolderKanban, Tag, Target, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/features/i18n/lib/hooks'
import { LineChartMultiple } from '@/features/stats/components/charts'

/**
 * 統計ページ - 概要ダッシュボード
 *
 * サマリーカードと各セクションへのクイックアクセスを提供
 */
export default function StatsPage() {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  const baseUrl = `/${localeFromPath}/stats`

  // クイックアクセスカードの定義
  const quickAccessCards = [
    {
      href: `${baseUrl}/tasks`,
      title: t('stats.sidebar.tasks'),
      description: t('stats.overview.tasksDescription'),
      icon: <CheckCircle2 className="size-5" />,
    },
    {
      href: `${baseUrl}/time`,
      title: t('stats.sidebar.time'),
      description: t('stats.overview.timeDescription'),
      icon: <Clock className="size-5" />,
    },
    {
      href: `${baseUrl}/categories`,
      title: t('stats.sidebar.categories'),
      description: t('stats.overview.categoriesDescription'),
      icon: <FolderKanban className="size-5" />,
    },
    {
      href: `${baseUrl}/tag-analysis`,
      title: t('stats.sidebar.tagAnalysis'),
      description: t('stats.overview.tagAnalysisDescription'),
      icon: <Tag className="size-5" />,
    },
    {
      href: `${baseUrl}/trends`,
      title: t('stats.sidebar.trends'),
      description: t('stats.overview.trendsDescription'),
      icon: <TrendingUp className="size-5" />,
    },
    {
      href: `${baseUrl}/goals`,
      title: t('stats.goals'),
      description: t('stats.overview.goalsDescription'),
      icon: <Target className="size-5" />,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ページタイトル */}
      <div>
        <h1 className="text-2xl font-bold">{t('stats.sidebar.overview')}</h1>
        <p className="text-muted-foreground text-sm">{t('stats.overview.subtitle')}</p>
      </div>

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

      {/* 週間トレンド（情報表示系: 背景なし、ボーダーのみ） */}
      <Card className="bg-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('stats.overview.weeklyTrend')}</CardTitle>
              <CardDescription>{t('stats.overview.weeklyTrendDescription')}</CardDescription>
            </div>
            <Link
              href={`${baseUrl}/trends`}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
            >
              {t('stats.overview.viewDetails')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <LineChartMultiple />
        </CardContent>
      </Card>

      {/* クイックアクセス（クリック可能: カード背景あり） */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t('stats.overview.quickAccess')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickAccessCards.map((card) => (
            <Link key={card.href} href={card.href} prefetch={true}>
              <Card className="hover:bg-foreground/8 h-full transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-muted-foreground">{card.icon}</div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
