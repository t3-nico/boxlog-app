import type { Meta, StoryObj } from '@storybook/react';

import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from './field';
import { Input } from './input';

const meta = {
  title: 'Components/Field',
  component: FieldLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FieldLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-80 space-y-1">
      <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="w-80 space-y-1">
      <FieldLabel htmlFor="name" required requiredLabel="必須">
        名前
      </FieldLabel>
      <Input id="name" required />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="w-80 space-y-1">
      <FieldLabel htmlFor="password">パスワード</FieldLabel>
      <Input id="password" type="password" />
      <FieldDescription>8文字以上で設定してください</FieldDescription>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-80 space-y-1">
      <FieldLabel htmlFor="email-error">メールアドレス</FieldLabel>
      <Input id="email-error" type="email" aria-invalid="true" defaultValue="invalid" />
      <FieldError id="email-error-msg">有効なメールアドレスを入力してください</FieldError>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Field - 実際の使用パターン</h1>

      <div className="space-y-8 max-w-md">
        <section>
          <h2 className="text-lg font-semibold mb-4">基本（ラベル + 入力）</h2>
          <div className="space-y-1">
            <FieldLabel htmlFor="basic">ラベル</FieldLabel>
            <Input id="basic" placeholder="入力してください" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">必須表示</h2>
          <p className="text-sm text-muted-foreground mb-4">
            LoginForm, SignupFormで使用されているパターン
          </p>
          <div className="space-y-1">
            <FieldLabel htmlFor="req" required requiredLabel="必須">
              メールアドレス
            </FieldLabel>
            <Input id="req" type="email" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">エラー状態</h2>
          <div className="space-y-1">
            <FieldLabel htmlFor="err">入力項目</FieldLabel>
            <Input id="err" aria-invalid="true" defaultValue="不正な値" />
            <FieldError id="err-msg">エラーメッセージ</FieldError>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">説明テキスト</h2>
          <div className="space-y-1">
            <FieldLabel htmlFor="desc">項目</FieldLabel>
            <Input id="desc" />
            <FieldDescription>補足説明やヘルプテキスト</FieldDescription>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">使用コンポーネント</h2>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            <li><code>FieldLabel</code> - htmlFor, required, requiredLabel</li>
            <li><code>FieldDescription</code> - 補足テキスト</li>
            <li><code>FieldError</code> - エラーメッセージ（announceImmediately対応）</li>
          </ul>
        </section>

        <section className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Field, FieldSet, FieldGroup, FieldContent, FieldLegendは現在未使用
          </p>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
