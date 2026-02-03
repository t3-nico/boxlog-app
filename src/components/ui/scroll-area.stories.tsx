import type { Meta, StoryObj } from '@storybook/react';

import { ScrollArea, ScrollBar } from './scroll-area';
import { Separator } from './separator';

/**
 * ScrollArea - カスタムスクロールエリア
 *
 * ## 使用コンポーネント
 *
 * | コンポーネント | 用途 |
 * |----------------|------|
 * | ScrollArea | スクロール可能な領域（垂直スクロールバー自動） |
 * | ScrollBar | 追加のスクロールバー（水平方向が必要な場合） |
 *
 * ## 使い分け
 *
 * | パターン | 実装 | ユースケース |
 * |----------|------|--------------|
 * | 垂直のみ | ScrollArea のみ | リスト、ドロップダウン内容 |
 * | 水平のみ | ScrollArea + ScrollBar horizontal | カルーセル、タブ |
 * | 両方向 | ScrollArea + ScrollBar horizontal | テーブル、グリッド |
 *
 * ## ScrollArea vs overflow-auto
 *
 * | 観点 | ScrollArea | overflow-auto |
 * |------|------------|---------------|
 * | 見た目 | カスタムスクロールバー | OS標準 |
 * | ホバー表示 | 対応（type="hover"） | 不可 |
 * | 推奨 | ドロップダウン、モーダル内 | 全画面レイアウト |
 */
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

const tags = Array.from({ length: 50 }).map((_, i, a) => `タグ ${a.length - i}`);

export const Default: Story = {
  render: () => (
    <ScrollArea className="border-border h-72 w-48 rounded-lg border">
      <div className="p-4">
        <h4 className="mb-4 text-sm leading-none font-bold">タグ一覧</h4>
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
    <ScrollArea className="border-border w-96 rounded-lg border whitespace-nowrap">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bg-container flex h-32 w-32 shrink-0 items-center justify-center rounded-lg"
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
    <ScrollArea className="border-border h-72 w-72 rounded-lg border">
      <div className="p-4" style={{ width: '600px' }}>
        <h4 className="mb-4 text-sm font-bold">縦横スクロール</h4>
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="bg-container flex h-20 w-20 items-center justify-center rounded-lg text-sm"
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
    <div className="border-border w-80 rounded-lg border">
      <div className="border-border border-b p-4">
        <h3 className="font-bold">通知</h3>
      </div>
      <ScrollArea className="h-64">
        <div className="p-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="border-border border-b py-4 last:border-0">
              <p className="text-sm font-bold">通知 {i + 1}</p>
              <p className="text-muted-foreground text-xs">1時間前</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};

export const AllPatterns: Story = {
  render: () => (
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">ScrollArea - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">垂直スクロール</h2>
          <ScrollArea className="border-border h-48 w-64 rounded-lg border">
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
          <h2 className="mb-4 text-lg font-bold">水平スクロール</h2>
          <ScrollArea className="border-border w-80 rounded-lg border">
            <div className="flex gap-4 p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-container flex h-24 w-24 shrink-0 items-center justify-center rounded-lg"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">特徴</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
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
