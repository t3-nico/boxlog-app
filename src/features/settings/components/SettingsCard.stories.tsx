'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

// ChatGPT設定画面スタイル: 値 + ChevronDown のドロップダウン風表示
function DropdownValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      {children}
      <ChevronDown className="text-muted-foreground size-3.5" />
    </span>
  );
}

/** SettingsCard - 設定セクションコンポーネント */
const meta = {
  title: 'Features/Settings/SettingsCard',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** タイトル付きの基本表示 */
export const Default: Story = {
  render: () => (
    <div className="max-w-lg">
      <SettingsCard title="言語とテーマ">
        <SettingRow label="言語" value={<DropdownValue>日本語</DropdownValue>} />
        <SettingRow label="テーマ" value={<DropdownValue>システム</DropdownValue>} />
      </SettingsCard>
    </div>
  ),
};

/** タイトルなし */
export const WithoutTitle: Story = {
  render: () => (
    <div className="max-w-lg">
      <SettingsCard>
        <SettingRow label="プッシュ通知" value="" action={<Switch defaultChecked />} />
        <SettingRow label="サウンド" value="" action={<Switch />} />
      </SettingsCard>
    </div>
  ),
};

/** アクションボタン付き */
export const WithActions: Story = {
  render: () => (
    <div className="max-w-lg">
      <SettingsCard
        title="アカウント"
        actions={
          <Button variant="ghost" size="sm">
            編集
          </Button>
        }
      >
        <SettingRow label="メールアドレス" value="john@example.com" />
        <SettingRow
          label="パスワード"
          value="••••••••"
          action={
            <Button variant="ghost" size="sm">
              変更
            </Button>
          }
        />
      </SettingsCard>
    </div>
  ),
};

/** 保存中状態 */
export const SavingState: Story = {
  render: () => (
    <div className="max-w-lg">
      <SettingsCard title="カレンダー設定" isSaving>
        <SettingRow label="週の開始日" value={<DropdownValue>月曜日</DropdownValue>} />
        <SettingRow label="タイムゾーン" value={<DropdownValue>Asia/Tokyo</DropdownValue>} />
      </SettingsCard>
    </div>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col items-start gap-6">
      <SettingsCard title="言語とテーマ">
        <SettingRow label="言語" value={<DropdownValue>日本語</DropdownValue>} />
        <SettingRow label="テーマ" value={<DropdownValue>ダーク</DropdownValue>} />
      </SettingsCard>

      <SettingsCard title="通知">
        <SettingRow label="プッシュ通知" value="" action={<Switch defaultChecked />} />
        <SettingRow label="サウンド" value="" action={<Switch defaultChecked />} />
      </SettingsCard>

      <SettingsCard
        title="アカウント"
        actions={
          <Button variant="ghost" size="sm">
            編集
          </Button>
        }
      >
        <SettingRow label="メールアドレス" value="john@example.com" />
      </SettingsCard>

      <SettingsCard title="カレンダー設定" isSaving>
        <SettingRow label="週の開始日" value={<DropdownValue>月曜日</DropdownValue>} />
      </SettingsCard>

      <SettingsCard title="危険な操作">
        <SettingRow
          label="アカウント削除"
          value=""
          action={
            <Button variant="destructive" size="sm">
              削除
            </Button>
          }
        />
      </SettingsCard>
    </div>
  ),
};
