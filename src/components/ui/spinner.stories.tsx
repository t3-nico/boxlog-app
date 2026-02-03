import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from './button';
import { Spinner } from './spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function SpinnerStory() {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    };

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">Spinner</h1>
        <p className="text-muted-foreground mb-8">
          ローディングインジケーター（回転アニメーション）
        </p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">Button isLoading（推奨）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Buttonの組み込みローディング。認証フォーム等で使用。
            </p>
            <div className="flex gap-4">
              <Button onClick={handleClick} isLoading={isLoading}>
                ログイン
              </Button>
              <Button onClick={handleClick} isLoading={isLoading} loadingText="送信中...">
                送信
              </Button>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">単体表示</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              インライン要素として使用。デフォルトsize-4（16px）。
            </p>
            <div className="flex items-center gap-2">
              <Spinner />
              <span className="text-sm">読み込み中...</span>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">サイズ</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              classNameでサイズ調整。LoadingSpinnerはsm/md/lg/xlプリセット対応。
            </p>
            <div className="flex items-center gap-4">
              <Spinner className="size-4" />
              <Spinner className="size-6" />
              <Spinner className="size-8" />
              <Spinner className="size-12" />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>Button isLoading - 認証フォーム全般</li>
              <li>LoadingSpinner - ページローディング、オーバーレイ</li>
              <li>インライン表示 - テキストと並べて使用</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Props / アクセシビリティ</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>className - サイズ調整（size-5, size-6 等）</li>
                <li>aria-label - デフォルト「Loading」</li>
                <li>{'role="status", aria-live="polite" 設定済み'}</li>
                <li>motion-reduce: アニメーション停止</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
