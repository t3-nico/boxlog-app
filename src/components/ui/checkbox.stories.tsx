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
      control: 'select',
      options: [true, false, 'indeterminate'],
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
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    checked: 'indeterminate',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
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

export const Interactive: Story = {
  render: function InteractiveCheckbox() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id="interactive"
          checked={checked}
          onCheckedChange={(value) => setChecked(value === true)}
        />
        <Label htmlFor="interactive">
          {checked ? 'チェック済み' : '未チェック'}
        </Label>
      </div>
    );
  },
};

export const CheckboxGroup: Story = {
  render: function CheckboxGroupStory() {
    const [selectedItems, setSelectedItems] = useState<string[]>(['email']);

    const toggleItem = (item: string) => {
      setSelectedItems((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    };

    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">通知設定</p>
        {[
          { id: 'email', label: 'メール通知' },
          { id: 'push', label: 'プッシュ通知' },
          { id: 'sms', label: 'SMS通知' },
        ].map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              id={item.id}
              checked={selectedItems.includes(item.id)}
              onCheckedChange={() => toggleItem(item.id)}
            />
            <Label htmlFor={item.id}>{item.label}</Label>
          </div>
        ))}
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Checkbox - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">状態</h2>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Checkbox id="unchecked" />
              <Label htmlFor="unchecked">未チェック</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="checked" checked />
              <Label htmlFor="checked">チェック済み</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="indeterminate" checked="indeterminate" />
              <Label htmlFor="indeterminate">不確定</Label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">無効状態</h2>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Checkbox id="disabled-unchecked" disabled />
              <Label htmlFor="disabled-unchecked">無効（未チェック）</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="disabled-checked" disabled checked />
              <Label htmlFor="disabled-checked">無効（チェック済み）</Label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">グループ</h2>
          <div className="space-y-2">
            {['オプション1', 'オプション2', 'オプション3'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <Checkbox id={`option-${i}`} defaultChecked={i === 0} />
                <Label htmlFor={`option-${i}`}>{label}</Label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
