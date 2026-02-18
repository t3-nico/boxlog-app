import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { NotificationItem } from './NotificationItem';

const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const meta = {
  title: 'Draft/Notifications/NotificationItem',
  component: NotificationItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '> **Note:** このコンポーネントは開発中です。',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    id: '1',
    locale: 'ja',
    message: null,
    isRead: false,
    createdAt: fiveMinutesAgo,
    onMarkAsRead: fn(),
    onDelete: fn(),
    onNavigate: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface w-96 rounded-2xl border p-1">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'reminder',
    title: 'ミーティングの準備',
  },
};

export const Read: Story = {
  args: {
    type: 'reminder',
    title: 'ミーティングの準備',
    isRead: true,
    createdAt: oneHourAgo,
  },
};

export const WithActionUrl: Story = {
  args: {
    type: 'plan_created',
    title: '新しいプランが作成されました',
    actionUrl: '/ja/calendar',
  },
};

export const Deleting: Story = {
  args: {
    type: 'system',
    title: 'システムメンテナンス',
    isRead: true,
    isDeleting: true,
  },
};

export const AllTypes: Story = {
  args: {
    type: 'reminder',
    title: '',
  },
  render: (args) => (
    <div className="space-y-1">
      <NotificationItem {...args} id="1" type="reminder" title="リマインダー" />
      <NotificationItem {...args} id="2" type="plan_created" title="プラン作成" />
      <NotificationItem {...args} id="3" type="plan_updated" title="プラン更新" isRead={true} />
      <NotificationItem {...args} id="4" type="plan_deleted" title="プラン削除" />
      <NotificationItem {...args} id="5" type="plan_completed" title="プラン完了" isRead={true} />
      <NotificationItem
        {...args}
        id="6"
        type="trash_warning"
        title="ゴミ箱警告"
        createdAt={yesterday}
      />
      <NotificationItem
        {...args}
        id="7"
        type="system"
        title="システム通知"
        isRead={true}
        createdAt={yesterday}
      />
    </div>
  ),
};
