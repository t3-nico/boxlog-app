import type { Meta, StoryObj } from '@storybook/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function PasswordToggleStory() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <InputGroup className="w-80">
        <InputGroupInput type={showPassword ? 'text' : 'password'} placeholder="パスワード" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-8 text-2xl font-bold">InputGroup - 実際の使用パターン</h1>

        <div className="max-w-md space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-bold">パスワード表示切り替え</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              PasswordSection.tsxで使用されているパターン
            </p>
            <InputGroup>
              <InputGroupInput
                type={showPassword ? 'text' : 'password'}
                placeholder="現在のパスワード"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold">使用コンポーネント</h2>
            <ul className="text-muted-foreground list-inside list-disc text-sm">
              <li>
                <code>InputGroup</code> - コンテナ
              </li>
              <li>
                <code>InputGroupInput</code> - 入力フィールド
              </li>
              <li>
                <code>{'InputGroupAddon align="inline-end"'}</code> - 右側アドオン
              </li>
              <li>
                <code>{'InputGroupButton variant="ghost" size="icon-sm"'}</code> - アイコンボタン
              </li>
            </ul>
          </section>

          <section className="bg-muted rounded-md p-4">
            <p className="text-muted-foreground text-sm">
              <strong>Note:</strong> {'InputGroupText, align="inline-start"は現在未使用'}
            </p>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
