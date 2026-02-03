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
      description: 'オン/オフ状態',
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
  args: {},
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

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">機内モード</Label>
    </div>
  ),
};

export const Interactive: Story = {
  render: function InteractiveSwitch() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center gap-2">
        <Switch
          id="interactive-switch"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Label htmlFor="interactive-switch">
          {checked ? 'オン' : 'オフ'}
        </Label>
      </div>
    );
  },
};

export const SettingsList: Story = {
  render: function SettingsListStory() {
    const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      autoSave: true,
    });

    return (
      <div className="space-y-4 w-64">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">通知</Label>
          <Switch
            id="notifications"
            checked={settings.notifications}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, notifications: checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">ダークモード</Label>
          <Switch
            id="dark-mode"
            checked={settings.darkMode}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, darkMode: checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-save">自動保存</Label>
          <Switch
            id="auto-save"
            checked={settings.autoSave}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, autoSave: checked }))
            }
          />
        </div>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-8">Switch - 全バリエーション</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">状態</h2>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Switch id="off" />
              <Label htmlFor="off">オフ</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="on" defaultChecked />
              <Label htmlFor="on">オン</Label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">無効状態</h2>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Switch id="disabled-off" disabled />
              <Label htmlFor="disabled-off">無効（オフ）</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="disabled-on" disabled defaultChecked />
              <Label htmlFor="disabled-on">無効（オン）</Label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">設定リスト</h2>
          <div className="space-y-4 w-64 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">メール通知</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">プッシュ通知</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">サウンド</span>
              <Switch defaultChecked />
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
