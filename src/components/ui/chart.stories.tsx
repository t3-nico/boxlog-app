import type { Meta, StoryObj } from '@storybook/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './chart';

const meta = {
  title: 'Components/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルデータ
const barData = [
  { month: '1月', desktop: 186, mobile: 80 },
  { month: '2月', desktop: 305, mobile: 200 },
  { month: '3月', desktop: 237, mobile: 120 },
  { month: '4月', desktop: 73, mobile: 190 },
  { month: '5月', desktop: 209, mobile: 130 },
  { month: '6月', desktop: 214, mobile: 140 },
];

const areaData = [
  { date: '2024-01-01', plan: 4, record: 3 },
  { date: '2024-01-02', plan: 6, record: 5 },
  { date: '2024-01-03', plan: 8, record: 7 },
  { date: '2024-01-04', plan: 5, record: 4 },
  { date: '2024-01-05', plan: 9, record: 8 },
  { date: '2024-01-06', plan: 7, record: 6 },
  { date: '2024-01-07', plan: 10, record: 9 },
];

const pieData = [
  { name: '仕事', value: 45, fill: 'var(--chart-1)' },
  { name: '個人', value: 25, fill: 'var(--chart-2)' },
  { name: '学習', value: 20, fill: 'var(--chart-3)' },
  { name: 'その他', value: 10, fill: 'var(--chart-4)' },
];

export const AllPatterns: Story = {
  args: {
    config: {},
    children: <div />,
  },
  render: () => {
    // 比較用チャートコンフィグ
    const barChartConfig = {
      desktop: {
        label: 'Desktop',
        color: 'var(--chart-1)',
      },
      mobile: {
        label: 'Mobile',
        color: 'var(--chart-2)',
      },
    } satisfies ChartConfig;

    // 意味ベースチャートコンフィグ
    const areaChartConfig = {
      plan: {
        label: '予定',
        color: 'var(--color-chart-primary)',
      },
      record: {
        label: '実績',
        color: 'var(--color-chart-success)',
      },
    } satisfies ChartConfig;

    // 円グラフ用コンフィグ
    const pieChartConfig = {
      仕事: { label: '仕事', color: 'var(--chart-1)' },
      個人: { label: '個人', color: 'var(--chart-2)' },
      学習: { label: '学習', color: 'var(--chart-3)' },
      その他: { label: 'その他', color: 'var(--chart-4)' },
    } satisfies ChartConfig;

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">Chart</h1>
        <p className="text-muted-foreground mb-8">
          Recharts + shadcn/uiラッパー。統計画面で使用。ChartConfigでカラー管理。
        </p>

        <div className="grid gap-8" style={{ maxWidth: '64rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">BarChart（横棒グラフ）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              カテゴリ比較。TagTimeChartで使用。Comparison系カラー。
            </p>
            <ChartContainer config={barChartConfig} className="h-64 w-full">
              <BarChart data={barData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="month" type="category" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">AreaChart（エリアチャート）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              時系列推移。MonthlyTrendChartで使用。Semantic系カラー。
            </p>
            <ChartContainer config={areaChartConfig} className="h-64 w-full">
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="plan"
                  stroke="var(--color-plan)"
                  fill="var(--color-plan)"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="record"
                  stroke="var(--color-record)"
                  fill="var(--color-record)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">PieChart（ドーナツ）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              割合表示。TagDistributionで使用。innerRadiusでドーナツ化。
            </p>
            <ChartContainer config={pieChartConfig} className="mx-auto h-64 w-64">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">カラーシステム</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <h3 className="text-foreground mb-2 font-bold">Comparison（比較用、shadcn準拠）</h3>
              <div className="mb-4 flex gap-4">
                {['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].map((name) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className="size-8 rounded" style={{ backgroundColor: `var(--${name})` }} />
                    <span className="text-muted-foreground text-xs">{name}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-foreground mb-2 font-bold">Semantic（意味ベース）</h3>
              <div className="flex gap-4">
                {[
                  { name: 'primary', var: '--color-chart-primary' },
                  { name: 'success', var: '--color-chart-success' },
                  { name: 'warning', var: '--color-chart-warning' },
                  { name: 'destructive', var: '--color-chart-destructive' },
                ].map((item) => (
                  <div key={item.name} className="flex flex-col items-center gap-1">
                    <div
                      className="size-8 rounded"
                      style={{ backgroundColor: `var(${item.var})` }}
                    />
                    <span className="text-muted-foreground text-xs">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>ChartContainer - ルートコンテナ（ChartConfig提供、CSS変数注入）</li>
                <li>ChartTooltip - ツールチップ（Recharts Tooltip）</li>
                <li>ChartTooltipContent - ツールチップコンテンツ（カスタムスタイル）</li>
                <li>ChartLegend - 凡例（Recharts Legend）</li>
                <li>ChartLegendContent - 凡例コンテンツ（カスタムスタイル）</li>
                <li>ChartConfig - カラー・ラベル定義（satisfiesで型安全）</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>TagTimeChart - タグ別時間の横棒グラフ</li>
              <li>MonthlyTrendChart - 月別推移のエリアチャート</li>
              <li>DayOfWeekChart - 曜日別のバーチャート</li>
              <li>HourlyDistributionChart - 時間帯別の分布</li>
              <li>PieChartDonut - カテゴリ割合のドーナツ</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
