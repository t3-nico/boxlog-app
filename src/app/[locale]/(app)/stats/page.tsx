'use client'

import { BarChart3, CheckCircle2, Clock, FolderKanban, Tag, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  AreaChartInteractive,
  BarChartHorizontal,
  LineChartMultiple,
  PieChartDonut,
} from '@/features/stats/components/charts'

const StatsPage = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <Tabs defaultValue="overview" className="w-full">
        {/* タブバー */}
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">概要</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden md:inline">タスク統計</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">時間分析</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            <span className="hidden md:inline">カテゴリ別</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden md:inline">タグ別</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">トレンド</span>
          </TabsTrigger>
        </TabsList>

        {/* 概要 */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <h3 className="text-2xl font-bold">概要</h3>
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
        </TabsContent>

        {/* タスク統計 */}
        <TabsContent value="tasks" className="mt-6">
          <h3 className="mb-4 text-2xl font-bold">タスク統計</h3>
          <AreaChartInteractive />
        </TabsContent>

        {/* 時間分析 */}
        <TabsContent value="time" className="mt-6">
          <h3 className="mb-4 text-2xl font-bold">時間分析</h3>
          <BarChartHorizontal />
        </TabsContent>

        {/* カテゴリ別 */}
        <TabsContent value="categories" className="mt-6">
          <h3 className="mb-4 text-2xl font-bold">カテゴリ別</h3>
          <PieChartDonut />
        </TabsContent>

        {/* タグ別 */}
        <TabsContent value="tags" className="mt-6">
          <h3 className="mb-4 text-2xl font-bold">タグ別</h3>
          <PieChartDonut />
        </TabsContent>

        {/* トレンド */}
        <TabsContent value="trends" className="mt-6">
          <h3 className="mb-4 text-2xl font-bold">トレンド</h3>
          <LineChartMultiple />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StatsPage
