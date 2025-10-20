'use client'

import { CheckCircle2, Clock, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  AreaChartInteractive,
  BarChartHorizontal,
  LineChartMultiple,
  PieChartDonut,
} from '@/features/stats/components/charts'
import { StatsToolbar } from '@/features/stats/components/stats-toolbar'

const StatsPage = () => {
  return (
    <div className="flex h-full flex-col">
      {/* ツールバー */}
      <StatsToolbar />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Overview Section */}
          <section id="overview" className="scroll-mt-6">
            <h3 className="mb-4 text-2xl font-bold">概要</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">完了タスク</CardTitle>
                  <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">245</div>
                  <p className="text-muted-foreground text-xs">
                    <Badge className="bg-green-600 hover:bg-green-700">+12%</Badge> 先週より
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">作業時間</CardTitle>
                  <Clock className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32.5h</div>
                  <p className="text-muted-foreground text-xs">
                    <Badge className="bg-green-600 hover:bg-green-700">+5%</Badge> 先週より
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">達成率</CardTitle>
                  <TrendingUp className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <Progress value={87} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Tasks Section */}
          <section id="tasks" className="scroll-mt-6">
            <h3 className="mb-4 text-2xl font-bold">タスク統計</h3>
            <AreaChartInteractive />
          </section>

          {/* Time Section */}
          <section id="time" className="scroll-mt-6">
            <h3 className="mb-4 text-2xl font-bold">時間分析</h3>
            <BarChartHorizontal />
          </section>

          {/* Categories Section */}
          <section id="categories" className="scroll-mt-6">
            <h3 className="mb-4 text-2xl font-bold">カテゴリ別</h3>
            <PieChartDonut />
          </section>

          {/* Tags Section */}
          <section id="tags" className="scroll-mt-6">
            <h3 className="mb-4 text-2xl font-bold">タグ別</h3>
            <PieChartDonut />
          </section>

          {/* Trends Section */}
          <section id="trends" className="scroll-mt-6">
            <h3 className="mb-4 text-2xl font-bold">トレンド</h3>
            <LineChartMultiple />
          </section>
        </div>
      </div>
    </div>
  )
}

export default StatsPage
