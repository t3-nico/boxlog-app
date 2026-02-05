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
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'サイズプリセット（sm=16px, md=24px, lg=32px, xl=48px）',
    },
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
      <div>
        <h1 className="mb-2 text-2xl font-bold">Spinner</h1>
        <p className="text-muted-foreground mb-8">
          ローディングインジケーター（回転アニメーション）
        </p>

        <div className="grid max-w-md gap-8">
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
            <h2 className="mb-2 text-lg font-bold">サイズプリセット</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              size propでサイズ指定。ページローディング等はsize=&quot;lg&quot;を使用。
            </p>
            <div className="flex items-end gap-6">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <Spinner size={size} />
                  <span className="text-muted-foreground text-xs">{size}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Props / アクセシビリティ</h2>
            <div className="bg-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>size - プリセット（sm/md/lg/xl）。省略時 size-4</li>
                <li>className - 色やサイズの追加カスタマイズ</li>
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
