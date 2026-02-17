import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ConversationSummary } from '@/server/services/chat/types';

import { ChatHistoryPopover } from './ChatHistoryPopover';

const MOCK_CONVERSATIONS: ConversationSummary[] = [
  {
    id: 'conv-1',
    title: '今日の予定を確認',
    messageCount: 4,
    createdAt: new Date(Date.now() - 600_000).toISOString(),
    updatedAt: new Date(Date.now() - 600_000).toISOString(),
  },
  {
    id: 'conv-2',
    title: 'タグを整理したい',
    messageCount: 8,
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'conv-3',
    title: '先月の作業時間は？',
    messageCount: 3,
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: 'conv-4',
    title: 'Show my weekly stats and breakdown by tag category',
    messageCount: 6,
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    updatedAt: new Date(Date.now() - 172_800_000).toISOString(),
  },
];

/** ChatHistoryPopover - 会話履歴ドロップダウン */
const meta = {
  title: 'Features/AI/ChatHistoryPopover',
  component: ChatHistoryPopover,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    conversations: MOCK_CONVERSATIONS,
    activeConversationId: 'conv-1',
    onSelect: () => {},
  },
} satisfies Meta<typeof ChatHistoryPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** デフォルト（履歴あり） */
export const Default: Story = {};

/** アクティブ会話なし */
export const NoActive: Story = {
  args: {
    activeConversationId: null,
  },
};

/** 削除ボタン付き（ホバーで表示） */
export const WithDelete: Story = {
  args: {
    onDelete: () => {},
  },
};

/** 履歴なし */
export const Empty: Story = {
  args: {
    conversations: [],
    activeConversationId: null,
  },
};
