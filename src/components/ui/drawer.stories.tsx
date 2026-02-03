import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Drawerを開く</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer タイトル</DrawerTitle>
          <DrawerDescription>
            ここにDrawerの説明が入ります。
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Drawerのコンテンツがここに表示されます。</p>
        </div>
        <DrawerFooter>
          <Button>保存</Button>
          <DrawerClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const FromTop: Story = {
  render: () => (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button variant="outline">上から開く</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>上からのDrawer</DrawerTitle>
          <DrawerDescription>
            上から表示されるDrawerです。
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>コンテンツ</p>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

export const FromLeft: Story = {
  render: () => (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">左から開く</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>左からのDrawer</DrawerTitle>
          <DrawerDescription>
            サイドバーのような使い方。
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 flex-1">
          <ul className="space-y-2">
            <li className="p-2 hover:bg-state-hover rounded">メニュー1</li>
            <li className="p-2 hover:bg-state-hover rounded">メニュー2</li>
            <li className="p-2 hover:bg-state-hover rounded">メニュー3</li>
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

export const FromRight: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">右から開く</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>右からのDrawer</DrawerTitle>
          <DrawerDescription>
            詳細パネルのような使い方。
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 flex-1">
          <p>詳細情報がここに表示されます。</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">閉じる</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WithScrollContent: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">長いコンテンツ</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>スクロールコンテンツ</DrawerTitle>
          <DrawerDescription>
            コンテンツが長い場合はスクロールできます。
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-auto max-h-[50vh]">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="py-2">
              アイテム {i + 1}
            </p>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">閉じる</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Drawer - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">方向</h2>
          <div className="flex flex-wrap gap-4">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">下から（デフォルト）</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>下からのDrawer</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">コンテンツ</div>
              </DrawerContent>
            </Drawer>

            <Drawer direction="top">
              <DrawerTrigger asChild>
                <Button variant="outline">上から</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>上からのDrawer</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">コンテンツ</div>
              </DrawerContent>
            </Drawer>

            <Drawer direction="left">
              <DrawerTrigger asChild>
                <Button variant="outline">左から</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>左からのDrawer</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">コンテンツ</div>
              </DrawerContent>
            </Drawer>

            <Drawer direction="right">
              <DrawerTrigger asChild>
                <Button variant="outline">右から</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>右からのDrawer</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">コンテンツ</div>
              </DrawerContent>
            </Drawer>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用場面</h2>
          <p className="text-sm text-muted-foreground">
            Drawerはモバイルでよく使用されるパターンです。
            下からスワイプで閉じることができます。
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
            <li>モバイルのナビゲーションメニュー</li>
            <li>フィルター設定</li>
            <li>詳細情報の表示</li>
            <li>アクションシート</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
