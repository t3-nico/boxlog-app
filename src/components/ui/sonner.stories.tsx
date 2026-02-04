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
    <Button onClick={() => toast('これはトーストメッセージです')}>トーストを表示</Button>
  ),
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    return (
      <div className="bg-background text-foreground min-h-screen w-full p-8">
        <h1 className="mb-2 text-2xl font-bold">Sonner (Toast)</h1>
        <p className="text-muted-foreground mb-8">トースト通知</p>

        <div className="space-y-8">
          {/* タイプ */}
          <section>
            <h2 className="mb-4 text-lg font-bold">タイプ</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast('通常メッセージ')}>
                通常
              </Button>
              <Button variant="outline" onClick={() => toast.success('成功しました')}>
                成功
              </Button>
              <Button variant="outline" onClick={() => toast.error('エラーが発生')}>
                エラー
              </Button>
              <Button variant="outline" onClick={() => toast.info('お知らせ')}>
                情報
              </Button>
              <Button variant="outline" onClick={() => toast.warning('警告')}>
                警告
              </Button>
            </div>
          </section>

          {/* ローディング */}
          <section>
            <h2 className="mb-4 text-lg font-bold">ローディング → 完了</h2>
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
          </section>

          {/* 説明付き */}
          <section>
            <h2 className="mb-4 text-lg font-bold">説明付き</h2>
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
          </section>

          {/* アクション付き */}
          <section>
            <h2 className="mb-4 text-lg font-bold">アクション付き</h2>
            <Button
              variant="outline"
              onClick={() =>
                toast('アイテムを削除しました', {
                  action: {
                    label: '元に戻す',
                    onClick: () => toast.success('復元しました'),
                  },
                })
              }
            >
              アクション付きトースト
            </Button>
          </section>

          {/* Promise */}
          <section>
            <h2 className="mb-4 text-lg font-bold">Promise統合</h2>
            <Button
              variant="outline"
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
          </section>

          {/* カラー */}
          <section>
            <h2 className="mb-4 text-lg font-bold">カラー</h2>
            <div className="grid gap-2">
              <div className="flex items-center gap-4">
                <div className="bg-overlay border-border h-8 w-8 rounded border" />
                <span className="text-sm">通常: bg-overlay</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-success h-8 w-8 rounded" />
                <span className="text-sm">成功: bg-success</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-destructive h-8 w-8 rounded" />
                <span className="text-sm">エラー: bg-destructive</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-warning h-8 w-8 rounded" />
                <span className="text-sm">警告: bg-warning</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-info h-8 w-8 rounded" />
                <span className="text-sm">情報: bg-info</span>
              </div>
            </div>
          </section>

          {/* 使用方法 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">使用方法</h2>
            <pre className="bg-container overflow-x-auto rounded-lg p-4 text-sm">
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
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
