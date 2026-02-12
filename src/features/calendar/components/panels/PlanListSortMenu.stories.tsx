import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlanListSortMenu } from './PlanListSortMenu';

/**
 * サイドパネル用のソート/グルーピングメニュー。
 *
 * Notion風サブメニューパターン:
 * - 各行に現在の設定値を表示（例: 並べ替え → 作成日）
 * - クリックでサブメニューが展開され、選択肢をラジオ形式で切り替え
 * - デフォルトから変更がある場合はリセット行が表示される
 */
const meta = {
  title: 'Features/Calendar/PlanListSortMenu',
  component: PlanListSortMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    sortBy: {
      control: 'select',
      options: ['created_at', 'updated_at', 'due_date', 'title'],
      description: 'ソートフィールド',
    },
    sortOrder: {
      control: 'select',
      options: ['asc', 'desc'],
      description: 'ソート方向',
    },
    groupBy: {
      control: 'select',
      options: [null, 'due_date', 'tags'],
      description: 'グルーピングフィールド',
    },
    scheduleFilter: {
      control: 'select',
      options: ['all', 'scheduled', 'unscheduled'],
      description: 'スケジュールフィルター',
    },
    statusFilter: {
      control: 'select',
      options: ['all', 'open', 'closed'],
      description: 'ステータスフィルター',
    },
    onSortChange: { action: 'onSortChange' },
    onGroupByChange: { action: 'onGroupByChange' },
    onScheduleFilterChange: { action: 'onScheduleFilterChange' },
    onStatusFilterChange: { action: 'onStatusFilterChange' },
  },
  args: {
    sortBy: 'created_at',
    sortOrder: 'desc',
    groupBy: null,
    scheduleFilter: 'unscheduled',
    statusFilter: 'open',
    onSortChange: () => {},
    onGroupByChange: () => {},
    onScheduleFilterChange: () => {},
    onStatusFilterChange: () => {},
  },
} satisfies Meta<typeof PlanListSortMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** デフォルト状態。作成日・降順・グループなし。トリガーアイコンは通常色。 */
export const Default: Story = {};

/** ソート変更済み。タイトル・昇順。トリガーアイコンがハイライト表示。 */
export const ActiveSort: Story = {
  args: {
    sortBy: 'title',
    sortOrder: 'asc',
    groupBy: null,
  },
};

/** グループ変更済み。タグでグループ化。 */
export const ActiveGroup: Story = {
  args: {
    sortBy: 'created_at',
    sortOrder: 'desc',
    groupBy: 'tags',
  },
};

/** ステータスを「完了」に変更済み。 */
export const ActiveStatusClosed: Story = {
  args: {
    statusFilter: 'closed',
  },
};

/** 日付フィルターを「すべて」に変更済み。デフォルトから変更あり。 */
export const ActiveScheduleAll: Story = {
  args: {
    scheduleFilter: 'all',
  },
};

/** ソート・グループ・ステータス・日付すべて変更済み。リセット行が表示される。 */
export const ActiveAll: Story = {
  args: {
    sortBy: 'due_date',
    sortOrder: 'asc',
    groupBy: 'due_date',
    scheduleFilter: 'all',
    statusFilter: 'closed',
  },
};
