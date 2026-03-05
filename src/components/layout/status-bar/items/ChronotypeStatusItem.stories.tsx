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
          '| フェーズ | トークン | 色 |\n' +
          '|----------|----------|----|\n' +
          '| warmup | `--chronotype-warmup` | green（朝の新鮮さ） |\n' +
          '| peak | `--chronotype-peak` | amber（最大エネルギー） |\n' +
          '| dip | `--chronotype-dip` | blue（エネルギー低下） |\n' +
          '| recovery | `--chronotype-recovery` | cyan（回復） |\n' +
          '| winddown | `--chronotype-winddown` | indigo（就寝準備） |',
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

/** warmup: ウォームアップ（起床後、エネルギー上昇中）。 */
export const Warmup: Story = {
  render: () => (
    <DrainBarItem
      label="ウォームアップ"
      color="var(--chronotype-warmup)"
      percent={56}
      tooltip="ウォームアップ — 残り2h 15m"
    />
  ),
};

/** peak: ピーク（最も集中力が高い）。 */
export const Peak: Story = {
  render: () => (
    <DrainBarItem
      label="ピーク"
      color="var(--chronotype-peak)"
      percent={75}
      tooltip="ピーク — 残り1h 30m"
    />
  ),
};

/** dip: ディップ（エネルギー低下）。 */
export const Dip: Story = {
  render: () => (
    <DrainBarItem
      label="ディップ"
      color="var(--chronotype-dip)"
      percent={33}
      tooltip="ディップ — 残り1h 0m"
    />
  ),
};

/** recovery: リカバリー（ディップから回復）。 */
export const Recovery: Story = {
  render: () => (
    <DrainBarItem
      label="リカバリー"
      color="var(--chronotype-recovery)"
      percent={100}
      tooltip="リカバリー — 残り3h 0m"
    />
  ),
};

/** winddown: ウインドダウン（就寝準備）。 */
export const Winddown: Story = {
  render: () => (
    <DrainBarItem
      label="ウインドダウン"
      color="var(--chronotype-winddown)"
      percent={69}
      tooltip="ウインドダウン — 残り5h 30m"
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
        label="ウォームアップ"
        color="var(--chronotype-warmup)"
        percent={56}
        tooltip="ウォームアップ — 残り2h 15m"
      />
      <DrainBarItem
        label="ピーク"
        color="var(--chronotype-peak)"
        percent={75}
        tooltip="ピーク — 残り1h 30m"
      />
      <DrainBarItem
        label="ディップ"
        color="var(--chronotype-dip)"
        percent={33}
        tooltip="ディップ — 残り1h 0m"
      />
      <DrainBarItem
        label="リカバリー"
        color="var(--chronotype-recovery)"
        percent={100}
        tooltip="リカバリー — 残り3h 0m"
      />
      <DrainBarItem
        label="ウインドダウン"
        color="var(--chronotype-winddown)"
        percent={69}
        tooltip="ウインドダウン — 残り5h 30m"
      />
    </div>
  ),
};
