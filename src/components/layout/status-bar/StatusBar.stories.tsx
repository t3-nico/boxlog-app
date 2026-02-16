import type { Meta, StoryObj } from '@storybook/react-vite';

import { Calendar, Dna } from 'lucide-react';

import { StatusBar } from './StatusBar';
import { StatusBarItem } from './StatusBarItem';

import { cn } from '@/lib/utils';

const meta = {
  title: 'Components/Layout/StatusBar',
  component: StatusBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children: null,
  },
  argTypes: {
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** プログレスリング（Story用モック） */
function ProgressRing({ percent }: { percent: number }) {
  const size = 16;
  const trackStroke = 4;
  const progressStroke = 2.5;
  const radius = (size - trackStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const isNearEnd = percent >= 80;

  return (
    <div title={`${percent}% 経過`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-border"
          strokeWidth={trackStroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn(isNearEnd ? 'stroke-destructive' : 'stroke-primary')}
          strokeWidth={progressStroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** TotalTimeStatusItem の比率バー（Story内で再利用） */
function TotalTimeBar({
  planLabel,
  recordLabel,
  planPercent,
  recordPercent,
  diffLabel,
  tooltip,
}: {
  planLabel: string;
  recordLabel: string;
  planPercent: number;
  recordPercent: number;
  diffLabel: string;
  tooltip: string;
}) {
  return (
    <div
      className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
      title={tooltip}
    >
      <span className="text-primary font-medium tabular-nums">{planLabel}</span>
      <div className="flex h-2 w-20 overflow-hidden rounded-sm">
        <div className="bg-primary h-full" style={{ width: `${planPercent}%` }} />
        <div className="bg-success h-full" style={{ width: `${recordPercent}%` }} />
      </div>
      <span className="text-success font-medium tabular-nums">{recordLabel}</span>
      <span className="text-muted-foreground/50 text-xs tabular-nums">{diffLabel}</span>
    </div>
  );
}

/**
 * 初期状態。3アイテム全て表示（予定なし・累計0・クロノタイプ未設定）。
 *
 * 実際の配置（desktop-layout.tsx）:
 * - Left: ScheduleStatusItem + TotalTimeStatusItem
 * - Right: ChronotypeStatusItem
 */
export const Default: Story = {
  render: () => (
    <StatusBar>
      <StatusBar.Left>
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" />}
          label="予定なし"
          tooltip="新しいプランを作成"
        />
        <TotalTimeBar
          planLabel="0m"
          recordLabel="0m"
          planPercent={50}
          recordPercent={50}
          diffLabel="EVEN"
          tooltip="Plan: 0m (50%) / Record: 0m (50%)"
        />
      </StatusBar.Left>
      <StatusBar.Right>
        <StatusBarItem
          icon={<Dna className="text-muted-foreground h-3 w-3" />}
          label="クロノタイプ未設定"
          tooltip="クロノタイプを設定"
        />
      </StatusBar.Right>
    </StatusBar>
  ),
};

/** 予定進行中 + 累計データあり + クロノタイプ設定済み。 */
export const Active: Story = {
  render: () => (
    <StatusBar>
      <StatusBar.Left>
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" />}
          label="ミーティング (14:00-15:00)"
          tooltip="予定を開く"
        />
        <TotalTimeBar
          planLabel="120h 30m"
          recordLabel="85h 15m"
          planPercent={59}
          recordPercent={41}
          diffLabel="-18%"
          tooltip="Plan: 120h 30m (59%) / Record: 85h 15m (41%)"
        />
      </StatusBar.Left>
      <StatusBar.Right>
        <StatusBarItem
          icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-peak)' }} />}
          label="ピーク時間帯 (残り1h 30m)"
          tooltip="生産性ゾーン設定を開く"
        />
      </StatusBar.Right>
    </StatusBar>
  ),
};

/** 予定進行中 + プログレスリング付き。 */
export const WithProgress: Story = {
  render: () => (
    <StatusBar>
      <StatusBar.Left>
        <div className="flex items-center gap-2">
          <StatusBarItem
            icon={<Calendar className="h-3 w-3" />}
            label="ミーティング (14:00-15:00)"
            tooltip="予定を開く"
          />
          <ProgressRing percent={65} />
        </div>
        <TotalTimeBar
          planLabel="45h 20m"
          recordLabel="32h 10m"
          planPercent={58}
          recordPercent={42}
          diffLabel="-16%"
          tooltip="Plan: 45h 20m (58%) / Record: 32h 10m (42%)"
        />
      </StatusBar.Left>
      <StatusBar.Right>
        <StatusBarItem
          icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-peak)' }} />}
          label="ピーク時間帯 (残り1h 30m)"
          tooltip="生産性ゾーン設定を開く"
        />
      </StatusBar.Right>
    </StatusBar>
  ),
};

/**
 * 全パターン一覧。
 *
 * 1. 初期状態（予定なし・累計0・クロノタイプ未設定）
 * 2. 通常利用（予定なし・累計あり・クロノタイプ設定済み）
 * 3. フル稼働（予定進行中+プログレス・累計あり・クロノタイプ設定済み）
 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      {/* 1. 初期状態 */}
      <StatusBar>
        <StatusBar.Left>
          <StatusBarItem icon={<Calendar className="h-3 w-3" />} label="予定なし" />
          <TotalTimeBar
            planLabel="0m"
            recordLabel="0m"
            planPercent={50}
            recordPercent={50}
            diffLabel="EVEN"
            tooltip="Plan: 0m (50%) / Record: 0m (50%)"
          />
        </StatusBar.Left>
        <StatusBar.Right>
          <StatusBarItem
            icon={<Dna className="text-muted-foreground h-3 w-3" />}
            label="クロノタイプ未設定"
          />
        </StatusBar.Right>
      </StatusBar>

      {/* 2. 通常利用 */}
      <StatusBar>
        <StatusBar.Left>
          <StatusBarItem icon={<Calendar className="h-3 w-3" />} label="予定なし" />
          <TotalTimeBar
            planLabel="120h 30m"
            recordLabel="85h 15m"
            planPercent={59}
            recordPercent={41}
            diffLabel="-18%"
            tooltip="Plan: 120h 30m (59%) / Record: 85h 15m (41%)"
          />
        </StatusBar.Left>
        <StatusBar.Right>
          <StatusBarItem
            icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-peak)' }} />}
            label="ピーク時間帯 (残り1h 30m)"
          />
        </StatusBar.Right>
      </StatusBar>

      {/* 3. フル稼働 */}
      <StatusBar>
        <StatusBar.Left>
          <div className="flex items-center gap-2">
            <StatusBarItem
              icon={<Calendar className="h-3 w-3" />}
              label="ミーティング (14:00-15:00)"
            />
            <ProgressRing percent={65} />
          </div>
          <TotalTimeBar
            planLabel="45h 20m"
            recordLabel="32h 10m"
            planPercent={58}
            recordPercent={42}
            diffLabel="-16%"
            tooltip="Plan: 45h 20m (58%) / Record: 32h 10m (42%)"
          />
        </StatusBar.Left>
        <StatusBar.Right>
          <StatusBarItem
            icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-peak)' }} />}
            label="ピーク時間帯 (残り1h 30m)"
          />
        </StatusBar.Right>
      </StatusBar>
    </div>
  ),
};
