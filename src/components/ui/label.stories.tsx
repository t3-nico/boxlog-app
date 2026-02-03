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
    htmlFor: {
      control: 'text',
      description: '関連付けるinput要素のID',
    },
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

export const WithInput: Story = {
  render: () => (
    <div className="w-80">
      <Label htmlFor="email" className="text-muted-foreground block text-sm font-normal mb-1">
        Email address
      </Label>
      <Input id="email" type="email" placeholder="you@example.com" />
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

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Label - 実際の使用パターン</h1>

      <div className="space-y-8 max-w-md">
        <section>
          <h2 className="text-lg font-semibold mb-4">フォームラベル</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-muted-foreground block text-sm font-normal mb-1">
                名前
              </Label>
              <Input id="name" type="text" placeholder="田中太郎" />
            </div>
            <div>
              <Label htmlFor="email2" className="text-muted-foreground block text-sm font-normal mb-1">
                メールアドレス
              </Label>
              <Input id="email2" type="email" placeholder="you@example.com" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">チェックボックスラベル</h2>
          <div className="flex items-center gap-2">
            <Checkbox id="agree" />
            <Label htmlFor="agree">利用規約に同意する</Label>
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
