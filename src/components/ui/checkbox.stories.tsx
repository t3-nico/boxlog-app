import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'チェック状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">利用規約に同意する</Label>
    </div>
  ),
};

export const WithCustomColor: Story = {
  render: function CustomColorCheckbox() {
    const [checked, setChecked] = useState(true);
    const tagColor = '#10b981';

    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id="tag-filter"
          checked={checked}
          onCheckedChange={(c) => setChecked(c === true)}
          style={{
            borderColor: tagColor,
            backgroundColor: checked ? tagColor : 'transparent',
          }}
        />
        <Label htmlFor="tag-filter">タグフィルター（カスタムカラー）</Label>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(true);
    const tagColor = '#10b981';

    return (
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-8 text-2xl font-bold">Checkbox - 実際の使用パターン</h1>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-bold">基本</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cb1"
                  checked={checked1}
                  onCheckedChange={(c) => setChecked1(c === true)}
                />
                <Label htmlFor="cb1">未チェック</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cb2"
                  checked={checked2}
                  onCheckedChange={(c) => setChecked2(c === true)}
                />
                <Label htmlFor="cb2">チェック済み</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="cb3" disabled />
                <Label htmlFor="cb3" className="text-muted-foreground">
                  無効
                </Label>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold">タグフィルター（カスタムカラー）</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              タグの色に合わせてborderColor/backgroundColorをstyleで指定
            </p>
            <div className="flex items-center gap-2">
              <Checkbox
                id="tag"
                checked={checked2}
                onCheckedChange={(c) => setChecked2(c === true)}
                style={{
                  borderColor: tagColor,
                  backgroundColor: checked2 ? tagColor : 'transparent',
                }}
              />
              <Label htmlFor="tag">仕事</Label>
            </div>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
