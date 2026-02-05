import type { Meta, StoryObj } from '@storybook/react';
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
      <div>
        <h1 className="mb-2 text-2xl font-bold">ContextMenu</h1>
        <p className="text-muted-foreground mb-8">
          右クリックで表示。テーブル行、カードのアクションメニュー。デスクトップ専用。
        </p>

        <div className="grid gap-8" style={{ maxWidth: '48rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">テーブル行アクション（主要用途）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              PlanTableRowで使用。右クリックで編集・複製・削除。
            </p>
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
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">variant: destructive</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              削除などの破壊的アクション。赤色で警告。
            </p>
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

          <div>
            <h2 className="mb-4 text-lg font-bold">ContextMenu vs DropdownMenu</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>ContextMenu</strong>: 右クリックで表示。デスクトップ専用、発見しにくい
                </li>
                <li>
                  <strong>DropdownMenu</strong>: ボタンクリックで表示。モバイル対応、視覚的に明示
                </li>
                <li>
                  <strong>使い分け</strong>:
                  パワーユーザー向けショートカット=ContextMenu、主要アクション=DropdownMenu
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>ContextMenu - ルートコンテナ</li>
                <li>ContextMenuTrigger - 右クリック対象（asChild対応）</li>
                <li>ContextMenuContent - コンテンツ（rounded-lg, shadow-lg）</li>
                <li>ContextMenuItem - メニュー項目（variant: default/destructive）</li>
                <li>ContextMenuSeparator - 区切り線</li>
                <li>ContextMenuShortcut - キーボードショートカット表示</li>
                <li>ContextMenuSub/SubTrigger/SubContent - サブメニュー</li>
                <li>ContextMenuCheckboxItem - チェックボックス項目</li>
                <li>ContextMenuRadioGroup/RadioItem - ラジオ項目</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>PlanTableRow - テーブル行の右クリックメニュー</li>
              <li>OverdueBadge - 期限切れバッジの右クリック</li>
              <li>CalendarEvent - カレンダーイベントの右クリック</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
