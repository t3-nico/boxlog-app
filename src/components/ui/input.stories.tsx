import type { Meta, StoryObj } from '@storybook/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

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
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">Input</h1>
        <p className="text-muted-foreground mb-8">テキスト入力フィールド</p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
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
            <h2 className="mb-4 text-lg font-bold">Props</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>size - sm / default / lg</li>
                <li>type - text / email / password / number など</li>
                <li>disabled - 無効状態</li>
                <li>aria-invalid - エラー状態</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
