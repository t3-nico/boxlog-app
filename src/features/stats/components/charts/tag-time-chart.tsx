'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/trpc'

type TagTimeData = {
  tagId: string
  name: string
  color: string
  hours: number
}

type ChartDataItem = {
  name: string
  hours: number
  fill: string
}

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`
  }
  return `${hours.toFixed(1)}h`
}

export function TagTimeChart() {
  // @ts-expect-error - TypeScript型キャッシュの問題。実行時は正常動作
  const { data: rawData, isLoading } = api.plans.getTimeByTag.useQuery()
  const data = rawData as TagTimeData[] | undefined

  if (isLoading) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>タグ別時間</CardTitle>
          <CardDescription>タグごとの作業時間</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>タグ別時間</CardTitle>
          <CardDescription>タグごとの作業時間</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-32 items-center justify-center">データがありません</div>
        </CardContent>
      </Card>
    )
  }

  // 上位10件に絞る
  const chartData: ChartDataItem[] = data.slice(0, 10).map((item: TagTimeData) => ({
    name: item.name,
    hours: item.hours,
    fill: item.color,
  }))

  // 合計時間
  const totalHours = data.reduce((sum: number, item: TagTimeData) => sum + item.hours, 0)

  // ChartConfigを動的に生成
  const chartConfig = chartData.reduce((config: ChartConfig, item: ChartDataItem) => {
    config[item.name] = {
      label: item.name,
      color: item.fill,
    }
    return config
  }, {} as ChartConfig)

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle>タグ別時間</CardTitle>
        <CardDescription>
          合計 {formatHours(totalHours)} - 上位{Math.min(data.length, 10)}タグ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={80}
              tickFormatter={(value) => (value.length > 10 ? `${value.slice(0, 10)}...` : value)}
            />
            <XAxis dataKey="hours" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value) => formatHours(Number(value))} hideLabel />}
            />
            <Bar dataKey="hours" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
