import { HoverTooltip } from '@/components/ui/tooltip';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Layout/StatusBar/TotalTimeStatusItem',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '今週の時間をステータスバーに表示（Plan vs Record 比率バー）。\n\n' +
          '- データ: `api.plans.getCumulativeTime` (stale 5min, refetch 5min)\n' +
          '- 今週（月〜日）のPlan/Recordを集計\n' +
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
    <HoverTooltip content="Plan: 0m (50%) / Record: 0m (50%)" side="top">
      <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
        <span className="text-primary font-medium tabular-nums">0m</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: '50%' }} />
          <div className="bg-success h-full" style={{ width: '50%' }} />
        </div>
        <span className="text-success font-medium tabular-nums">0m</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">EVEN</span>
      </div>
    </HoverTooltip>
  ),
};

/** Plan優勢（Record が少ない）。 */
export const PlanHeavy: Story = {
  render: () => (
    <HoverTooltip content="Plan: 12h 30m (63%) / Record: 7h 15m (37%)" side="top">
      <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
        <span className="text-primary font-medium tabular-nums">12h 30m</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: '63%' }} />
          <div className="bg-success h-full" style={{ width: '37%' }} />
        </div>
        <span className="text-success font-medium tabular-nums">7h 15m</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">-26%</span>
      </div>
    </HoverTooltip>
  ),
};

/** Record優勢（Plan が少ない）。 */
export const RecordHeavy: Story = {
  render: () => (
    <HoverTooltip content="Plan: 5h 0m (33%) / Record: 10h 15m (67%)" side="top">
      <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
        <span className="text-primary font-medium tabular-nums">5h 0m</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: '33%' }} />
          <div className="bg-success h-full" style={{ width: '67%' }} />
        </div>
        <span className="text-success font-medium tabular-nums">10h 15m</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">+34%</span>
      </div>
    </HoverTooltip>
  ),
};

/** ほぼ均等。 */
export const Balanced: Story = {
  render: () => (
    <HoverTooltip content="Plan: 8h 0m (50%) / Record: 8h 0m (50%)" side="top">
      <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
        <span className="text-primary font-medium tabular-nums">8h 0m</span>
        <div className="flex h-2 w-20 overflow-hidden rounded-sm">
          <div className="bg-primary h-full" style={{ width: '50%' }} />
          <div className="bg-success h-full" style={{ width: '50%' }} />
        </div>
        <span className="text-success font-medium tabular-nums">8h 0m</span>
        <span className="text-muted-foreground/50 text-xs tabular-nums">EVEN</span>
      </div>
    </HoverTooltip>
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
      <HoverTooltip content="Plan: 0m (50%) / Record: 0m (50%)" side="top">
        <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
          <span className="text-primary font-medium tabular-nums">0m</span>
          <div className="flex h-2 w-20 overflow-hidden rounded-sm">
            <div className="bg-primary h-full" style={{ width: '50%' }} />
            <div className="bg-success h-full" style={{ width: '50%' }} />
          </div>
          <span className="text-success font-medium tabular-nums">0m</span>
          <span className="text-muted-foreground/50 text-xs tabular-nums">EVEN</span>
        </div>
      </HoverTooltip>
      {/* Plan優勢 */}
      <HoverTooltip content="Plan: 12h 30m (63%) / Record: 7h 15m (37%)" side="top">
        <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
          <span className="text-primary font-medium tabular-nums">12h 30m</span>
          <div className="flex h-2 w-20 overflow-hidden rounded-sm">
            <div className="bg-primary h-full" style={{ width: '63%' }} />
            <div className="bg-success h-full" style={{ width: '37%' }} />
          </div>
          <span className="text-success font-medium tabular-nums">7h 15m</span>
          <span className="text-muted-foreground/50 text-xs tabular-nums">-26%</span>
        </div>
      </HoverTooltip>
      {/* Record優勢 */}
      <HoverTooltip content="Plan: 5h 0m (33%) / Record: 10h 15m (67%)" side="top">
        <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
          <span className="text-primary font-medium tabular-nums">5h 0m</span>
          <div className="flex h-2 w-20 overflow-hidden rounded-sm">
            <div className="bg-primary h-full" style={{ width: '33%' }} />
            <div className="bg-success h-full" style={{ width: '67%' }} />
          </div>
          <span className="text-success font-medium tabular-nums">10h 15m</span>
          <span className="text-muted-foreground/50 text-xs tabular-nums">+34%</span>
        </div>
      </HoverTooltip>
      {/* 均等 */}
      <HoverTooltip content="Plan: 8h 0m (50%) / Record: 8h 0m (50%)" side="top">
        <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
          <span className="text-primary font-medium tabular-nums">8h 0m</span>
          <div className="flex h-2 w-20 overflow-hidden rounded-sm">
            <div className="bg-primary h-full" style={{ width: '50%' }} />
            <div className="bg-success h-full" style={{ width: '50%' }} />
          </div>
          <span className="text-success font-medium tabular-nums">8h 0m</span>
          <span className="text-muted-foreground/50 text-xs tabular-nums">EVEN</span>
        </div>
      </HoverTooltip>
      {/* ローディング */}
      <div className="text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs">
        <span>...</span>
      </div>
    </div>
  ),
};
