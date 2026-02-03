import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'sonner';

import { Button } from './button';
import { Toaster } from './sonner';

const meta = {
  title: 'Components/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button onClick={() => toast('これはトーストメッセージです')}>
      トーストを表示
    </Button>
  ),
};

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success('保存しました')}>
      成功トースト
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => toast.error('エラーが発生しました')}
    >
      エラートースト
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.info('お知らせ')}>
      情報トースト
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.warning('警告メッセージ')}>
      警告トースト
    </Button>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        const toastId = toast.loading('処理中...');
        setTimeout(() => {
          toast.success('完了しました', { id: toastId });
        }, 2000);
      }}
    >
      ローディングトースト
    </Button>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast('タイトル', {
          description: '詳細な説明がここに表示されます。',
        })
      }
    >
      説明付きトースト
    </Button>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast('ファイルを削除しました', {
          action: {
            label: '元に戻す',
            onClick: () => toast.success('削除を取り消しました'),
          },
        })
      }
    >
      アクション付きトースト
    </Button>
  ),
};

export const Promise: Story = {
  render: () => (
    <Button
      onClick={() => {
        const promise = new Promise((resolve) => setTimeout(resolve, 2000));
        toast.promise(promise, {
          loading: '保存中...',
          success: '保存しました',
          error: 'エラーが発生しました',
        });
      }}
    >
      Promiseトースト
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Sonner (Toast) - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">タイプ</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => toast('通常メッセージ')}>通常</Button>
            <Button onClick={() => toast.success('成功しました')}>
              成功
            </Button>
            <Button onClick={() => toast.error('エラーが発生')}>
              エラー
            </Button>
            <Button onClick={() => toast.info('お知らせ')}>情報</Button>
            <Button onClick={() => toast.warning('警告')}>警告</Button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">ローディング状態</h2>
          <Button
            onClick={() => {
              const toastId = toast.loading('処理中...');
              setTimeout(() => {
                toast.success('完了', { id: toastId });
              }, 2000);
            }}
          >
            ローディング → 成功
          </Button>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">アクション付き</h2>
          <Button
            onClick={() =>
              toast('アイテムを削除しました', {
                action: {
                  label: '元に戻す',
                  onClick: () => toast.success('復元しました'),
                },
              })
            }
          >
            アクション付き
          </Button>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用方法</h2>
          <pre className="p-4 bg-container rounded-lg text-sm overflow-x-auto">
{`import { toast } from 'sonner'

// 基本
toast('メッセージ')

// タイプ別
toast.success('成功')
toast.error('エラー')
toast.info('情報')
toast.warning('警告')

// Promise統合
toast.promise(asyncFn(), {
  loading: '処理中...',
  success: '完了',
  error: 'エラー',
})`}
          </pre>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
