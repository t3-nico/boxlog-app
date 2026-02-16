import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dna } from 'lucide-react';

import { StatusBarItem } from '../StatusBarItem';

const meta = {
  title: 'Components/Layout/StatusBar/ChronotypeStatusItem',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '現在の生産性ゾーンをステータスバーに表示。\n\n' +
          '- データ: `api.userSettings.get` (stale 5min)\n' +
          '- 1分ごとに現在時刻を更新 → 残り時間を自動更新\n' +
          '- アイコン色がゾーンレベルに応じて変化\n' +
          '- クリック → 設定モーダル（personalization）\n\n' +
          '| レベル | トークン | 色 |\n' +
          '|--------|----------|----|\n' +
          '| peak | `--chronotype-peak` | 緑 |\n' +
          '| good | `--chronotype-good` | 薄緑 |\n' +
          '| moderate | `--chronotype-moderate` | 青 |\n' +
          '| low | `--chronotype-low` | ウォームベージュ |\n' +
          '| sleep | `--chronotype-sleep` | 微紫 |',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** クロノタイプ未設定。 */
export const Default: Story = {
  render: () => (
    <StatusBarItem
      icon={<Dna className="text-muted-foreground h-3 w-3" />}
      label="クロノタイプ未設定"
      tooltip="クロノタイプを設定"
      onClick={() => {}}
    />
  ),
};

/** peak: ピーク時間帯（最も生産性が高い）。 */
export const Peak: Story = {
  render: () => (
    <StatusBarItem
      icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-peak)' }} />}
      label="ピーク時間帯 (残り1h 30m)"
      tooltip="生産性ゾーン設定を開く"
      onClick={() => {}}
    />
  ),
};

/** good: 集中時間帯（高い生産性）。 */
export const Good: Story = {
  render: () => (
    <StatusBarItem
      icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-good)' }} />}
      label="集中時間帯 (残り2h 15m)"
      tooltip="生産性ゾーン設定を開く"
      onClick={() => {}}
    />
  ),
};

/** moderate: 通常時間帯。 */
export const Moderate: Story = {
  render: () => (
    <StatusBarItem
      icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-moderate)' }} />}
      label="通常時間帯 (残り3h 0m)"
      tooltip="生産性ゾーン設定を開く"
      onClick={() => {}}
    />
  ),
};

/** low: 低調時間帯。 */
export const Low: Story = {
  render: () => (
    <StatusBarItem
      icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-low)' }} />}
      label="低調時間帯 (残り1h 0m)"
      tooltip="生産性ゾーン設定を開く"
      onClick={() => {}}
    />
  ),
};

/** sleep: 睡眠時間帯。 */
export const Sleep: Story = {
  render: () => (
    <StatusBarItem
      icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-sleep)' }} />}
      label="睡眠時間帯 (残り5h 30m)"
      tooltip="生産性ゾーン設定を開く"
      onClick={() => {}}
    />
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="bg-surface-container flex flex-col items-start gap-4 rounded p-4">
      <StatusBarItem
        icon={<Dna className="text-muted-foreground h-3 w-3" />}
        label="クロノタイプ未設定"
        tooltip="クロノタイプを設定"
        onClick={() => {}}
      />
      <StatusBarItem
        icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-peak)' }} />}
        label="ピーク時間帯 (残り1h 30m)"
        tooltip="生産性ゾーン設定を開く"
        onClick={() => {}}
      />
      <StatusBarItem
        icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-good)' }} />}
        label="集中時間帯 (残り2h 15m)"
        tooltip="生産性ゾーン設定を開く"
        onClick={() => {}}
      />
      <StatusBarItem
        icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-moderate)' }} />}
        label="通常時間帯 (残り3h 0m)"
        tooltip="生産性ゾーン設定を開く"
        onClick={() => {}}
      />
      <StatusBarItem
        icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-low)' }} />}
        label="低調時間帯 (残り1h 0m)"
        tooltip="生産性ゾーン設定を開く"
        onClick={() => {}}
      />
      <StatusBarItem
        icon={<Dna className="h-3 w-3" style={{ color: 'var(--chronotype-sleep)' }} />}
        label="睡眠時間帯 (残り5h 30m)"
        tooltip="生産性ゾーン設定を開く"
        onClick={() => {}}
      />
    </div>
  ),
};
