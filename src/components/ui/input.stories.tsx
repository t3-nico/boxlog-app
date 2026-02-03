import type { Meta, StoryObj } from '@storybook/react';
import { Search, Mail, Eye, EyeOff } from 'lucide-react';
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
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'インプットのサイズ',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: '入力タイプ',
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

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <p className="text-sm text-muted-foreground mb-2">sm (32px)</p>
        <Input size="sm" placeholder="コンパクトな入力欄" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">default (40px)</p>
        <Input size="default" placeholder="標準の入力欄" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">lg (48px)</p>
        <Input size="lg" placeholder="大きな入力欄" />
      </div>
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input type="text" placeholder="テキスト" />
      <Input type="email" placeholder="email@example.com" />
      <Input type="password" placeholder="パスワード" />
      <Input type="number" placeholder="123" />
      <Input type="search" placeholder="検索..." />
      <Input type="tel" placeholder="090-1234-5678" />
      <Input type="url" placeholder="https://example.com" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="検索..." />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input type="email" className="pl-10" placeholder="メールアドレス" />
      </div>
    </div>
  ),
};

export const PasswordToggle: Story = {
  render: function PasswordToggleStory() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative w-80">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワードを入力"
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <p className="text-sm text-muted-foreground mb-2">通常</p>
        <Input placeholder="通常状態" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">無効</p>
        <Input placeholder="無効状態" disabled />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">エラー</p>
        <Input placeholder="エラー状態" aria-invalid="true" />
      </div>
    </div>
  ),
};

export const FileInput: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input type="file" />
      <Input type="file" size="lg" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Input - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">サイズ</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <Input size="sm" placeholder="Small (32px)" />
            <Input size="default" placeholder="Default (40px)" />
            <Input size="lg" placeholder="Large (48px)" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">入力タイプ</h2>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <Input type="text" placeholder="text" />
            <Input type="email" placeholder="email" />
            <Input type="password" placeholder="password" />
            <Input type="number" placeholder="number" />
            <Input type="search" placeholder="search" />
            <Input type="tel" placeholder="tel" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">状態</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <Input placeholder="通常" />
            <Input placeholder="フォーカス" autoFocus />
            <Input placeholder="無効" disabled />
            <Input placeholder="エラー" aria-invalid="true" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">ファイル入力</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <Input type="file" size="sm" />
            <Input type="file" size="default" />
            <Input type="file" size="lg" />
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
