import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Sheetを開く</Button>
      </SheetTrigger>
      <SheetContent aria-label="詳細設定">
        <SheetHeader>
          <SheetTitle>設定</SheetTitle>
          <SheetDescription>
            アプリケーションの設定を変更します。
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <p>Sheetのコンテンツがここに表示されます。</p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">閉じる</Button>
          </SheetClose>
          <Button>保存</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const FromLeft: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">左から開く</Button>
      </SheetTrigger>
      <SheetContent side="left" aria-label="ナビゲーション">
        <SheetHeader>
          <SheetTitle>メニュー</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 p-4">
          <a href="#" className="p-2 hover:bg-state-hover rounded">ホーム</a>
          <a href="#" className="p-2 hover:bg-state-hover rounded">設定</a>
          <a href="#" className="p-2 hover:bg-state-hover rounded">ヘルプ</a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const FromTop: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">上から開く</Button>
      </SheetTrigger>
      <SheetContent side="top" aria-label="通知">
        <SheetHeader>
          <SheetTitle>通知</SheetTitle>
          <SheetDescription>
            最新の通知を確認できます。
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <div className="space-y-2">
            <div className="p-3 bg-card border border-border rounded-lg">
              <p className="font-medium">新しいメッセージ</p>
              <p className="text-sm text-muted-foreground">1分前</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const FromBottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">下から開く</Button>
      </SheetTrigger>
      <SheetContent side="bottom" aria-label="アクション">
        <SheetHeader>
          <SheetTitle>アクション</SheetTitle>
        </SheetHeader>
        <div className="p-4 flex gap-4">
          <Button className="flex-1">共有</Button>
          <Button className="flex-1" variant="outline">コピー</Button>
          <Button className="flex-1" variant="destructive">削除</Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>プロフィール編集</Button>
      </SheetTrigger>
      <SheetContent aria-label="プロフィール編集">
        <SheetHeader>
          <SheetTitle>プロフィール編集</SheetTitle>
          <SheetDescription>
            プロフィール情報を更新します。
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-name">名前</Label>
            <Input id="sheet-name" defaultValue="山田太郎" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sheet-email">メールアドレス</Label>
            <Input id="sheet-email" type="email" defaultValue="taro@example.com" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">キャンセル</Button>
          </SheetClose>
          <Button>保存</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">閉じるボタンなし</Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} aria-label="カスタムSheet">
        <SheetHeader>
          <SheetTitle>カスタムSheet</SheetTitle>
          <SheetDescription>
            閉じるボタンを非表示にしたSheetです。
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <p>独自の閉じるボタンを配置できます。</p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>閉じる</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Sheet - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">表示位置</h2>
          <div className="flex flex-wrap gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">右（デフォルト）</Button>
              </SheetTrigger>
              <SheetContent aria-label="右からのSheet">
                <SheetHeader>
                  <SheetTitle>右からのSheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">左</Button>
              </SheetTrigger>
              <SheetContent side="left" aria-label="左からのSheet">
                <SheetHeader>
                  <SheetTitle>左からのSheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">上</Button>
              </SheetTrigger>
              <SheetContent side="top" aria-label="上からのSheet">
                <SheetHeader>
                  <SheetTitle>上からのSheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">下</Button>
              </SheetTrigger>
              <SheetContent side="bottom" aria-label="下からのSheet">
                <SheetHeader>
                  <SheetTitle>下からのSheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Drawer との違い</h2>
          <p className="text-sm text-muted-foreground">
            <strong>Sheet</strong>: Radix UIベース。アニメーションが速い。<br />
            <strong>Drawer</strong>: Vaulベース。スワイプで閉じられる。モバイル向き。
          </p>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
