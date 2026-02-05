import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, CheckSquare, Menu, Settings } from 'lucide-react';
import { useState } from 'react';

import { Button } from './button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function SheetStory() {
    const [leftOpen, setLeftOpen] = useState(false);
    const [bottomOpen, setBottomOpen] = useState(false);

    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Sheet</h1>
        <p className="text-muted-foreground mb-8">画面端からスライドするパネル。モバイル専用。</p>

        <div className="grid max-w-3xl gap-8">
          <div>
            <h2 className="mb-2 text-lg font-bold">side: left（ナビゲーション）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              モバイルのサイドメニュー。ハンバーガーメニューから開く。
            </p>
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="メニュー"
                onClick={() => setLeftOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <SheetContent side="left" aria-label="ナビゲーション">
                <SheetHeader>
                  <SheetTitle>メニュー</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 p-4">
                  <Button variant="ghost" className="justify-start">
                    <Calendar className="mr-2 size-4" />
                    カレンダー
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <CheckSquare className="mr-2 size-4" />
                    タスク
                  </Button>
                  <Button variant="ghost" className="justify-start">
                    <Settings className="mr-2 size-4" />
                    設定
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">side: bottom（フルスクリーン）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              モバイル設定画面。h-[100dvh]でフルスクリーン表示。
            </p>
            <Sheet open={bottomOpen} onOpenChange={setBottomOpen}>
              <Button onClick={() => setBottomOpen(true)}>設定を開く</Button>
              <SheetContent
                side="bottom"
                className="h-[100dvh]"
                showCloseButton={false}
                aria-label="設定"
              >
                <SheetHeader className="border-border border-b p-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle>設定</SheetTitle>
                    <Button variant="ghost" size="sm" onClick={() => setBottomOpen(false)}>
                      閉じる
                    </Button>
                  </div>
                </SheetHeader>
                <div className="p-4">
                  <p className="text-muted-foreground">設定コンテンツ</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント構成</h2>
            <div className="bg-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>Sheet - ルートコンテナ（状態管理）</li>
                <li>SheetContent - コンテンツ（side: left/bottom）</li>
                <li>SheetHeader - ヘッダー</li>
                <li>SheetTitle - タイトル</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>mobile-layout - side: left（モバイルナビゲーション）</li>
              <li>SettingsModal - side: bottom（モバイル設定）</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
