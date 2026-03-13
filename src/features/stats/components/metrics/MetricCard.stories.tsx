import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MetricCard } from './MetricCard';

/** MetricCard — KPI数値を表示するカード */
const meta = {
  title: 'Features/Stats/Layer1/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'メトリクス名' },
    value: { control: 'text', description: '表示値' },
    description: { control: 'text', description: '補足説明' },
    status: {
      control: 'select',
      options: [undefined, 'good', 'warning', 'critical'],
      description: '閾値ベースの色分け',
    },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本表示 */
export const Default: Story = {
  args: {
    label: 'Plan Rate',
    value: '72%',
    description: 'Ratio of planned entries',
  },
};

/** トレンド: 上昇（良い方向） */
export const TrendUpPositive: Story = {
  args: {
    label: 'Peak Utilization',
    value: '65%',
    description: 'Activity during peak hours',
    trend: { direction: 'up', delta: 0.12, isPositive: true },
  },
};

/** トレンド: 下降（良い方向 — blankRate のように down が positive） */
export const TrendDownPositive: Story = {
  args: {
    label: 'Blank Rate',
    value: '15%',
    description: 'Unscheduled time ratio',
    trend: { direction: 'down', delta: -0.08, isPositive: true },
    status: 'good',
  },
};

/** トレンド: 上昇（悪い方向 — contextSwitches のように up が negative） */
export const TrendUpNegative: Story = {
  args: {
    label: 'Context Switches',
    value: '5.8',
    description: 'Tag changes per day',
    trend: { direction: 'up', delta: 0.25, isPositive: false },
  },
};

/** トレンド: 下降（悪い方向） */
export const TrendDownNegative: Story = {
  args: {
    label: 'Plan Rate',
    value: '35%',
    description: 'Ratio of planned entries',
    trend: { direction: 'down', delta: -0.15, isPositive: false },
    status: 'critical',
  },
};

/** トレンド: 横ばい */
export const TrendFlat: Story = {
  args: {
    label: 'Context Switches',
    value: '3.2',
    description: 'Tag changes per day',
    trend: { direction: 'flat', delta: 0.02, isPositive: true },
  },
};

/** ステータス: Good（左ボーダー緑） */
export const StatusGood: Story = {
  args: {
    label: 'Plan Rate',
    value: '85%',
    description: 'Ratio of planned entries',
    status: 'good',
    trend: { direction: 'up', delta: 0.05, isPositive: true },
  },
};

/** ステータス: Warning（左ボーダー黄） */
export const StatusWarning: Story = {
  args: {
    label: 'Plan Rate',
    value: '55%',
    description: 'Ratio of planned entries',
    status: 'warning',
  },
};

/** ステータス: Critical（左ボーダー赤） */
export const StatusCritical: Story = {
  args: {
    label: 'Peak Utilization',
    value: '20%',
    description: 'Activity during peak hours',
    status: 'critical',
    trend: { direction: 'down', delta: -0.3, isPositive: false },
  },
};

/** ローディング状態 */
export const Loading: Story = {
  args: {
    label: 'Plan Rate',
    value: '-',
    description: 'Loading...',
    isLoading: true,
  },
};

/** データなし */
export const NoData: Story = {
  args: {
    label: 'Estimation Accuracy',
    value: '-',
    description: 'Avg deviation from planned time',
  },
};

/** 時間表示（分） */
export const MinutesValue: Story = {
  args: {
    label: 'Estimation Accuracy',
    value: '12m',
    description: 'Avg deviation from planned time',
    trend: { direction: 'down', delta: -0.15, isPositive: true },
    status: 'warning',
  },
};

/** 時間表示（時間+分） */
export const HoursMinutesValue: Story = {
  args: {
    label: 'Estimation Accuracy',
    value: '1h 30m',
    description: 'Avg deviation from planned time',
  },
};

/** 充実度スコア */
export const FulfillmentValue: Story = {
  args: {
    label: 'Avg Fulfillment',
    value: '3.8',
    description: 'Average fulfillment score',
    trend: { direction: 'up', delta: 0.1, isPositive: true },
  },
};

/** 合計時間 */
export const TotalTimeValue: Story = {
  args: {
    label: 'Total Time',
    value: '38h 15m',
    description: 'Total tracked time',
    trend: { direction: 'up', delta: 0.12, isPositive: true },
  },
};

/** ストリーク */
export const StreakValue: Story = {
  args: {
    label: 'Streak',
    value: '23 days',
    description: 'Current streak',
  },
};

/** 8カード横並び（グリッドプレビュー） */
export const GridPreview: Story = {
  args: {
    label: '',
    value: '',
    description: '',
  },
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard
        label="Total Time"
        value="38h 15m"
        description="Total tracked time"
        trend={{ direction: 'up', delta: 0.12, isPositive: true }}
      />
      <MetricCard
        label="Avg Fulfillment"
        value="3.8"
        description="Average fulfillment score"
        trend={{ direction: 'up', delta: 0.1, isPositive: true }}
      />
      <MetricCard
        label="Plan Rate"
        value="72%"
        description="Ratio of planned entries"
        trend={{ direction: 'up', delta: 0.05, isPositive: true }}
        status="good"
      />
      <MetricCard label="Streak" value="23 days" description="Current streak" />
      <MetricCard
        label="Estimation Accuracy"
        value="12m"
        description="Avg deviation from planned time"
        trend={{ direction: 'down', delta: -0.15, isPositive: true }}
        status="warning"
      />
      <MetricCard
        label="Peak Utilization"
        value="65%"
        description="Activity during peak hours"
        trend={{ direction: 'up', delta: 0.08, isPositive: true }}
        status="good"
      />
      <MetricCard
        label="Context Switches"
        value="3.2"
        description="Tag changes per day"
        trend={{ direction: 'flat', delta: 0.01, isPositive: true }}
      />
      <MetricCard
        label="Blank Rate"
        value="28%"
        description="Unscheduled time ratio"
        trend={{ direction: 'down', delta: -0.03, isPositive: true }}
        status="warning"
      />
    </div>
  ),
};

/** 全ローディング状態のグリッド */
export const GridLoading: Story = {
  args: {
    label: '',
    value: '',
    description: '',
  },
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard label="Total Time" value="-" description="" isLoading />
      <MetricCard label="Avg Fulfillment" value="-" description="" isLoading />
      <MetricCard label="Plan Rate" value="-" description="" isLoading />
      <MetricCard label="Streak" value="-" description="" isLoading />
      <MetricCard label="Estimation Accuracy" value="-" description="" isLoading />
      <MetricCard label="Peak Utilization" value="-" description="" isLoading />
      <MetricCard label="Context Switches" value="-" description="" isLoading />
      <MetricCard label="Blank Rate" value="-" description="" isLoading />
    </div>
  ),
};
