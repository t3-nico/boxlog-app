import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dna } from 'lucide-react';

import { HoverTooltip } from '@/components/ui/tooltip';

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
          '- 1分ごとに現在時刻を更新 → 残り時間をバーで視覚化\n' +
          '- アイコン色・バー色がゾーンレベルに応じて変化\n' +
          '- ツールチップに残り時間テキストを表示\n' +
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

/** ドレインバー付きステータスアイテムのモック */
function DrainBarItem({
  label,
  color,
  percent,
  tooltip,
}: {
  label: string;
  color: string;
  percent: number;
  tooltip: string;
}) {
  return (
    <HoverTooltip content={tooltip} side="top">
      <div
        role="button"
        tabIndex={0}
        aria-label={tooltip}
        className="text-muted-foreground hover:bg-state-hover hover:text-foreground focus-visible:bg-state-hover focus-visible:text-foreground active:bg-state-hover flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition-colors duration-150 focus-visible:outline-none"
      >
        <Dna className="h-3 w-3" style={{ color }} />
        <span className="truncate">{label}</span>
        <div className="bg-border h-1.5 w-12 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </HoverTooltip>
  );
}

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
    <DrainBarItem
      label="ピーク時間帯"
      color="var(--chronotype-peak)"
      percent={75}
      tooltip="ピーク時間帯 — 残り1h 30m"
    />
  ),
};

/** good: 集中時間帯（高い生産性）。 */
export const Good: Story = {
  render: () => (
    <DrainBarItem
      label="集中時間帯"
      color="var(--chronotype-good)"
      percent={56}
      tooltip="集中時間帯 — 残り2h 15m"
    />
  ),
};

/** moderate: 通常時間帯。 */
export const Moderate: Story = {
  render: () => (
    <DrainBarItem
      label="通常時間帯"
      color="var(--chronotype-moderate)"
      percent={100}
      tooltip="通常時間帯 — 残り3h 0m"
    />
  ),
};

/** low: 低調時間帯。 */
export const Low: Story = {
  render: () => (
    <DrainBarItem
      label="低調時間帯"
      color="var(--chronotype-low)"
      percent={33}
      tooltip="低調時間帯 — 残り1h 0m"
    />
  ),
};

/** sleep: 睡眠時間帯。 */
export const Sleep: Story = {
  render: () => (
    <DrainBarItem
      label="睡眠時間帯"
      color="var(--chronotype-sleep)"
      percent={69}
      tooltip="睡眠時間帯 — 残り5h 30m"
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
      <DrainBarItem
        label="ピーク時間帯"
        color="var(--chronotype-peak)"
        percent={75}
        tooltip="ピーク時間帯 — 残り1h 30m"
      />
      <DrainBarItem
        label="集中時間帯"
        color="var(--chronotype-good)"
        percent={56}
        tooltip="集中時間帯 — 残り2h 15m"
      />
      <DrainBarItem
        label="通常時間帯"
        color="var(--chronotype-moderate)"
        percent={100}
        tooltip="通常時間帯 — 残り3h 0m"
      />
      <DrainBarItem
        label="低調時間帯"
        color="var(--chronotype-low)"
        percent={33}
        tooltip="低調時間帯 — 残り1h 0m"
      />
      <DrainBarItem
        label="睡眠時間帯"
        color="var(--chronotype-sleep)"
        percent={69}
        tooltip="睡眠時間帯 — 残り5h 30m"
      />
    </div>
  ),
};
