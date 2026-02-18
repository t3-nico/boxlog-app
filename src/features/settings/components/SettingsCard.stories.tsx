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

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

/** SettingsCard - 設定セクションコンポーネント */
const meta = {
  title: 'Features/Settings/SettingsCard',
  component: SettingsCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    children: null as unknown as React.ReactNode,
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'セクションタイトル',
    },
    isSaving: {
      control: 'boolean',
      description: '保存中状態',
    },
    actions: {
      table: { disable: true },
    },
    children: {
      table: { disable: true },
    },
    className: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof SettingsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** タイトル付きの基本表示 */
export const Default: Story = {
  args: {
    title: '言語とテーマ',
  },
  render: (args) => (
    <div className="max-w-2xl">
      <SettingsCard {...args}>
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
      </SettingsCard>
    </div>
  ),
};

/** タイトルなし */
export const WithoutTitle: Story = {
  args: {},
  render: (args) => (
    <div className="max-w-2xl">
      <SettingsCard {...args}>
        <SettingRow label="プッシュ通知">
          <Switch defaultChecked />
        </SettingRow>
        <SettingRow label="サウンド">
          <Switch />
        </SettingRow>
      </SettingsCard>
    </div>
  ),
};

/** アクションボタン付き */
export const WithActions: Story = {
  args: {
    title: 'アカウント',
    actions: (
      <Button variant="ghost" size="sm">
        編集
      </Button>
    ),
  },
  render: (args) => (
    <div className="max-w-2xl">
      <SettingsCard {...args}>
        <SettingRow label="メールアドレス" description="john@example.com">
          <Button variant="outline">変更</Button>
        </SettingRow>
        <SettingRow label="パスワード" description="••••••••">
          <Button variant="outline">変更</Button>
        </SettingRow>
      </SettingsCard>
    </div>
  ),
};

/** 保存中状態 */
export const SavingState: Story = {
  args: {
    title: 'カレンダー設定',
    isSaving: true,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <SettingsCard {...args}>
        <SettingRow label="週の開始日">
          <Select defaultValue="monday">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">月曜日</SelectItem>
              <SelectItem value="sunday">日曜日</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label="タイムゾーン">
          <Select defaultValue="Asia/Tokyo">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Los_Angeles">ロサンゼルス (GMT-8)</SelectItem>
              <SelectItem value="America/New_York">ニューヨーク (GMT-5)</SelectItem>
              <SelectItem value="Europe/London">ロンドン (GMT+0)</SelectItem>
              <SelectItem value="Asia/Tokyo">東京 (GMT+9)</SelectItem>
              <SelectItem value="Australia/Sydney">シドニー (GMT+10)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>
    </div>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  args: {},
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <SettingsCard title="言語とテーマ">
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
          <Select defaultValue="dark">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">システム</SelectItem>
              <SelectItem value="dark">ダーク</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="通知">
        <SettingRow label="プッシュ通知">
          <Switch defaultChecked />
        </SettingRow>
        <SettingRow label="サウンド">
          <Switch defaultChecked />
        </SettingRow>
      </SettingsCard>

      <SettingsCard
        title="アカウント"
        actions={
          <Button variant="ghost" size="sm">
            編集
          </Button>
        }
      >
        <SettingRow label="メールアドレス" description="john@example.com">
          <Button variant="outline">変更</Button>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="カレンダー設定" isSaving>
        <SettingRow label="週の開始日">
          <Select defaultValue="monday">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">月曜日</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="危険な操作">
        <SettingRow label="アカウント削除">
          <Button variant="destructive" size="sm">
            削除
          </Button>
        </SettingRow>
      </SettingsCard>
    </div>
  ),
};
