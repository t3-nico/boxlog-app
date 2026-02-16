import type { Meta, StoryObj } from '@storybook/react-vite';

import { Calendar } from 'lucide-react';

import { StatusBarItem } from '../StatusBarItem';

const meta = {
  title: 'Components/Layout/StatusBar/ScheduleStatusItem',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '現在の予定をステータスバーに表示。進行中の予定があればプログレスバーも表示。\n\n' +
          '- データ: `api.plans.list` (stale 1min, refetch 1min)\n' +
          '- クロノタイプ色: `api.userSettings.get` (stale 5min)\n' +
          '- 1分ごとに現在時刻を更新\n\n' +
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

/** 進行中 + プログレスバー表示。 */
export const WithProgress: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <StatusBarItem
        icon={<Calendar className="h-3 w-3" />}
        label="ミーティング (14:00-15:00)"
        tooltip="予定を開く"
        onClick={() => {}}
      />
      <div className="flex items-center gap-2" title="65% 経過">
        <div className="bg-surface-container h-1 w-16 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: '65%' }}
          />
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">65%</span>
      </div>
    </div>
  ),
};

/** 80%超過 → プログレスバーが destructive 色に変化。 */
export const NearEnd: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <StatusBarItem
        icon={<Calendar className="h-3 w-3" />}
        label="レビュー (16:00-16:30)"
        tooltip="予定を開く"
        onClick={() => {}}
      />
      <div className="flex items-center gap-2" title="92% 経過">
        <div className="bg-surface-container h-1 w-16 overflow-hidden rounded-full">
          <div
            className="bg-destructive h-full rounded-full transition-all duration-300"
            style={{ width: '92%' }}
          />
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">92%</span>
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
      {/* 進行中 + プログレス */}
      <div className="flex items-center gap-2">
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" />}
          label="ミーティング (14:00-15:00)"
          tooltip="予定を開く"
          onClick={() => {}}
        />
        <div className="flex items-center gap-2" title="65% 経過">
          <div className="bg-surface-container h-1 w-16 overflow-hidden rounded-full">
            <div className="bg-primary h-full rounded-full" style={{ width: '65%' }} />
          </div>
          <span className="text-muted-foreground text-xs tabular-nums">65%</span>
        </div>
      </div>
      {/* 終了間近 */}
      <div className="flex items-center gap-2">
        <StatusBarItem
          icon={<Calendar className="h-3 w-3" />}
          label="レビュー (16:00-16:30)"
          tooltip="予定を開く"
          onClick={() => {}}
        />
        <div className="flex items-center gap-2" title="92% 経過">
          <div className="bg-surface-container h-1 w-16 overflow-hidden rounded-full">
            <div className="bg-destructive h-full rounded-full" style={{ width: '92%' }} />
          </div>
          <span className="text-muted-foreground text-xs tabular-nums">92%</span>
        </div>
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
