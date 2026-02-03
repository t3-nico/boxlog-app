import type { Meta, StoryObj } from '@storybook/react';

import { ScrollArea, ScrollBar } from './scroll-area';
import { Separator } from './separator';

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `タグ ${a.length - i}`
);

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border border-border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">タグ一覧</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border border-border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-32 h-32 bg-container rounded-md flex items-center justify-center"
          >
            アイテム {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const BothDirections: Story = {
  render: () => (
    <ScrollArea className="h-72 w-72 rounded-md border border-border">
      <div className="p-4" style={{ width: '600px' }}>
        <h4 className="mb-4 text-sm font-medium">縦横スクロール</h4>
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="w-20 h-20 bg-container rounded-md flex items-center justify-center text-sm"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-80 border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium">通知</h3>
      </div>
      <ScrollArea className="h-64">
        <div className="p-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="py-3 border-b border-border last:border-0">
              <p className="text-sm font-medium">通知 {i + 1}</p>
              <p className="text-xs text-muted-foreground">
                1時間前
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">ScrollArea - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">垂直スクロール</h2>
          <ScrollArea className="h-48 w-64 rounded-md border border-border">
            <div className="p-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="py-2 text-sm">
                  アイテム {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">水平スクロール</h2>
          <ScrollArea className="w-80 rounded-md border border-border">
            <div className="flex gap-4 p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-24 h-24 bg-container rounded-md flex items-center justify-center"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">特徴</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>ホバー時にスクロールバーを表示</li>
            <li>ネイティブスクロールのパフォーマンス</li>
            <li>カスタマイズ可能なスクロールバー</li>
            <li>水平・垂直・両方向に対応</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
