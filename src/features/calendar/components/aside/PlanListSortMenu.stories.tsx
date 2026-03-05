import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlanListSortMenu } from './PlanListSortMenu';

/**
 * アサイド用のソート/グルーピングメニュー。
 *
 * Notion風サブメニューパターン:
 * - 各行に現在の設定値を表示（例: 並べ替え → 作成日）
 * - クリックでサブメニューが展開され、選択肢をラジオ形式で切り替え
 * - デフォルトから変更がある場合はリセット行が表示される
 */
const meta = {
  title: 'Features/Aside/Plan/SortMenu',
  component: PlanListSortMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    sortBy: {
      control: 'select',
      options: ['created_at', 'updated_at', 'title'],
      description: 'ソートフィールド',
    },
    sortOrder: {
      control: 'select',
      options: ['asc', 'desc'],
      description: 'ソート方向',
    },
    groupBy: {
      control: 'select',
      options: [null, 'tags'],
      description: 'グルーピングフィールド',
    },
    scheduleFilter: {
      control: 'select',
      options: ['all', 'scheduled', 'unscheduled'],
      description: 'スケジュールフィルター',
    },
    onSortChange: { action: 'onSortChange' },
    onGroupByChange: { action: 'onGroupByChange' },
    onScheduleFilterChange: { action: 'onScheduleFilterChange' },
  },
  args: {
    sortBy: 'created_at',
    sortOrder: 'desc',
    groupBy: null,
    scheduleFilter: 'unscheduled',
    onSortChange: () => {},
    onGroupByChange: () => {},
    onScheduleFilterChange: () => {},
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

/** 日付フィルターを「すべて」に変更済み。デフォルトから変更あり。 */
export const ActiveScheduleAll: Story = {
  args: {
    scheduleFilter: 'all',
  },
};

/** ソート・グループ・日付すべて変更済み。リセット行が表示される。 */
export const ActiveAll: Story = {
  args: {
    sortBy: 'title',
    sortOrder: 'asc',
    groupBy: 'tags',
    scheduleFilter: 'all',
  },
};
