import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Layout/StatusBar/TotalTimeStatusItem',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '累計時間をステータスバーに表示（Plan vs Record 比率バー）。\n\n' +
          '- データ: `api.plans.getCumulativeTime` (stale 5min, refetch 5min)\n' +
          '- Plan/Record作成・更新時にキャッシュ自動更新\n' +
          '- エラー時は非表示（ステータスバーを壊さない）\n' +
          '- クリック動作なし',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** データなし（初期状態）。 */
export const Default: Story = {
  render: () => (
    <div
      className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
      title="Plan: 0m (50%) / Record: 0m (50%)"
    >
      <span className="text-primary font-medium tabular-nums">0m</span>
      <div className="flex h-2 w-20 overflow-hidden rounded-sm">
        <div className="bg-primary h-full" style={{ width: '50%' }} />
        <div className="bg-success h-full" style={{ width: '50%' }} />
      </div>
      <span className="text-success font-medium tabular-nums">0m</span>
      <span className="text-muted-foreground/50 text-xs tabular-nums">EVEN</span>
    </div>
  ),
};

/** Plan優勢（Record が少ない）。 */
export const PlanHeavy: Story = {
  render: () => (
    <div
      className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
      title="Plan: 120h 30m (59%) / Record: 85h 15m (41%)"
    >
      <span className="text-primary font-medium tabular-nums">120h 30m</span>
      <div className="flex h-2 w-20 overflow-hidden rounded-sm">
        <div className="bg-primary h-full" style={{ width: '59%' }} />
        <div className="bg-success h-full" style={{ width: '41%' }} />
      </div>
      <span className="text-success font-medium tabular-nums">85h 15m</span>
      <span className="text-muted-foreground/50 text-xs tabular-nums">-18%</span>
    </div>
  ),
};

/** Record優勢（Plan が少ない）。 */
export const RecordHeavy: Story = {
  render: () => (
    <div
      className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
      title="Plan: 40h 10m (35%) / Record: 75h 20m (65%)"
    >
      <span className="text-primary font-medium tabular-nums">40h 10m</span>
      <div className="flex h-2 w-20 overflow-hidden rounded-sm">
        <div className="bg-primary h-full" style={{ width: '35%' }} />
        <div className="bg-success h-full" style={{ width: '65%' }} />
      </div>
      <span className="text-success font-medium tabular-nums">75h 20m</span>
      <span className="text-muted-foreground/50 text-xs tabular-nums">+30%</span>
    </div>
  ),
};

/** ほぼ均等。 */
export const Balanced: Story = {
  render: () => (
    <div
      className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
      title="Plan: 50h 0m (50%) / Record: 50h 0m (50%)"
    >
      <span className="text-primary font-medium tabular-nums">50h 0m</span>
      <div className="flex h-2 w-20 overflow-hidden rounded-sm">
        <div className="bg-primary h-full" style={{ width: '50%' }} />
        <div className="bg-success h-full" style={{ width: '50%' }} />
      </div>
      <span className="text-success font-medium tabular-nums">50h 0m</span>
      <span className="text-muted-foreground/50 text-xs tabular-nums">EVEN</span>
    </div>
  ),
};

/** ローディング中。 */
export const Loading: Story = {
  render: () => (
    <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
      <span>...</span>
    </div>
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="bg-surface-container flex flex-col items-start gap-4 rounded p-4">
      {/* 初期状態 */}
      <div
        className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
        title="Plan: 0m (50%) / Record: 0m (50%)"
      >
        <span className="text-primary font-medium tabular-nums">0m</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: '50%' }} />
          <div className="bg-success h-full" style={{ width: '50%' }} />
        </div>
        <span className="text-success font-medium tabular-nums">0m</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">EVEN</span>
      </div>
      {/* Plan優勢 */}
      <div
        className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
        title="Plan: 120h 30m (59%) / Record: 85h 15m (41%)"
      >
        <span className="text-primary font-medium tabular-nums">120h 30m</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: '59%' }} />
          <div className="bg-success h-full" style={{ width: '41%' }} />
        </div>
        <span className="text-success font-medium tabular-nums">85h 15m</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">-18%</span>
      </div>
      {/* Record優勢 */}
      <div
        className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
        title="Plan: 40h 10m (35%) / Record: 75h 20m (65%)"
      >
        <span className="text-primary font-medium tabular-nums">40h 10m</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: '35%' }} />
          <div className="bg-success h-full" style={{ width: '65%' }} />
        </div>
        <span className="text-success font-medium tabular-nums">75h 20m</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">+30%</span>
      </div>
      {/* 均等 */}
      <div
        className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs"
        title="Plan: 50h 0m (50%) / Record: 50h 0m (50%)"
      >
        <span className="text-primary font-medium tabular-nums">50h 0m</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: '50%' }} />
          <div className="bg-success h-full" style={{ width: '50%' }} />
        </div>
        <span className="text-success font-medium tabular-nums">50h 0m</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">EVEN</span>
      </div>
      {/* ローディング */}
      <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
        <span>...</span>
      </div>
    </div>
  ),
};
