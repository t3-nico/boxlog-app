import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { Spinner } from './spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: {
      control: 'text',
      description: '追加のクラス名',
    },
    'aria-label': {
      control: 'text',
      description: 'アクセシビリティ用のラベル',
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-3" aria-label="読み込み中（小）" />
      <Spinner className="size-4" aria-label="読み込み中（標準）" />
      <Spinner className="size-5" aria-label="読み込み中（中）" />
      <Spinner className="size-6" aria-label="読み込み中（大）" />
      <Spinner className="size-8" aria-label="読み込み中（特大）" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="text-foreground" />
      <Spinner className="text-primary" />
      <Spinner className="text-muted-foreground" />
      <Spinner className="text-destructive" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <Spinner className="mr-2" aria-label="保存中" />
        保存中...
      </Button>
      <Button variant="outline" disabled>
        <Spinner className="mr-2" aria-label="読み込み中" />
        読み込み中...
      </Button>
    </div>
  ),
};

export const Inline: Story = {
  render: () => (
    <p className="text-sm">
      データを読み込んでいます <Spinner className="inline size-3" aria-label="読み込み中" />
    </p>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Spinner - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">サイズ</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Spinner className="size-3 mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">size-3</p>
            </div>
            <div className="text-center">
              <Spinner className="size-4 mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">size-4（デフォルト）</p>
            </div>
            <div className="text-center">
              <Spinner className="size-6 mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">size-6</p>
            </div>
            <div className="text-center">
              <Spinner className="size-8 mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">size-8</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">ボタン内</h2>
          <div className="flex gap-4">
            <Button disabled>
              <Spinner className="mr-2" />
              処理中
            </Button>
            <Button variant="destructive" disabled>
              <Spinner className="mr-2" />
              削除中
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">ページ読み込み</h2>
          <div className="flex flex-col items-center gap-2 p-8 border border-border rounded-lg">
            <Spinner className="size-8" aria-label="ページを読み込んでいます" />
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">アクセシビリティ</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>role="status" が設定済み</li>
            <li>aria-live="polite" で読み上げ対応</li>
            <li>motion-reduce でアニメーション無効化</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
