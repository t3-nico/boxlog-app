import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Moon, Search, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';

/** カレンダーサイドバー。タグフィルター、ナビゲーション、ユーティリティを含む。 */
const meta = {
  title: 'Features/Sidebar/CalendarSidebar',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント
// ---------------------------------------------------------------------------

function UtilitiesLight() {
  return (
    <div className="bg-surface-container flex w-fit items-center gap-1 rounded-lg p-2">
      <HoverTooltip content="通知" side="right">
        <Button variant="ghost" icon className="size-8">
          <Bell className="size-4" />
        </Button>
      </HoverTooltip>
      <HoverTooltip content="検索" side="right">
        <Button variant="ghost" icon className="size-8">
          <Search className="size-4" />
        </Button>
      </HoverTooltip>
      <HoverTooltip content="ダークモード" side="right">
        <Button variant="ghost" icon className="size-8">
          <Moon className="size-4" />
        </Button>
      </HoverTooltip>
    </div>
  );
}

function UtilitiesDark() {
  return (
    <div className="bg-surface-container flex w-fit items-center gap-1 rounded-lg p-2">
      <HoverTooltip content="通知" side="right">
        <Button variant="ghost" icon className="size-8">
          <Bell className="size-4" />
        </Button>
      </HoverTooltip>
      <HoverTooltip content="検索" side="right">
        <Button variant="ghost" icon className="size-8">
          <Search className="size-4" />
        </Button>
      </HoverTooltip>
      <HoverTooltip content="ライトモード" side="right">
        <Button variant="ghost" icon className="size-8">
          <Sun className="size-4" />
        </Button>
      </HoverTooltip>
    </div>
  );
}

function SidebarStructure() {
  return (
    <div className="border-border h-[400px] w-64 overflow-hidden rounded-lg border">
      <div className="bg-surface-container border-border flex h-12 items-center justify-between border-b px-2">
        <div className="text-muted-foreground text-sm">NavUser</div>
        <div className="text-muted-foreground text-xs">作成 | 閉じる</div>
      </div>
      <div className="bg-surface-container flex h-[calc(100%-48px)] flex-col">
        <div className="border-border border-b p-2">
          <div className="bg-container text-muted-foreground rounded p-2 text-center text-xs">
            SidebarNavigation
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <div className="bg-container text-muted-foreground h-full rounded p-2 text-center text-xs">
            CalendarFilterList
          </div>
        </div>
        <div className="border-border border-t p-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" icon className="size-8">
              <Bell className="size-4" />
            </Button>
            <Button variant="ghost" icon className="size-8">
              <Search className="size-4" />
            </Button>
            <Button variant="ghost" icon className="size-8">
              <Moon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** SidebarUtilities（ライトモード時）。通知・検索・テーマ切替ボタン。 */
export const UtilitiesLightMode: Story = {
  render: () => <UtilitiesLight />,
};

/** SidebarUtilities（ダークモード時）。Sunアイコン表示。 */
export const UtilitiesDarkMode: Story = {
  render: () => <UtilitiesDark />,
};

/** サイドバー全体構成。Header + Navigation + FilterList + Utilities。 */
export const FullStructure: Story = {
  render: () => <SidebarStructure />,
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <UtilitiesLight />
      <UtilitiesDark />
      <SidebarStructure />
    </div>
  ),
};
