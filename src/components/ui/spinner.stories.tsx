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
    <div className="bg-background text-foreground p-8">
      <h1 className="mb-8 text-2xl font-bold">Spinner - 実際の使用パターン</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-bold">ボタン内（主な使用パターン）</h2>
          <p className="text-muted-foreground mb-4 text-sm">
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
          <h2 className="mb-4 text-lg font-bold">デフォルトサイズ</h2>
          <p className="text-muted-foreground mb-4 text-sm">size-4（16px）がデフォルト</p>
          <Spinner />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">アクセシビリティ</h2>
          <ul className="text-muted-foreground list-inside list-disc text-sm">
            <li>{'role="status" 設定済み'}</li>
            <li>{'aria-live="polite" 設定済み'}</li>
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
