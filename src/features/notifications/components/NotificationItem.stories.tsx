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
    isRead: false,
    createdAt: fiveMinutesAgo,
    onMarkAsRead: fn(),
    onDelete: fn(),
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

export const Reminder: Story = {
  args: {
    type: 'reminder',
    planTitle: 'ミーティングの準備',
  },
};

export const Overdue: Story = {
  args: {
    type: 'overdue',
    planTitle: 'レポート提出',
  },
};

export const Read: Story = {
  args: {
    type: 'reminder',
    planTitle: 'ミーティングの準備',
    isRead: true,
    createdAt: oneHourAgo,
  },
};

export const Deleting: Story = {
  args: {
    type: 'reminder',
    planTitle: 'タスク完了',
    isRead: true,
    isDeleting: true,
  },
};

export const AllTypes: Story = {
  args: {
    type: 'reminder',
    planTitle: '',
  },
  render: (args) => (
    <div className="space-y-1">
      <NotificationItem {...args} id="1" type="reminder" planTitle="リマインダー" />
      <NotificationItem
        {...args}
        id="2"
        type="overdue"
        planTitle="期限超過タスク"
        createdAt={yesterday}
      />
      <NotificationItem
        {...args}
        id="3"
        type="reminder"
        planTitle="既読のリマインダー"
        isRead={true}
        createdAt={yesterday}
      />
    </div>
  ),
};
