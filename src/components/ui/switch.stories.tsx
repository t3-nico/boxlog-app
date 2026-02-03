import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Label } from './label';
import { Switch } from './switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'スイッチの状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultSwitch() {
    const [checked, setChecked] = useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} />;
  },
};

export const Checked: Story = {
  render: function CheckedSwitch() {
    const [checked, setChecked] = useState(true);
    return <Switch checked={checked} onCheckedChange={setChecked} />;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: function SwitchWithLabel() {
    const [enabled, setEnabled] = useState(false);
    return (
      <div className="flex items-center justify-between w-64">
        <Label htmlFor="sleep-mode">おやすみモード</Label>
        <Switch id="sleep-mode" checked={enabled} onCheckedChange={setEnabled} />
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [sleepEnabled, setSleepEnabled] = useState(true);
    const [syncEnabled, setSyncEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSyncChange = async (checked: boolean) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSyncEnabled(checked);
      setIsLoading(false);
    };

    return (
      <div className="p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-8">Switch - 実際の使用パターン</h1>

        <div className="space-y-8 max-w-sm">
          <section>
            <h2 className="text-lg font-semibold mb-4">設定リスト</h2>
            <div className="border border-border rounded-lg divide-y divide-border">
              <div className="flex items-center justify-between px-4 py-3">
                <Label htmlFor="sleep">おやすみモード</Label>
                <Switch
                  id="sleep"
                  checked={sleepEnabled}
                  onCheckedChange={setSleepEnabled}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <Label htmlFor="sync">カレンダー同期</Label>
                <Switch
                  id="sync"
                  checked={syncEnabled}
                  onCheckedChange={handleSyncChange}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <Label htmlFor="disabled" className="text-muted-foreground">無効な設定</Label>
                <Switch id="disabled" disabled />
              </div>
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
