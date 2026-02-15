import { Flame, Trophy } from 'lucide-react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** StatsCards - 統計カード（合計時間 + 連続日数） */
const meta = {
  title: 'Features/Stats/StatsCards',
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

interface TotalTimeData {
  totalHours: number;
  planCount: number;
  avgHoursPerPlan: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  hasActivityToday: boolean;
}

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}分`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) {
    return `${h}時間`;
  }
  return `${h}時間${m}分`;
}

/** TotalTimeCard プレゼンテーション版 */
function TotalTimeCardDisplay({ data }: { data: TotalTimeData }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">予定の合計時間</CardTitle>
        <CardDescription>すべての予定の時間</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-3xl font-bold">{formatHours(data.totalHours)}</div>
            <div className="text-muted-foreground text-xs">合計</div>
          </div>
          <div className="bg-border h-12 w-px" />
          <div className="text-center">
            <div className="text-lg font-bold">{data.planCount}</div>
            <div className="text-muted-foreground text-xs">件の予定</div>
          </div>
          <div className="bg-border h-12 w-px" />
          <div className="text-center">
            <div className="text-lg font-bold">{formatHours(data.avgHoursPerPlan)}</div>
            <div className="text-muted-foreground text-xs">平均 / 件</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <span className="bg-primary size-2 rounded-full" />
            時間設定済みの予定を集計
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/** StreakCard プレゼンテーション版 */
function StreakCardDisplay({ data }: { data: StreakData }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="text-warning size-5" />
          連続日数
        </CardTitle>
        <CardDescription>継続は力なり</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-3xl font-bold">{data.currentStreak}</div>
            <div className="text-muted-foreground text-xs">日連続</div>
          </div>
          <div className="bg-border h-12 w-px" />
          <div className="flex items-center gap-2 text-center">
            <Trophy className="text-warning size-4" />
            <div>
              <div className="text-lg font-bold">{data.longestStreak}</div>
              <div className="text-muted-foreground text-xs">最長記録</div>
            </div>
          </div>
          <div className="bg-border h-12 w-px" />
          <div className="text-center">
            <div className="text-lg font-bold">{data.totalActiveDays}</div>
            <div className="text-muted-foreground text-xs">日 / 年</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {data.hasActivityToday ? (
            <span className="text-success flex items-center gap-1">
              <span className="bg-success size-2 rounded-full" />
              今日も達成済み
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="bg-muted size-2 rounded-full" />
              今日はまだ記録なし
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────

const totalTimeData: TotalTimeData = {
  totalHours: 128.5,
  planCount: 45,
  avgHoursPerPlan: 2.85,
};

const streakDataActive: StreakData = {
  currentStreak: 7,
  longestStreak: 14,
  totalActiveDays: 89,
  hasActivityToday: true,
};

const streakDataInactive: StreakData = {
  currentStreak: 0,
  longestStreak: 14,
  totalActiveDays: 89,
  hasActivityToday: false,
};

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 合計時間カード */
export const TotalTime: Story = {
  render: () => (
    <div className="max-w-md">
      <TotalTimeCardDisplay data={totalTimeData} />
    </div>
  ),
};

/** 連続日数カード（今日達成済み） */
export const StreakActive: Story = {
  render: () => (
    <div className="max-w-md">
      <StreakCardDisplay data={streakDataActive} />
    </div>
  ),
};

/** 連続日数カード（今日未記録） */
export const StreakInactive: Story = {
  render: () => (
    <div className="max-w-md">
      <StreakCardDisplay data={streakDataInactive} />
    </div>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="max-w-md">
        <TotalTimeCardDisplay data={totalTimeData} />
      </div>

      <div className="max-w-md">
        <StreakCardDisplay data={streakDataActive} />
      </div>

      <div className="max-w-md">
        <StreakCardDisplay data={streakDataInactive} />
      </div>
    </div>
  ),
};
