import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Settings, X } from 'lucide-react';

import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'ghost', 'destructive'],
      description: 'ボタンのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon-sm', 'icon', 'icon-lg'],
      description: 'ボタンのサイズ',
    },
    isLoading: {
      control: 'boolean',
      description: 'ローディング状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'ラベル',
    variant: 'primary',
  },
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    return (
      <div className="bg-background text-foreground min-h-screen space-y-8 p-8">
        <h1 className="text-2xl font-bold">Button - スタイル一覧</h1>

        {/* 塗りボタン（Solid Fill） */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">塗りボタン（Solid Fill）</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm">
              ラベル
            </Button>
            <Button variant="primary" size="default">
              ラベル
            </Button>
            <Button variant="primary" size="lg">
              ラベル
            </Button>
            <Button variant="destructive">ラベル</Button>
          </div>
        </section>

        {/* アウトラインボタン（Outline） */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">アウトラインボタン（Outline）</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              ラベル
            </Button>
            <Button variant="outline" size="default">
              ラベル
            </Button>
            <Button variant="outline" size="lg">
              ラベル
            </Button>
            <Button variant="outline" disabled>
              ラベル
            </Button>
          </div>
        </section>

        {/* ゴーストボタン（Ghost） */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">ゴーストボタン（Ghost）</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm">
              ラベル
            </Button>
            <Button variant="ghost" size="default">
              ラベル
            </Button>
            <Button variant="ghost" size="lg">
              ラベル
            </Button>
            <Button variant="ghost" disabled>
              ラベル
            </Button>
          </div>
        </section>

        {/* アイコンボタン */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">アイコンボタン</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="追加">
              <Plus className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="設定">
              <Settings className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-lg" aria-label="閉じる">
              <X className="size-5" />
            </Button>
            <Button variant="outline" size="icon" aria-label="設定">
              <Settings className="size-4" />
            </Button>
          </div>
        </section>

        {/* 状態 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">状態</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button isLoading>保存中</Button>
            <Button isLoading loadingText="処理中...">
              保存
            </Button>
            <Button disabled>無効</Button>
          </div>
        </section>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
