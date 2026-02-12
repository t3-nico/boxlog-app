import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { PlanWithTags } from '@/server/services/plans/types';

import { PlanListCard } from './PlanListCard';

/**
 * サイドパネル用の Plan カード。
 *
 * - チェックボックスで open/closed 切り替え
 * - 期限日 + 時間範囲 + 作業時間をメタ情報行に表示
 * - isOverdue=true で期限日・時間が赤文字（text-destructive）
 * - タグ表示（TagsContainer）
 */

const now = new Date();
const BASE_PLAN: PlanWithTags = {
  id: 'plan-1',
  user_id: 'user-1',
  title: 'チームミーティング',
  description: '週次の進捗確認',
  status: 'open',
  start_time: '2025-01-15T10:00:00.000Z',
  end_time: '2025-01-15T11:00:00.000Z',
  due_date: '2025-01-20',
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
  completed_at: null,
  recurrence_type: null,
  recurrence_rule: null,
  recurrence_end_date: null,
  reminder_minutes: null,
  reminder_at: null,
  reminder_sent: false,
  tagIds: [],
};

const meta = {
  title: 'Features/Calendar/PlanListCard',
  component: PlanListCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof PlanListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本的な Plan カード（時間あり + 期限日あり） */
export const Default: Story = {
  args: {
    plan: BASE_PLAN,
  },
};

/** 完了済み（line-through + muted） */
export const Completed: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-completed',
      title: '完了したタスク',
      status: 'closed',
      completed_at: now.toISOString(),
    },
  },
};

/** 期限切れ（赤文字表示） */
export const Overdue: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-overdue',
      title: '期限切れのレポート提出',
      due_date: '2024-12-31',
    },
    isOverdue: true,
  },
};

/** 未スケジュール（時間なし・期限日のみ） */
export const Unscheduled: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-unscheduled',
      title: '買い物リスト作成',
      start_time: null,
      end_time: null,
    },
  },
};

/** 期限日なし・時間あり */
export const NoDueDate: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-no-due',
      title: 'コードレビュー',
      due_date: null,
    },
  },
};

/** 時間も期限日もなし（メタ行非表示） */
export const NoTimeNoDueDate: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-no-meta',
      title: 'アイデアメモ',
      start_time: null,
      end_time: null,
      due_date: null,
    },
  },
};

/** タグ付き */
export const WithTags: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-tags',
      title: 'TypeScript学習',
      tagIds: ['tag-1', 'tag-2'],
    },
  },
};

/** 長いタイトル（2行で省略） */
export const LongTitle: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-long',
      title: 'プロジェクト計画書の作成とレビュー - 第三四半期の目標設定と予算配分について検討する',
    },
  },
};

/** タイトルなし */
export const NoTitle: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-no-title',
      title: '',
      start_time: null,
      end_time: null,
      due_date: null,
    },
  },
};

/** 長時間の作業（2h30m 表示） */
export const LongDuration: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-long-duration',
      title: 'ワークショップ参加',
      start_time: '2025-01-15T09:00:00.000Z',
      end_time: '2025-01-15T11:30:00.000Z',
    },
  },
};

/** 短時間の作業（30m 表示） */
export const ShortDuration: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-short-duration',
      title: 'デイリースタンドアップ',
      start_time: '2025-01-15T09:00:00.000Z',
      end_time: '2025-01-15T09:30:00.000Z',
    },
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  args: {
    plan: BASE_PLAN,
  },
  render: () => (
    <div className="flex w-[280px] flex-col gap-2">
      <PlanListCard plan={BASE_PLAN} onClick={fn()} />
      <PlanListCard
        plan={{ ...BASE_PLAN, id: 'p2', status: 'closed', title: '完了済み' }}
        onClick={fn()}
      />
      <PlanListCard
        plan={{ ...BASE_PLAN, id: 'p3', title: '期限切れ', due_date: '2024-12-31' }}
        isOverdue
        onClick={fn()}
      />
      <PlanListCard
        plan={{
          ...BASE_PLAN,
          id: 'p4',
          title: '未スケジュール',
          start_time: null,
          end_time: null,
        }}
        onClick={fn()}
      />
      <PlanListCard
        plan={{
          ...BASE_PLAN,
          id: 'p5',
          title: 'タグ付き',
          tagIds: ['tag-1', 'tag-2'],
        }}
        onClick={fn()}
      />
      <PlanListCard
        plan={{
          ...BASE_PLAN,
          id: 'p6',
          title: '時間も期限もなし',
          start_time: null,
          end_time: null,
          due_date: null,
        }}
        onClick={fn()}
      />
    </div>
  ),
};
