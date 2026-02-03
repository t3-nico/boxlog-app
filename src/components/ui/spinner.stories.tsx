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
      description: '追加のクラス名（サイズ調整用）',
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InButton: Story = {
  render: () => (
    <Button disabled>
      <Spinner className="mr-2" />
      保存中...
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Spinner - 実際の使用パターン</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">ボタン内（主な使用パターン）</h2>
          <p className="text-sm text-muted-foreground mb-4">
            LoginForm, PasswordResetForm, SignupFormで使用
          </p>
          <div className="flex gap-4">
            <Button disabled>
              <Spinner className="mr-2" />
              ログイン中...
            </Button>
            <Button variant="outline" disabled>
              <Spinner className="mr-2" />
              送信中...
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">デフォルトサイズ</h2>
          <p className="text-sm text-muted-foreground mb-4">
            size-4（16px）がデフォルト
          </p>
          <Spinner />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">アクセシビリティ</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li>role="status" 設定済み</li>
            <li>aria-live="polite" 設定済み</li>
            <li>motion-reduce対応</li>
          </ul>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
