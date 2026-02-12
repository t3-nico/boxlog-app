import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Search, Settings, Smile, Trash2, X } from 'lucide-react';
import { expect, fn } from 'storybook/test';

import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  argTypes: {
    children: {
      control: 'text',
      name: 'テキスト',
      description: 'ボタンに表示するテキスト',
    },
    variant: {
      control: 'select',
      options: ['primary', 'outline', 'ghost', 'destructive'],
      description: 'ボタンのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'ボタンのサイズ（sm: 32px, default: 36px, lg: 44px）',
    },
    isLoading: {
      control: 'boolean',
      description: 'ローディング状態（スピナー表示、クリック無効化）',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態（半透明、クリック無効化）',
    },
    icon: { control: false, table: { disable: true } },
    asChild: { control: false, table: { disable: true } },
    loadingText: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'ラベル',
    variant: 'primary',
    size: 'default',
    isLoading: false,
    disabled: false,
  },
  render: function DefaultStory({ children, ...args }) {
    return (
      <Button {...args}>
        {children}
        <Smile className="size-4" />
      </Button>
    );
  },
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    return (
      <div className="flex flex-col items-start gap-6">
        <div className="bg-container space-y-4 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Button variant="primary" className="w-28">
              primary
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="w-28">
              outline
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="w-28">
              ghost
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="destructive" className="w-28">
              destructive
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">保存</Button>
            <Button variant="primary">送信</Button>
            <Button variant="primary">作成</Button>
            <Button variant="primary">次へ</Button>
            <Button variant="primary">完了</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline">キャンセル</Button>
            <Button variant="outline">戻る</Button>
            <Button variant="outline">詳細を見る</Button>
            <Button variant="outline">編集</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" icon aria-label="検索">
              <Search className="size-4" />
            </Button>
            <Button variant="ghost" icon aria-label="設定">
              <Settings className="size-4" />
            </Button>
            <Button variant="ghost">もっと見る</Button>
            <Button variant="ghost">スキップ</Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-container rounded-lg p-4">
            <div className="flex justify-end gap-2">
              <Button variant="ghost">キャンセル</Button>
              <Button variant="primary">保存</Button>
            </div>
          </div>

          <div className="bg-container rounded-lg p-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline">キャンセル</Button>
              <Button variant="destructive">
                <Trash2 className="size-4" />
                削除
              </Button>
            </div>
          </div>

          <div className="bg-container rounded-lg p-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline">後で</Button>
              <Button variant="outline">今すぐ</Button>
            </div>
          </div>
        </div>

        <div className="bg-container space-y-4 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Button variant="primary" size="sm" className="w-24">
              sm
            </Button>
            <Button variant="outline" size="sm" className="w-24">
              sm
            </Button>
            <Button variant="ghost" size="sm" className="w-24">
              sm
            </Button>
            <Button variant="destructive" size="sm" className="w-24">
              sm
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="primary" size="default" className="w-24">
              default
            </Button>
            <Button variant="outline" size="default" className="w-24">
              default
            </Button>
            <Button variant="ghost" size="default" className="w-24">
              default
            </Button>
            <Button variant="destructive" size="default" className="w-24">
              default
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="primary" size="lg" className="w-24">
              lg
            </Button>
            <Button variant="outline" size="lg" className="w-24">
              lg
            </Button>
            <Button variant="ghost" size="lg" className="w-24">
              lg
            </Button>
            <Button variant="destructive" size="lg" className="w-24">
              lg
            </Button>
          </div>
        </div>

        <div className="bg-container space-y-4 rounded-lg p-4">
          <p className="text-muted-foreground mb-2 text-xs font-bold">
            アイコンボタン（icon prop）
          </p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Button variant="ghost" size="sm" icon aria-label="追加">
                <Plus className="size-4" />
              </Button>
              <p className="text-muted-foreground mt-1 text-xs">sm 32px</p>
            </div>
            <div className="text-center">
              <Button variant="ghost" icon aria-label="設定">
                <Settings className="size-4" />
              </Button>
              <p className="text-muted-foreground mt-1 text-xs">default 36px</p>
            </div>
            <div className="text-center">
              <Button variant="ghost" size="lg" icon aria-label="閉じる">
                <X className="size-5" />
              </Button>
              <p className="text-muted-foreground mt-1 text-xs">lg 44px</p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            SVGアイコン: sm/default = size-4(16px)、lg = size-5(20px) — Tokens/Icons準拠
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button isLoading>保存中</Button>
          <Button isLoading loadingText="処理中...">
            保存
          </Button>
          <Button disabled>無効</Button>
        </div>
      </div>
    );
  },
};

/** disabled状態ではクリックが無効化される */
export const DisabledClick: Story = {
  args: {
    children: '無効ボタン',
    disabled: true,
  },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /無効ボタン/i });
    await userEvent.click(button);
    await expect(button).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** isLoading状態ではクリックが無効化され、aria-busyが設定される */
export const LoadingClick: Story = {
  args: {
    children: '保存中',
    isLoading: true,
  },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /保存中/i });
    await userEvent.click(button);
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** 通常状態ではクリックイベントが発火する */
export const ClickFires: Story = {
  args: {
    children: 'クリック',
    variant: 'primary',
  },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /クリック/i });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
