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
        <h4 className="text-sm leading-none font-bold">Radix Primitives</h4>
        <p className="text-muted-foreground text-sm">オープンソースのUIコンポーネントライブラリ</p>
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
    <div className="border-border w-80 rounded-lg border">
      <div className="p-4">
        <h3 className="font-bold">ヘッダー</h3>
      </div>
      <Separator />
      <div className="p-4">
        <p className="text-muted-foreground text-sm">カードのコンテンツがここに入ります。</p>
      </div>
      <Separator />
      <div className="p-4">
        <p className="text-sm">フッター</p>
      </div>
    </div>
  ),
};

export const AllPatterns: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">Separator - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">水平線</h2>
          <div className="max-w-md">
            <p>上のコンテンツ</p>
            <Separator className="my-4" />
            <p>下のコンテンツ</p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">垂直線</h2>
          <div className="flex h-8 items-center space-x-4 text-sm">
            <span>項目1</span>
            <Separator orientation="vertical" />
            <span>項目2</span>
            <Separator orientation="vertical" />
            <span>項目3</span>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">カード内</h2>
          <div className="border-border max-w-sm overflow-hidden rounded-lg border">
            <div className="p-4 font-bold">タイトル</div>
            <Separator />
            <div className="text-muted-foreground p-4 text-sm">コンテンツ</div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">使用場面</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
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
