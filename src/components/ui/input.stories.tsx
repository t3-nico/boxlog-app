import type { Meta, StoryObj } from '@storybook/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Input } from './input';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password'],
      description: '入力タイプ（実際に使用されているもの）',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'テキストを入力...',
  },
};

export const Types: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">text</p>
        <Input type="text" placeholder="テキスト" />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">email</p>
        <Input type="email" placeholder="you@example.com" autoComplete="email" />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">password</p>
        <Input type="password" placeholder="パスワード" autoComplete="current-password" />
      </div>
    </div>
  ),
};

export const PasswordWithToggle: Story = {
  render: function PasswordToggleStory() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative w-80">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワードを入力"
          className="pr-8"
          autoComplete="new-password"
          minLength={8}
          maxLength={64}
        />
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    placeholder: '無効状態',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-8 text-2xl font-bold">Input - 実際の使用パターン</h1>

        <div className="max-w-md space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">入力タイプ</h2>
            <div className="flex flex-col gap-4">
              <Input type="text" placeholder="テキスト入力" />
              <Input type="email" placeholder="you@example.com" autoComplete="email" />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="パスワード"
                  className="pr-8"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">状態</h2>
            <div className="flex flex-col gap-4">
              <Input placeholder="通常" />
              <Input placeholder="無効" disabled />
            </div>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
