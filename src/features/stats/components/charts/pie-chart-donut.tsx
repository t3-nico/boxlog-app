'use client'

import { Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartData = [
  { category: '仕事', tasks: 45, fill: 'var(--color-work)' },
  { category: '学習', tasks: 30, fill: 'var(--color-study)' },
  { category: 'プライベート', tasks: 25, fill: 'var(--color-personal)' },
  { category: 'その他', tasks: 15, fill: 'var(--color-other)' },
]

const chartConfig = {
  tasks: {
    label: 'タスク数',
  },
  work: {
    label: '仕事',
    color: 'hsl(217, 91%, 60%)', // 青
  },
  study: {
    label: '学習',
    color: 'hsl(217, 91%, 70%)', // 明るい青
  },
  personal: {
    label: 'プライベート',
    color: 'hsl(217, 91%, 80%)', // より明るい青
  },
  other: {
    label: 'その他',
    color: 'hsl(217, 91%, 90%)', // 最も明るい青
  },
} satisfies ChartConfig

export function PieChartDonut() {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle>カテゴリ別タスク分布</CardTitle>
        <CardDescription>プロジェクト・カテゴリごとの集計</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="tasks" nameKey="category" innerRadius={60} strokeWidth={5}>
              {/* <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          115
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Tasks
                        </tspan>
                      </text>
                    )
                  }
                }}
              /> */}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
