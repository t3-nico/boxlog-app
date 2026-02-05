import type { Meta, StoryObj } from '@storybook/react';
import { CalendarDays, Inbox } from 'lucide-react';

import { Button } from './button';
import { EmptyState } from './empty-state';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'タイトル',
    },
    description: {
      control: 'text',
      description: '説明文',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'サイズ',
    },
    centered: {
      control: 'boolean',
      description: '親要素内で中央配置',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 標準（size="md"）。icon + title + description。
 * 実使用: AgendaView
 */
export const Default: Story = {
  args: {
    icon: CalendarDays,
    title: '予定がありません',
    description: '今日の予定はまだ登録されていません。',
  },
};

/**
 * テーブル内（size="sm" + centered + actions）。
 * 実使用: TableEmptyState, PlanTableEmptyState
 */
export const TableEmpty: Story = {
  decorators: [
    (Story) => (
      <div className="border-border h-[300px] w-[400px] rounded-xl border">
        <Story />
      </div>
    ),
  ],
  args: {
    icon: Inbox,
    title: 'アイテムがありません',
    description: '新しいアイテムを作成して始めましょう。',
    size: 'sm',
    centered: true,
    actions: (
      <Button size="sm">新規作成</Button>
    ),
  },
};
