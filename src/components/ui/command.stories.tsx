import type { Meta, StoryObj } from '@storybook/react';
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from './button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command';

const meta = {
  title: 'Components/Command',
  component: Command,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '384px', minWidth: '384px', flexShrink: 0 }}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="検索..." />
        <CommandList>
          <CommandEmpty>結果がありません。</CommandEmpty>
          <CommandGroup heading="候補">
            <CommandItem>
              <Calendar className="mr-2" />
              <span>カレンダー</span>
            </CommandItem>
            <CommandItem>
              <Smile className="mr-2" />
              <span>絵文字を検索</span>
            </CommandItem>
            <CommandItem>
              <Calculator className="mr-2" />
              <span>計算機</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="設定">
            <CommandItem>
              <User className="mr-2" />
              <span>プロフィール</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2" />
              <span>請求</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2" />
              <span>設定</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

export const Dialog: Story = {
  render: function CommandDialogStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          コマンドパレットを開く
          <kbd className="bg-muted text-muted-foreground pointer-events-none ml-2 inline-flex h-5 items-center gap-1 rounded border px-2 font-mono text-[10px] font-bold opacity-100 select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="コマンドを検索..." />
          <CommandList>
            <CommandEmpty>結果がありません。</CommandEmpty>
            <CommandGroup heading="アクション">
              <CommandItem>
                <Calendar className="mr-2" />
                <span>新しいイベント</span>
              </CommandItem>
              <CommandItem>
                <User className="mr-2" />
                <span>プロフィール</span>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2" />
                <span>設定</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};

export const WithShortcuts: Story = {
  render: () => (
    <div style={{ width: '384px', minWidth: '384px', flexShrink: 0 }}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="検索..." />
        <CommandList>
          <CommandEmpty>結果がありません。</CommandEmpty>
          <CommandGroup heading="アクション">
            <CommandItem>
              <span>新規作成</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>保存</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>コピー</span>
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>ペースト</span>
              <CommandShortcut>⌘V</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [dialogOpen, setDialogOpen] = useState(false);
    return (
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-8 text-2xl font-bold">Command - 全バリエーション</h1>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-bold">インライン</h2>
            <div style={{ width: '384px', minWidth: '384px', flexShrink: 0 }}>
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="検索..." />
                <CommandList>
                  <CommandEmpty>結果がありません。</CommandEmpty>
                  <CommandGroup heading="アプリ">
                    <CommandItem>
                      <Calendar className="mr-2" />
                      <span>カレンダー</span>
                    </CommandItem>
                    <CommandItem>
                      <Settings className="mr-2" />
                      <span>設定</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold">ダイアログ</h2>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              ⌘K でコマンドパレットを開く
            </Button>
            <CommandDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <CommandInput placeholder="コマンドを検索..." />
              <CommandList>
                <CommandEmpty>結果がありません。</CommandEmpty>
                <CommandGroup heading="アクション">
                  <CommandItem onSelect={() => setDialogOpen(false)}>
                    <Calendar className="mr-2" />
                    <span>新しいイベント</span>
                    <CommandShortcut>⌘E</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setDialogOpen(false)}>
                    <User className="mr-2" />
                    <span>プロフィール</span>
                    <CommandShortcut>⌘P</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="設定">
                  <CommandItem onSelect={() => setDialogOpen(false)}>
                    <Settings className="mr-2" />
                    <span>設定を開く</span>
                    <CommandShortcut>⌘,</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold">使用場面</h2>
            <ul className="text-muted-foreground list-inside list-disc text-sm">
              <li>コマンドパレット（⌘K）</li>
              <li>検索可能なセレクター</li>
              <li>アクションメニュー</li>
            </ul>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
