import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { PlanListCard } from './PlanListCard';

/**
 * アサイド用の Plan カード。
 *
 * - 透明背景 + フラットなリスト表示（角丸なし）
 * - ホバー領域は左右8pxの余白を確保（-mx-1で親paddingに食い込み）
 * - 時間位置ベースで過去判定（"Time waits for no one"）
 * - 時間範囲 + 作業時間をメタ情報行に表示
 * - タグ表示（TagsContainer）
 */

const BASE_PLAN = {
  id: 'plan-1',
  title: 'チームミーティング',
  start_time: '2025-01-15T10:00:00.000Z',
  end_time: '2025-01-15T11:00:00.000Z',
  tagIds: [] as string[],
};

const meta = {
  title: 'Features/Calendar/Aside/Plan/ListCard',
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

/** 基本的な Plan カード（時間あり） */
export const Default: Story = {
  args: {
    plan: BASE_PLAN,
  },
};

/** 過去のエントリ（時間位置ベースで判定） */
export const PastEntry: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-past',
      title: '完了したタスク',
      start_time: '2020-01-15T10:00:00.000Z',
      end_time: '2020-01-15T11:00:00.000Z',
    },
  },
};

/** 未スケジュール（時間なし） */
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

/** 時間なし（メタ行非表示） */
export const NoTimePlan: Story = {
  args: {
    plan: {
      ...BASE_PLAN,
      id: 'plan-no-meta',
      title: 'アイデアメモ',
      start_time: null,
      end_time: null,
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
        plan={{
          ...BASE_PLAN,
          id: 'p2',
          title: '過去のタスク',
          start_time: '2020-01-15T10:00:00.000Z',
          end_time: '2020-01-15T11:00:00.000Z',
        }}
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
          title: '時間なし',
          start_time: null,
          end_time: null,
        }}
        onClick={fn()}
      />
    </div>
  ),
};
