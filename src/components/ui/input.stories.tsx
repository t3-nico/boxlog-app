import type { Meta, StoryObj } from '@storybook/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Field, FieldError, FieldLabel } from './field';
import { Input } from './input';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Input</h1>
        <p className="text-muted-foreground mb-8">テキスト入力フィールド</p>

        <div className="grid max-w-md gap-8">
          <div>
            <h2 className="mb-4 text-lg font-bold">サイズ</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-muted-foreground mb-2 text-sm">sm（32px）- コンパクトUI</p>
                <Input size="sm" placeholder="フィルター入力" />
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-sm">default（40px）- 標準</p>
                <Input placeholder="標準入力" />
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-sm">lg（48px）- 主要な入力</p>
                <Input size="lg" placeholder="検索バー" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">入力タイプ</h2>
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
                  {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
              <p className="text-muted-foreground text-xs">
                ※ パスワード入力は InputGroup を使用することを推奨
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">状態</h2>
            <div className="flex flex-col gap-4">
              <Input placeholder="通常" />
              <Input placeholder="無効" disabled />
              <Input placeholder="エラー状態" aria-invalid="true" />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">エラーテキスト付き</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Field + FieldLabel + FieldError と組み合わせて使用
            </p>
            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="email-error">メールアドレス</FieldLabel>
                <Input
                  id="email-error"
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid="true"
                  aria-describedby="email-error-text"
                />
                <FieldError id="email-error-text">
                  有効なメールアドレスを入力してください
                </FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="password-error">パスワード</FieldLabel>
                <Input
                  id="password-error"
                  type="password"
                  aria-invalid="true"
                  aria-describedby="password-error-text"
                />
                <FieldError id="password-error-text">
                  パスワードは8文字以上で入力してください
                </FieldError>
              </Field>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">Props</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>size - sm / default / lg</li>
                <li>type - text / email / password / number など</li>
                <li>disabled - 無効状態</li>
                <li>aria-invalid - エラー状態（赤枠表示）</li>
                <li>aria-describedby - エラーテキストのIDを指定</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">関連コンポーネント</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>Field - フォームフィールドのコンテナ</li>
                <li>FieldLabel - ラベル</li>
                <li>FieldError - エラーメッセージ</li>
                <li>InputGroup - アドオン付き入力（パスワード表示切替等）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
