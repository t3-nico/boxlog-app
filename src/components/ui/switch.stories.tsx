import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Label } from './label';
import { Switch } from './switch';

/**
 * Switch - トグルスイッチ（ON/OFF切替）
 *
 * ## Switch vs Checkbox
 *
 * | 観点 | Switch | Checkbox |
 * |------|--------|----------|
 * | 効果 | 即座に反映 | 送信後に反映 |
 * | 用途 | 設定のON/OFF | フォーム選択 |
 * | 複数選択 | 不可（単独） | 可能 |
 * | 推奨 | 設定画面、モード切替 | フォーム、同意確認 |
 *
 * ## 使い分けルール（Apple HIG準拠）
 *
 * - **即座に反映**: Switch（設定変更が即座に適用）
 * - **送信後に反映**: Checkbox（フォーム送信時に適用）
 * - **独立した設定**: Switch（他と関係なく切替）
 * - **複数項目から選択**: Checkbox（グループとして選択）
 */
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
      <div className="flex w-64 items-center justify-between">
        <Label htmlFor="sleep-mode">おやすみモード</Label>
        <Switch id="sleep-mode" checked={enabled} onCheckedChange={setEnabled} />
      </div>
    );
  },
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
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
      <div className="bg-background text-foreground p-8">
        <h1 className="mb-8 text-2xl font-bold">Switch - 実際の使用パターン</h1>

        <div className="space-y-8" style={{ maxWidth: '28rem' }}>
          <section>
            <h2 className="mb-4 text-lg font-bold">設定リスト</h2>
            <div className="border-border divide-border divide-y rounded-lg border">
              <div className="flex items-center justify-between px-4 py-4">
                <Label htmlFor="sleep">おやすみモード</Label>
                <Switch id="sleep" checked={sleepEnabled} onCheckedChange={setSleepEnabled} />
              </div>
              <div className="flex items-center justify-between px-4 py-4">
                <Label htmlFor="sync">カレンダー同期</Label>
                <Switch
                  id="sync"
                  checked={syncEnabled}
                  onCheckedChange={handleSyncChange}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-4">
                <Label htmlFor="disabled" className="text-muted-foreground">
                  無効な設定
                </Label>
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
