import type { Meta, StoryObj } from '@storybook/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group';
import { HoverTooltip } from './tooltip';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">InputGroup</h1>
        <p className="text-muted-foreground mb-8">入力フィールドにボタンやアイコンを追加</p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          <div>
            <h2 className="mb-2 text-lg font-bold">パスワード表示切り替え</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              PasswordSection.tsx で使用。目のアイコンでパスワードの表示/非表示を切り替え。
            </p>
            <InputGroup>
              <InputGroupInput
                type={showPassword ? 'text' : 'password'}
                placeholder="パスワードを入力"
              />
              <InputGroupAddon align="inline-end">
                <HoverTooltip content={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}>
                  <InputGroupButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                  >
                    {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </InputGroupButton>
                </HoverTooltip>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">使用箇所</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>PasswordSection.tsx - パスワード変更フォーム</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">コンポーネント</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>InputGroup - コンテナ</li>
                <li>InputGroupInput - 入力フィールド（size: sm/default/lg）</li>
                <li>InputGroupAddon - アドオンエリア（align: inline-start/inline-end）</li>
                <li>InputGroupButton - ボタン（size: sm/default/lg/icon-sm/icon/icon-lg）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
