'use client'

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartData = [
  { month: '5月', completed: 186, created: 200 },
  { month: '6月', completed: 205, created: 220 },
  { month: '7月', completed: 237, created: 250 },
  { month: '8月', completed: 273, created: 280 },
  { month: '9月', completed: 209, created: 230 },
  { month: '10月', completed: 245, created: 260 },
]

const chartConfig = {
  completed: {
    label: '完了タスク',
    color: 'hsl(217, 91%, 60%)', // 青
  },
  created: {
    label: '作成タスク',
    color: 'hsl(217, 91%, 80%)', // 明るい青
  },
} satisfies ChartConfig

export function LineChartMultiple() {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle>月次トレンド</CardTitle>
        <CardDescription>過去6ヶ月のタスク推移</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line dataKey="completed" type="monotone" stroke="var(--color-completed)" strokeWidth={2} dot={false} />
            <Line dataKey="created" type="monotone" stroke="var(--color-created)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
