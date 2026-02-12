import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
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

export const Indeterminate: Story = {
  args: {
    checked: 'indeterminate',
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="indeterminate" />
      <Label htmlFor="indeterminate">一部選択（indeterminate）</Label>
    </div>
  ),
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

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(true);
    const tagColor = '#10b981';

    return (
      <div className="flex flex-col items-start gap-6">
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
            <Checkbox id="cb-indeterminate" checked="indeterminate" />
            <Label htmlFor="cb-indeterminate">一部選択（indeterminate）</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb3" disabled />
            <Label htmlFor="cb3" className="text-muted-foreground">
              無効
            </Label>
          </div>
        </div>

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
      </div>
    );
  },
};
