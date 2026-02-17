import type { Meta, StoryObj } from '@storybook/react-vite';

import { RecordListSortMenu } from './RecordListSortMenu';

/**
 * Record アサイド用のソート/グルーピング/日付フィルターメニュー。
 *
 * PlanListSortMenu と同構造:
 * - 並べ替え（worked_at, duration, fulfillment, created_at, updated_at）
 * - グループ（なし, 日付, タグ）
 * - 期間フィルター（すべて, 今日, 今週, 今月）
 * - デフォルトから変更がある場合はリセット行が表示される
 */
const meta = {
  title: 'Features/Aside/RecordListSortMenu',
  component: RecordListSortMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    sortBy: {
      control: 'select',
      options: ['worked_at', 'duration_minutes', 'fulfillment_score', 'created_at', 'updated_at'],
      description: 'ソートフィールド',
    },
    sortOrder: {
      control: 'select',
      options: ['asc', 'desc'],
      description: 'ソート方向',
    },
    groupBy: {
      control: 'select',
      options: [null, 'worked_at', 'tags'],
      description: 'グルーピングフィールド',
    },
    dateFilter: {
      control: 'select',
      options: ['all', 'today', 'this_week', 'this_month'],
      description: '日付フィルター',
    },
    onSortChange: { action: 'onSortChange' },
    onGroupByChange: { action: 'onGroupByChange' },
    onDateFilterChange: { action: 'onDateFilterChange' },
  },
  args: {
    sortBy: 'worked_at',
    sortOrder: 'desc',
    groupBy: null,
    dateFilter: 'all',
    onSortChange: () => {},
    onGroupByChange: () => {},
    onDateFilterChange: () => {},
  },
} satisfies Meta<typeof RecordListSortMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** デフォルト状態。作業日・降順・グループなし・全期間。 */
export const Default: Story = {};

/** ソート変更済み。充実度・昇順。トリガーアイコンがハイライト。 */
export const ActiveSort: Story = {
  args: {
    sortBy: 'fulfillment_score',
    sortOrder: 'asc',
  },
};

/** グループ変更済み。日付でグループ化。 */
export const ActiveGroupByDate: Story = {
  args: {
    groupBy: 'worked_at',
  },
};

/** 日付フィルター変更済み。今週のみ表示。 */
export const ActiveDateFilterThisWeek: Story = {
  args: {
    dateFilter: 'this_week',
  },
};

/** すべて変更済み。リセット行が表示される。 */
export const ActiveAll: Story = {
  args: {
    sortBy: 'duration_minutes',
    sortOrder: 'asc',
    groupBy: 'tags',
    dateFilter: 'this_month',
  },
};
