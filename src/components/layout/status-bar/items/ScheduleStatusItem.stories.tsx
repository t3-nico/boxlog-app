import type { Meta, StoryObj } from '@storybook/react-vite';

import { Calendar } from 'lucide-react';

import { StatusBarItem } from '../StatusBarItem';

import { cn } from '@/lib/utils';

/* ============================================
 * プログレスリング（Story用モック）
 *
 * 実装は ScheduleStatusItem.tsx 内に同等のものがある。
 * ============================================ */

function ProgressRing({ percent, chronotypeColor }: { percent: number; chronotypeColor?: string }) {
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
          className={cn(
            !chronotypeColor && (isNearEnd ? 'stroke-destructive' : 'stroke-primary'),
            isNearEnd && 'stroke-destructive',
          )}
          style={chronotypeColor && !isNearEnd ? { stroke: chronotypeColor } : undefined}
          strokeWidth={progressStroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

const meta = {
  title: 'Components/Layout/StatusBar/ScheduleStatusItem',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '現在の予定をステータスバーに表示。進行中の予定があればプログレスリングも表示。\n\n' +
          '- データ: `api.plans.list` (stale 1min, refetch 1min)\n' +
          '- クロノタイプ色: `api.userSettings.get` (stale 5min)\n' +
          '- 1分ごとに現在時刻を更新\n' +
          '- 進捗: ダブルリング（太背景トラック + 細進捗リング）\n' +
          '- 80%超過で destructive 色に切り替え\n\n' +
          '| 状態 | クリック |\n' +
          '|------|----------|\n' +
          '| 予定なし | PlanCreateTrigger で新規作成 |\n' +
          '| 進行中 | Inspector を開く |',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 予定がない場合。クリックで新規プラン作成。 */
export const Default: Story = {
  render: () => (
    <StatusBarItem
      icon={<Calendar className="h-3 w-3" />}
      label="予定なし"
      tooltip="新しいプランを作成"
      forceClickable
    />
  ),
};

/** 現在進行中の予定がある場合。 */
export const ActiveSchedule: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <StatusBarItem
        icon={<Calendar className="h-3 w-3" />}
        label="ミーティング (14:00-15:00)"
        tooltip="予定を開く"
        onClick={() => {}}
      />
    </div>
  ),
};

/** 進行中 + プログレスリング表示。 */
export const WithProgress: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <StatusBarItem
        icon={<Calendar className="h-3 w-3" />}
        label="ミーティング (14:00-15:00)"
        tooltip="予定を開く"
        onClick={() => {}}
      />
      <ProgressRing percent={65} />
    </div>
  ),
};

/** 80%超過 → リングが destructive 色に変化。 */
export const NearEnd: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <StatusBarItem
        icon={<Calendar className="h-3 w-3" />}
        label="レビュー (16:00-16:30)"
        tooltip="予定を開く"
        onClick={() => {}}
      />
      <ProgressRing percent={92} />
    </div>
  ),
};

/** クロノタイプ色適用。 */
export const WithChronotype: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" style={{ color: '#22c55e' }} />}
          label="ミーティング (14:00-15:00)"
          tooltip="予定を開く"
          onClick={() => {}}
        />
        <ProgressRing percent={45} chronotypeColor="#22c55e" />
      </div>
      <div className="flex items-center gap-2">
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" style={{ color: '#22c55e' }} />}
          label="レビュー (16:00-16:30)"
          tooltip="予定を開く"
          onClick={() => {}}
        />
        <ProgressRing percent={92} chronotypeColor="#22c55e" />
      </div>
    </div>
  ),
};

/** ローディング中。 */
export const Loading: Story = {
  render: () => (
    <StatusBarItem
      icon={<Calendar className="h-3 w-3 animate-pulse" />}
      label="..."
      tooltip="読み込み中"
    />
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="bg-surface-container flex flex-col items-start gap-4 rounded p-4">
      {/* 予定なし */}
      <StatusBarItem
        icon={<Calendar className="h-3 w-3" />}
        label="予定なし"
        tooltip="新しいプランを作成"
        forceClickable
      />
      {/* 進行中 */}
      <StatusBarItem
        icon={<Calendar className="h-3 w-3" />}
        label="ミーティング (14:00-15:00)"
        tooltip="予定を開く"
        onClick={() => {}}
      />
      {/* 進行中 + プログレスリング（開始直後） */}
      <div className="flex items-center gap-2">
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" />}
          label="ミーティング (14:00-15:00)"
          tooltip="予定を開く"
          onClick={() => {}}
        />
        <ProgressRing percent={25} />
      </div>
      {/* 進行中 + プログレスリング（中盤） */}
      <div className="flex items-center gap-2">
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" />}
          label="ミーティング (14:00-15:00)"
          tooltip="予定を開く"
          onClick={() => {}}
        />
        <ProgressRing percent={65} />
      </div>
      {/* 終了間近 */}
      <div className="flex items-center gap-2">
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" />}
          label="レビュー (16:00-16:30)"
          tooltip="予定を開く"
          onClick={() => {}}
        />
        <ProgressRing percent={92} />
      </div>
      {/* ローディング */}
      <StatusBarItem
        icon={<Calendar className="h-3 w-3 animate-pulse" />}
        label="..."
        tooltip="読み込み中"
      />
    </div>
  ),
};
