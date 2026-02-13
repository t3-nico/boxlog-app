import type { Meta, StoryObj } from '@storybook/react';
import { PanelLeft, PanelLeftClose, SquarePen } from 'lucide-react';
import { useState } from 'react';

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
// インタラクティブデモ
// ---------------------------------------------------------------------------

function InteractiveDemo() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-border flex h-80 w-[640px] overflow-hidden rounded-xl border">
      {/* サイドバー */}
      <div
        className="bg-surface-container border-border shrink-0 overflow-hidden border-r transition-[width] duration-200 ease-in-out"
        style={{ width: isOpen ? 240 : 0 }}
      >
        <div className="flex h-full w-60 flex-col">
          {/* Header */}
          <div className="flex h-12 shrink-0 items-center justify-between px-2">
            <div className="flex items-center gap-2 px-2">
              <div className="bg-muted size-6 rounded-full" />
              <span className="text-foreground text-sm font-normal">User</span>
            </div>
            <div className="flex items-center gap-1">
              <HoverTooltip content="サイドバーを閉じる" side="bottom">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setIsOpen(false)}
                  aria-label="サイドバーを閉じる"
                >
                  <PanelLeftClose className="size-4" />
                </Button>
              </HoverTooltip>
              <Button variant="ghost" size="icon" className="size-8" aria-label="作成">
                <SquarePen className="size-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {['カレンダー', 'プラン', '記録', '統計'].map((label) => (
                <div
                  key={label}
                  className="text-muted-foreground hover:bg-state-hover rounded-md px-3 py-1.5 text-sm"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="bg-background flex flex-1 flex-col">
        <div className="border-border flex h-12 shrink-0 items-center gap-2 border-b px-4">
          {!isOpen && (
            <HoverTooltip content="サイドバーを開く" side="bottom">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setIsOpen(true)}
                aria-label="サイドバーを開く"
              >
                <PanelLeft className="size-4" />
              </Button>
            </HoverTooltip>
          )}
          <span className="text-muted-foreground text-sm">ヘッダー</span>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="bg-container text-muted-foreground rounded-lg p-6 text-center text-sm">
            メインコンテンツ
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 静的ヘルパー
// ---------------------------------------------------------------------------

function ToggleButtonComparison() {
  return (
    <div className="flex items-start gap-8 p-6">
      <div className="bg-surface-container border-border flex h-12 w-48 items-center justify-end rounded-lg border px-2">
        <HoverTooltip content="サイドバーを閉じる" side="bottom">
          <Button variant="ghost" size="icon" className="size-8" aria-label="サイドバーを閉じる">
            <PanelLeftClose className="size-4" />
          </Button>
        </HoverTooltip>
      </div>
      <div className="bg-background border-border flex h-12 w-48 items-center rounded-lg border px-4">
        <HoverTooltip content="サイドバーを開く" side="bottom">
          <Button variant="ghost" size="icon" className="size-8" aria-label="サイドバーを開く">
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
          <Button variant="ghost" size="icon" className="size-8" aria-label="サイドバーを閉じる">
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
          <Button variant="ghost" size="icon" className="size-8" aria-label="サイドバーを開く">
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

/**
 * インタラクティブデモ。パネルアイコンをクリックでサイドバーが開閉する。
 *
 * 実装のポイント:
 * - 本番では `useSidebarStore.use.toggle()` で状態管理
 * - `transition-[width]` で幅アニメーション
 * - 閉じた時はヘッダーに開くボタンが出現
 */
export const Interactive: Story = {
  render: () => <InteractiveDemo />,
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
      <h3 className="text-foreground text-sm font-bold">Interactive</h3>
      <InteractiveDemo />
      <h3 className="text-foreground text-sm font-bold">Toggle Buttons</h3>
      <ToggleButtonComparison />
      <h3 className="text-foreground text-sm font-bold">Layout Open</h3>
      <LayoutOpen />
      <h3 className="text-foreground text-sm font-bold">Layout Closed</h3>
      <LayoutClosed />
    </div>
  ),
};
