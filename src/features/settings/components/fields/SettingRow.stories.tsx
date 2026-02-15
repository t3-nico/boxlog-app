import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { SettingRow } from './SettingRow';

/** SettingRow - 設定画面の行コンポーネント（2カラム: ラベル | コントロール） */
const meta = {
  title: 'Features/Settings/SettingRow',
  component: SettingRow,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    children: null as unknown as React.ReactNode,
  },
  argTypes: {
    label: {
      control: 'text',
      description: '行ラベル',
    },
    description: {
      control: 'text',
      description: '補足説明テキスト',
    },
    children: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof SettingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ドロップダウン選択 */
export const WithSelect: Story = {
  args: {
    label: '言語',
  },
  render: (args) => (
    <SettingRow {...args}>
      <Select defaultValue="ja">
        <SelectTrigger variant="ghost">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ja">日本語</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </SettingRow>
  ),
};

/** Switchトグル */
export const WithSwitch: Story = {
  args: {
    label: 'プッシュ通知',
  },
  render: (args) => (
    <SettingRow {...args}>
      <Switch defaultChecked />
    </SettingRow>
  ),
};

/** ボタンアクション（description付き） */
export const WithDescription: Story = {
  args: {
    label: 'パスワード',
    description: '••••••••',
  },
  render: (args) => (
    <SettingRow {...args}>
      <Button variant="outline">変更</Button>
    </SettingRow>
  ),
};

/** ボタンのみ */
export const WithButton: Story = {
  args: {
    label: 'アカウント削除',
  },
  render: (args) => (
    <SettingRow {...args}>
      <Button variant="destructive" size="sm">
        削除
      </Button>
    </SettingRow>
  ),
};

/** テキスト値のみ */
export const TextOnly: Story = {
  args: {
    label: 'タイムゾーン',
  },
  render: (args) => (
    <SettingRow {...args}>
      <span className="text-muted-foreground text-base">Asia/Tokyo (UTC+9)</span>
    </SettingRow>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  args: {
    label: '言語',
  },
  render: () => (
    <div className="w-full max-w-2xl space-y-0 divide-y">
      <SettingRow label="言語">
        <Select defaultValue="ja">
          <SelectTrigger variant="ghost">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ja">日本語</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow label="テーマ">
        <Select defaultValue="system">
          <SelectTrigger variant="ghost">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">システム</SelectItem>
            <SelectItem value="light">ライト</SelectItem>
            <SelectItem value="dark">ダーク</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow label="プッシュ通知">
        <Switch defaultChecked />
      </SettingRow>
      <SettingRow label="コンパクトモード">
        <Switch />
      </SettingRow>
      <SettingRow label="パスワード" description="••••••••">
        <Button variant="outline">変更</Button>
      </SettingRow>
      <SettingRow label="メールアドレス" description="user@example.com">
        <Button variant="outline">変更</Button>
      </SettingRow>
      <SettingRow label="アカウント削除">
        <Button variant="destructive" size="sm">
          削除
        </Button>
      </SettingRow>
    </div>
  ),
};
