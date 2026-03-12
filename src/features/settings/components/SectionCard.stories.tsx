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

import { LabeledRow } from '@/components/common/LabeledRow';
import { SectionCard } from '@/components/common/SectionCard';

/** SectionCard - 設定セクションコンポーネント */
const meta = {
  title: 'Features/Settings/SectionCard',
  component: SectionCard,
  parameters: {
    layout: 'padded',
    // button-name: SelectTrigger inside LabeledRow without explicit aria-label
    a11y: { test: 'todo' },
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
} satisfies Meta<typeof SectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** タイトル付きの基本表示 */
export const Default: Story = {
  args: {
    title: '言語とテーマ',
  },
  render: (args) => (
    <div className="max-w-2xl">
      <SectionCard {...args}>
        <LabeledRow label="言語">
          <Select defaultValue="ja">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </LabeledRow>
        <LabeledRow label="テーマ">
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
        </LabeledRow>
      </SectionCard>
    </div>
  ),
};

/** タイトルなし */
export const WithoutTitle: Story = {
  args: {},
  render: (args) => (
    <div className="max-w-2xl">
      <SectionCard {...args}>
        <LabeledRow label="プッシュ通知">
          <Switch defaultChecked aria-label="Push notifications" />
        </LabeledRow>
        <LabeledRow label="サウンド">
          <Switch aria-label="Sound" />
        </LabeledRow>
      </SectionCard>
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
      <SectionCard {...args}>
        <LabeledRow label="メールアドレス" description="john@example.com">
          <Button variant="outline">変更</Button>
        </LabeledRow>
        <LabeledRow label="パスワード" description="••••••••">
          <Button variant="outline">変更</Button>
        </LabeledRow>
      </SectionCard>
    </div>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  args: {},
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <SectionCard title="言語とテーマ">
        <LabeledRow label="言語">
          <Select defaultValue="ja">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </LabeledRow>
        <LabeledRow label="テーマ">
          <Select defaultValue="dark">
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">システム</SelectItem>
              <SelectItem value="dark">ダーク</SelectItem>
            </SelectContent>
          </Select>
        </LabeledRow>
      </SectionCard>

      <SectionCard title="通知">
        <LabeledRow label="プッシュ通知">
          <Switch defaultChecked aria-label="Push notifications" />
        </LabeledRow>
        <LabeledRow label="サウンド">
          <Switch defaultChecked aria-label="Sound" />
        </LabeledRow>
      </SectionCard>

      <SectionCard
        title="アカウント"
        actions={
          <Button variant="ghost" size="sm">
            編集
          </Button>
        }
      >
        <LabeledRow label="メールアドレス" description="john@example.com">
          <Button variant="outline">変更</Button>
        </LabeledRow>
      </SectionCard>

      <SectionCard title="危険な操作">
        <LabeledRow label="アカウント削除">
          <Button variant="destructive" size="sm">
            削除
          </Button>
        </LabeledRow>
      </SectionCard>
    </div>
  ),
};
