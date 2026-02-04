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
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'メールアドレス',
    htmlFor: 'email',
  },
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    return (
      <div className="bg-background text-foreground min-h-screen p-8">
        <h1 className="mb-2 text-2xl font-bold">Label</h1>
        <p className="text-muted-foreground mb-8">フォーム要素のラベル</p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          <div>
            <h2 className="mb-4 text-lg font-bold">フォームラベル</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              ※ 通常は FieldLabel（field.tsx）経由で使用
            </p>
            <div className="space-y-2">
              <Label htmlFor="display-name">表示名</Label>
              <Input id="display-name" type="text" placeholder="田中太郎" />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">チェックボックスラベル</h2>
            <div className="flex items-center gap-2">
              <Checkbox id="agree" />
              <Label htmlFor="agree">利用規約に同意する</Label>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">無効状態</h2>
            <div className="flex items-center gap-2">
              <Checkbox id="disabled-check" disabled />
              <Label htmlFor="disabled-check">無効なチェックボックス</Label>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold">関連コンポーネント</h2>
            <div className="bg-surface-container rounded-lg p-4">
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>FieldLabel - 必須/任意インジケーター付きラベル</li>
                <li>Field - フォームフィールドのコンテナ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
