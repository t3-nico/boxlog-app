import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu';

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm">
        右クリックしてください
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          戻る
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          進む
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          再読み込み
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          ページを保存
          <ContextMenuShortcut>⌘S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>印刷...</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithSubMenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm">
        右クリックしてください
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>新しいタブ</ContextMenuItem>
        <ContextMenuItem>新しいウィンドウ</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>共有</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>メール</ContextMenuItem>
            <ContextMenuItem>メッセージ</ContextMenuItem>
            <ContextMenuItem>ノート</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>
          印刷
          <ContextMenuShortcut>⌘P</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxes: Story = {
  render: function CheckboxStory() {
    const [showBookmarks, setShowBookmarks] = useState(true);
    const [showFullUrls, setShowFullUrls] = useState(false);

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm">
          右クリックしてください
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuCheckboxItem
            checked={showBookmarks}
            onCheckedChange={setShowBookmarks}
          >
            ブックマークバーを表示
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={showFullUrls}
            onCheckedChange={setShowFullUrls}
          >
            完全なURLを表示
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

export const WithRadioGroup: Story = {
  render: function RadioGroupStory() {
    const [person, setPerson] = useState('pedro');

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm">
          右クリックしてください
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel inset>ユーザー</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
            <ContextMenuRadioItem value="pedro">山田太郎</ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm">鈴木花子</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

export const Destructive: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm">
        右クリックしてください
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>編集</ContextMenuItem>
        <ContextMenuItem>複製</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">削除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">ContextMenu - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">基本</h2>
          <ContextMenu>
            <ContextMenuTrigger className="flex h-24 w-48 items-center justify-center rounded-md border border-dashed border-border text-sm">
              右クリック
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>アイテム1</ContextMenuItem>
              <ContextMenuItem>アイテム2</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>アイテム3</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用場面</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>ファイル/フォルダの操作</li>
            <li>テーブル行のアクション</li>
            <li>カンバスやエディタでのコンテキストメニュー</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">注意点</h2>
          <p className="text-sm text-muted-foreground">
            モバイルでは右クリックが使えないため、長押しやボタンによる代替手段を用意してください。
          </p>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
