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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClick = () => {
      setIsSubmitting(true);
      setTimeout(() => setIsSubmitting(false), 2000);
    };

    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">Spinner</h1>
        <p className="text-muted-foreground mb-8">
          ローディングインジケーター（回転アニメーション）
        </p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">ボタン内（条件付き表示）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              LoginForm.tsx, SignupForm.tsx で使用。送信中のみ表示。
            </p>
            <Button onClick={handleClick} disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </Button>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">Button isLoading prop</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Buttonの組み込みローディング。Loader2アイコンを自動表示。
            </p>
            <Button isLoading>保存中...</Button>
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
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>LoginForm.tsx - ログインボタン</li>
              <li>SignupForm.tsx - 登録ボタン</li>
              <li>PasswordResetForm.tsx - パスワードリセット</li>
              <li>LoadingStates.tsx - LoadingSpinner として export</li>
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
