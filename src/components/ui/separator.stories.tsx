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

export const Default: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-80">
      <Separator {...args} />
    </div>
  ),
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    return (
      <div className="bg-background text-foreground min-h-screen w-full p-8">
        <h1 className="mb-2 text-2xl font-bold">Separator</h1>
        <p className="text-muted-foreground mb-8">コンテンツ間の区切り線</p>

        <div className="space-y-8">
          {/* 水平線 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">水平線（horizontal）</h2>
            <div className="max-w-md">
              <p>上のコンテンツ</p>
              <Separator className="my-4" />
              <p>下のコンテンツ</p>
            </div>
          </section>

          {/* 垂直線 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">垂直線（vertical）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              親要素に高さが必要（flex + h-* など）
            </p>
            <div className="flex h-8 items-center space-x-4 text-sm">
              <span>項目1</span>
              <Separator orientation="vertical" />
              <span>項目2</span>
              <Separator orientation="vertical" />
              <span>項目3</span>
            </div>
          </section>

          {/* リスト内 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">リスト・メニュー内</h2>
            <div className="w-64">
              <div className="py-2">メニュー1</div>
              <Separator />
              <div className="py-2">メニュー2</div>
              <Separator />
              <div className="py-2">メニュー3</div>
            </div>
          </section>

          {/* カード内 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">カード内</h2>
            <div className="border-border max-w-sm overflow-hidden rounded-lg border">
              <div className="p-4 font-bold">ヘッダー</div>
              <Separator />
              <div className="text-muted-foreground p-4 text-sm">コンテンツ</div>
              <Separator />
              <div className="p-4 text-sm">フッター</div>
            </div>
          </section>

          {/* ナビゲーション */}
          <section>
            <h2 className="mb-4 text-lg font-bold">ナビゲーション</h2>
            <div className="flex h-5 items-center space-x-4 text-sm">
              <div>ホーム</div>
              <Separator orientation="vertical" />
              <div>設定</div>
              <Separator orientation="vertical" />
              <div>ヘルプ</div>
            </div>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
