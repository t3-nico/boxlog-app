'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { date: '2024-10-14', completed: 12, pending: 5 },
  { date: '2024-10-15', completed: 15, pending: 8 },
  { date: '2024-10-16', completed: 10, pending: 6 },
  { date: '2024-10-17', completed: 18, pending: 4 },
  { date: '2024-10-18', completed: 22, pending: 7 },
  { date: '2024-10-19', completed: 20, pending: 5 },
  { date: '2024-10-20', completed: 25, pending: 3 },
];

// 意味ベース → セマンティックカラー使用
const chartConfig = {
  completed: {
    label: '完了',
    color: 'var(--color-chart-success)',
  },
  pending: {
    label: '未完了',
    color: 'var(--color-chart-warning)',
  },
} satisfies ChartConfig;

export function AreaChartInteractive() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>週間タスク推移</CardTitle>
        <CardDescription>過去7日間のタスク完了・未完了数</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="pending"
              type="natural"
              fill="var(--color-pending)"
              fillOpacity={0.4}
              stroke="var(--color-pending)"
              stackId="a"
            />
            <Area
              dataKey="completed"
              type="natural"
              fill="var(--color-completed)"
              fillOpacity={0.4}
              stroke="var(--color-completed)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
