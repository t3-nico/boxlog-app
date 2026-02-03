import type { Meta, StoryObj } from '@storybook/react';

import { Separator } from './separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '方向',
    },
    decorative: {
      control: 'boolean',
      description: '装飾的（アクセシビリティ用）',
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-80">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          オープンソースのUIコンポーネントライブラリ
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>ブログ</div>
        <Separator orientation="vertical" />
        <div>ドキュメント</div>
        <Separator orientation="vertical" />
        <div>ソース</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center space-x-4 text-sm">
      <div>ホーム</div>
      <Separator orientation="vertical" />
      <div>設定</div>
      <Separator orientation="vertical" />
      <div>ヘルプ</div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-64">
      <div className="py-2">メニュー1</div>
      <Separator />
      <div className="py-2">メニュー2</div>
      <Separator />
      <div className="py-2">メニュー3</div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-80 border border-border rounded-lg">
      <div className="p-4">
        <h3 className="font-medium">ヘッダー</h3>
      </div>
      <Separator />
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          カードのコンテンツがここに入ります。
        </p>
      </div>
      <Separator />
      <div className="p-4">
        <p className="text-sm">フッター</p>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Separator - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">水平線</h2>
          <div className="max-w-md">
            <p>上のコンテンツ</p>
            <Separator className="my-4" />
            <p>下のコンテンツ</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">垂直線</h2>
          <div className="flex h-8 items-center space-x-4 text-sm">
            <span>項目1</span>
            <Separator orientation="vertical" />
            <span>項目2</span>
            <Separator orientation="vertical" />
            <span>項目3</span>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">カード内</h2>
          <div className="max-w-sm border border-border rounded-lg overflow-hidden">
            <div className="p-4 font-medium">タイトル</div>
            <Separator />
            <div className="p-4 text-sm text-muted-foreground">
              コンテンツ
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用場面</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>セクション間の区切り</li>
            <li>メニュー項目のグループ化</li>
            <li>カードのヘッダー/フッター分離</li>
            <li>ナビゲーション項目の区切り</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
