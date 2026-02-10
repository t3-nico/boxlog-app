'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { SettingRow } from './SettingRow';

// ChatGPT設定画面スタイル: 値 + ChevronDown のドロップダウン風表示
function DropdownValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      {children}
      <ChevronDown className="text-muted-foreground size-3.5" />
    </span>
  );
}

/** SettingRow - 設定画面の行コンポーネント */
const meta = {
  title: 'Features/Settings/SettingRow',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** テキスト値のみの基本表示 */
export const Default: Story = {
  render: () => <SettingRow label="表示名" value="John Doe" />,
};

/** ドロップダウン風の値表示 */
export const WithDropdownValue: Story = {
  render: () => <SettingRow label="言語" value={<DropdownValue>日本語</DropdownValue>} />,
};

/** Switchトグル */
export const WithSwitch: Story = {
  render: () => <SettingRow label="プッシュ通知" value="" action={<Switch defaultChecked />} />,
};

/** ゴーストボタンアクション付き */
export const WithAction: Story = {
  render: () => (
    <SettingRow
      label="パスワード"
      value="••••••••"
      action={
        <Button variant="ghost" size="sm">
          変更
        </Button>
      }
    />
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-0 divide-y">
      <SettingRow label="表示名" value="John Doe" />
      <SettingRow label="言語" value={<DropdownValue>日本語</DropdownValue>} />
      <SettingRow label="テーマ" value={<DropdownValue>システム</DropdownValue>} />
      <SettingRow label="プッシュ通知" value="" action={<Switch defaultChecked />} />
      <SettingRow label="コンパクトモード" value="" action={<Switch />} />
      <SettingRow
        label="パスワード"
        value="••••••••"
        action={
          <Button variant="ghost" size="sm">
            変更
          </Button>
        }
      />
      <SettingRow
        label="アカウント削除"
        value=""
        action={
          <Button variant="destructive" size="sm">
            削除
          </Button>
        }
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
