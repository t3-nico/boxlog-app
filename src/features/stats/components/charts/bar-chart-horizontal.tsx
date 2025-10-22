'use client'

import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartData = [
  { time: '00-06', tasks: 2 },
  { time: '06-09', tasks: 8 },
  { time: '09-12', tasks: 15 },
  { time: '12-15', tasks: 12 },
  { time: '15-18', tasks: 18 },
  { time: '18-21', tasks: 10 },
  { time: '21-24', tasks: 5 },
]

const chartConfig = {
  tasks: {
    label: 'タスク数',
    color: 'hsl(217, 91%, 60%)', // 青
  },
} satisfies ChartConfig

export function BarChartHorizontal() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>時間帯別作業分布</CardTitle>
        <CardDescription>1日の作業時間帯パターン</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="time"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <XAxis dataKey="tasks" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="tasks" fill="var(--color-tasks)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
