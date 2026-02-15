import type { Meta, StoryObj } from '@storybook/react-vite';
import { Clipboard, Copy, Edit, RotateCw, Trash2 } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './context-menu';

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: () => {
    return (
      <div className="flex flex-col items-start gap-6">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="bg-card hover:bg-state-hover border-border flex cursor-context-menu items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-normal">ミーティング準備</p>
                <p className="text-muted-foreground text-sm">10:00 - 11:00</p>
              </div>
              <span className="text-muted-foreground text-xs">右クリックでメニュー</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Edit className="mr-2 size-4" />
              編集
              <ContextMenuShortcut>⌘E</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              <Copy className="mr-2 size-4" />
              複製
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              <Clipboard className="mr-2 size-4" />
              コピー
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <RotateCw className="mr-2 size-4" />
              繰り返しに変換
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">
              <Trash2 className="mr-2 size-4" />
              削除
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="bg-card hover:bg-state-hover border-border flex cursor-context-menu items-center justify-between rounded-lg border p-4">
              <p>タグを右クリック</p>
              <span className="border-primary text-primary rounded-full border px-2 py-1 text-xs">
                仕事
              </span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Edit className="mr-2 size-4" />
              タグを編集
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">
              <Trash2 className="mr-2 size-4" />
              タグを削除
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    );
  },
};
