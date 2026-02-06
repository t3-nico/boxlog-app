import type { Meta, StoryObj } from '@storybook/react';
import { PanelLeft, PanelLeftClose } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';

import { SidebarShell } from './SidebarShell';

/** サイドバーシェル。カレンダーや設定ページで使用。折りたたみ可能で、状態はlocalStorageに永続化される。 */
const meta = {
  title: 'Features/Navigation/Sidebar',
  component: SidebarShell,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    children: (
      <div className="p-4">
        <div className="bg-container text-muted-foreground rounded p-4 text-center text-sm">
          コンテンツエリア
        </div>
      </div>
    ),
  },
} satisfies Meta<typeof SidebarShell>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント
// ---------------------------------------------------------------------------

function ToggleButtonComparison() {
  return (
    <div className="flex items-start gap-8 p-6">
      <div className="bg-surface-container border-border flex h-12 w-48 items-center justify-end rounded-lg border px-2">
        <HoverTooltip content="サイドバーを閉じる" side="bottom">
          <Button variant="ghost" size="icon" className="size-8">
            <PanelLeftClose className="size-4" />
          </Button>
        </HoverTooltip>
      </div>
      <div className="bg-background border-border flex h-12 w-48 items-center rounded-lg border px-4">
        <HoverTooltip content="サイドバーを開く" side="bottom">
          <Button variant="ghost" size="icon" className="size-8">
            <PanelLeft className="size-4" />
          </Button>
        </HoverTooltip>
      </div>
    </div>
  );
}

function LayoutOpen() {
  return (
    <div className="border-border flex h-64 w-[600px] overflow-hidden rounded-lg border">
      <div className="bg-surface-container border-border w-64 shrink-0 border-r">
        <div className="border-border flex h-12 items-center justify-between border-b px-2">
          <span className="text-muted-foreground text-sm">NavUser</span>
          <Button variant="ghost" size="icon" className="size-8">
            <PanelLeftClose className="size-4" />
          </Button>
        </div>
        <div className="p-4">
          <div className="bg-container text-muted-foreground rounded p-2 text-center text-xs">
            サイドバー
          </div>
        </div>
      </div>
      <div className="bg-background flex-1">
        <div className="border-border flex h-12 items-center border-b px-4">
          <span className="text-muted-foreground text-sm">ヘッダー</span>
        </div>
        <div className="p-4">
          <div className="bg-container text-muted-foreground rounded p-2 text-center text-xs">
            メインコンテンツ
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutClosed() {
  return (
    <div className="border-border flex h-64 w-[600px] overflow-hidden rounded-lg border">
      <div className="bg-background flex-1">
        <div className="border-border flex h-12 items-center gap-2 border-b px-4">
          <Button variant="ghost" size="icon" className="size-8">
            <PanelLeft className="size-4" />
          </Button>
          <span className="text-muted-foreground text-sm">ヘッダー</span>
        </div>
        <div className="p-4">
          <div className="bg-container text-muted-foreground rounded p-2 text-center text-xs">
            メインコンテンツ（フル幅）
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** デフォルト状態。サイドバーが開いている。 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="h-[400px] w-64">
        <Story />
      </div>
    ),
  ],
};

/** NavUserを非表示にした状態。 */
export const HideNavUser: Story = {
  args: {
    hideNavUser: true,
  },
  decorators: [
    (Story) => (
      <div className="h-[400px] w-64">
        <Story />
      </div>
    ),
  ],
};

/** 折りたたみボタン。PanelLeftClose（閉じる）とPanelLeft（開く）の比較。 */
export const ToggleButtons: Story = {
  render: () => <ToggleButtonComparison />,
};

/** サイドバーが開いている状態のレイアウト。 */
export const LayoutWithSidebarOpen: Story = {
  render: () => <LayoutOpen />,
};

/** サイドバーが閉じている状態のレイアウト。 */
export const LayoutWithSidebarClosed: Story = {
  render: () => <LayoutClosed />,
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6 p-6">
      <ToggleButtonComparison />
      <LayoutOpen />
      <LayoutClosed />
    </div>
  ),
};
