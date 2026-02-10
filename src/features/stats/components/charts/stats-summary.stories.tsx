'use client';

import { CheckCircle2, Clock, TrendingDown, TrendingUp } from 'lucide-react';

import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** StatsSummary - 統計サマリーカード群 */
const meta = {
  title: 'Features/Stats/StatsSummary',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Types & Helpers
// ─────────────────────────────────────────────────────────

interface StatsSummaryData {
  completedTasks: number;
  thisWeekCompleted: number;
  thisMonthHours: number;
  monthComparison: number;
  totalHours: number;
  lastMonthHours: number;
}

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  return `${hours.toFixed(1)}h`;
}

/** tRPCなしのプレゼンテーション用コンポーネント */
function StatsSummaryDisplay({ data }: { data: StatsSummaryData }) {
  const isPositive = data.monthComparison >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 完了タスク */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">完了タスク</CardTitle>
          <CheckCircle2 className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.completedTasks}</div>
          <p className="text-muted-foreground text-xs">今週 {data.thisWeekCompleted} 件完了</p>
        </CardContent>
      </Card>

      {/* 今月の作業時間 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">今月の作業時間</CardTitle>
          <Clock className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(data.thisMonthHours)}</div>
          <p className="text-muted-foreground text-xs">
            {isPositive ? (
              <Badge className="bg-success hover:bg-success">+{data.monthComparison}%</Badge>
            ) : (
              <Badge variant="destructive">{data.monthComparison}%</Badge>
            )}{' '}
            前月比
          </p>
        </CardContent>
      </Card>

      {/* 累計時間 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">累計時間</CardTitle>
          {isPositive ? (
            <TrendingUp className="text-muted-foreground size-4" />
          ) : (
            <TrendingDown className="text-muted-foreground size-4" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHours(data.totalHours)}</div>
          <p className="text-muted-foreground text-xs">先月 {formatHours(data.lastMonthHours)}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────

const positiveData: StatsSummaryData = {
  completedTasks: 42,
  thisWeekCompleted: 8,
  thisMonthHours: 64.5,
  monthComparison: 12,
  totalHours: 320.8,
  lastMonthHours: 57.5,
};

const negativeData: StatsSummaryData = {
  completedTasks: 15,
  thisWeekCompleted: 2,
  thisMonthHours: 28.3,
  monthComparison: -18,
  totalHours: 180.2,
  lastMonthHours: 34.5,
};

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** ポジティブトレンド（前月比プラス） */
export const PositiveTrend: Story = {
  render: () => <StatsSummaryDisplay data={positiveData} />,
};

/** ネガティブトレンド（前月比マイナス） */
export const NegativeTrend: Story = {
  render: () => <StatsSummaryDisplay data={negativeData} />,
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <StatsSummaryDisplay data={positiveData} />
      <StatsSummaryDisplay data={negativeData} />
    </div>
  ),
};
