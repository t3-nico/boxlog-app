import type { Meta, StoryObj } from '@storybook/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './input-group';

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
        <InputGroupInput
          type={showPassword ? 'text' : 'password'}
          placeholder="パスワード"
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
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-8">InputGroup - 実際の使用パターン</h1>

        <div className="space-y-8 max-w-md">
          <section>
            <h2 className="text-lg font-semibold mb-4">パスワード表示切り替え</h2>
            <p className="text-sm text-muted-foreground mb-4">
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
            <h2 className="text-lg font-semibold mb-4">使用コンポーネント</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li><code>InputGroup</code> - コンテナ</li>
              <li><code>InputGroupInput</code> - 入力フィールド</li>
              <li><code>InputGroupAddon align="inline-end"</code> - 右側アドオン</li>
              <li><code>InputGroupButton variant="ghost" size="icon-sm"</code> - アイコンボタン</li>
            </ul>
          </section>

          <section className="p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> InputGroupText, align="inline-start"は現在未使用
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
