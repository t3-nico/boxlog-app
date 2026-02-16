import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarPlus, Clock, Tag } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * CreateNewDropdown / EmptyAreaContextMenu は useCreateMenuItems フックに依存するため、
 * Storybook ではビジュアルモックで UI パターンを再現する。
 *
 * 両コンポーネントは同じメニュー項目（Plan / Record / Tag）を共有しており、
 * useCreateMenuItems フックで一元管理されている。
 */

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Features/Navigation/CreateMenu',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// 共通メニュー項目定義（useCreateMenuItems の出力を再現）
// ---------------------------------------------------------------------------

const menuItems = [
  { id: 'plan', icon: CalendarPlus, label: '予定を作成' },
  { id: 'record', icon: Clock, label: '記録を作成' },
  { id: 'separator' },
  { id: 'tag', icon: Tag, label: 'タグを作成' },
] as const;

// ---------------------------------------------------------------------------
// ビジュアルモック: DropdownMenu版（Sidebar）
// ---------------------------------------------------------------------------

function MockDropdownMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger className="bg-card border-border inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium">
        新規作成
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={4}>
        {menuItems.map((item, index) => {
          if (item.id === 'separator') {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          const IconComponent = item.icon;

          return (
            <DropdownMenuItem key={item.id}>
              {IconComponent && <IconComponent className="size-4" />}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// ビジュアルモック: ContextMenu版（Calendar右クリック）
// ---------------------------------------------------------------------------

function MockContextMenu() {
  return (
    <div className="bg-card text-card-foreground border-border animate-in fade-in-0 zoom-in-95 min-w-[12rem] rounded-lg border p-1 shadow-lg">
      {menuItems.map((item, index) => {
        if (item.id === 'separator') {
          return <div key={`separator-${index}`} className="bg-border my-1 h-px" />;
        }

        const IconComponent = item.icon;

        return (
          <button
            type="button"
            key={item.id}
            className={cn(
              'flex w-full cursor-default items-center gap-2 rounded px-2 py-2 text-left text-sm outline-hidden transition-colors select-none',
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              "text-foreground hover:bg-state-hover focus:bg-state-focus [&_svg:not([class*='text-'])]:text-muted-foreground",
            )}
          >
            {IconComponent && <IconComponent />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Sidebar の新規作成ドロップダウン。Plan / Record / Tag の3項目。 */
export const Dropdown: Story = {
  render: () => <MockDropdownMenu defaultOpen />,
};

/** カレンダー空白エリアの右クリックメニュー。同じ項目を共有。 */
export const ContextMenu: Story = {
  render: () => <MockContextMenu />,
};

/** 両方のメニューを並べて表示。共通フック (useCreateMenuItems) で項目が統一されていることを確認。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">Sidebar DropdownMenu</p>
        <MockDropdownMenu defaultOpen />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">Calendar ContextMenu（右クリック）</p>
        <MockContextMenu />
      </div>
    </div>
  ),
};
