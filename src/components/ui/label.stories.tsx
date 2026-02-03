import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './checkbox';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'ラベルテキスト',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'ラベル',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="email">メールアドレス</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">利用規約に同意する</Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="required-field">
        必須項目
        <span className="text-destructive">*</span>
      </Label>
      <Input id="required-field" required />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="password">パスワード</Label>
      <Input id="password" type="password" />
      <p className="text-sm text-muted-foreground">
        8文字以上で設定してください
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-2 w-80" data-disabled="true">
      <Label htmlFor="disabled-input">無効なフィールド</Label>
      <Input id="disabled-input" disabled />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Label - 全バリエーション</h1>

      <div className="space-y-8 max-w-md">
        <section>
          <h2 className="text-lg font-semibold mb-4">基本</h2>
          <Label>シンプルなラベル</Label>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">入力フィールドと組み合わせ</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" placeholder="山田太郎" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-example">
                メールアドレス
                <span className="text-destructive">*</span>
              </Label>
              <Input id="email-example" type="email" placeholder="email@example.com" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">チェックボックスと組み合わせ</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember">ログイン状態を保持する</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="newsletter" />
              <Label htmlFor="newsletter">ニュースレターを受け取る</Label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">説明文付き</h2>
          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <Input id="bio" placeholder="あなたについて教えてください" />
            <p className="text-sm text-muted-foreground">
              200文字以内で入力してください
            </p>
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
