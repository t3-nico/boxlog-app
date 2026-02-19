import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { RecordItem } from '@/features/records/hooks/useRecordData';

import { RecordListCard } from './RecordListCard';

/**
 * Record アサイド用のカード。
 *
 * PlanListCard との違い:
 * - チェックボックスなし（Record にはステータスがない）
 * - D&D なし → cursor-pointer 固定
 * - 透明背景 + 3px左縦線アクセント（record-border）
 * - 充実度スコア表示（星 1-5）
 * - 所要時間表示（Clock アイコン + {n}分）
 */

const BASE_RECORD: RecordItem = {
  id: 'record-1',
  plan_id: null,
  user_id: 'user-1',
  title: '朝のランニング 30分',
  worked_at: '2025-01-15',
  start_time: '2025-01-15T07:00:00.000Z',
  end_time: '2025-01-15T07:30:00.000Z',
  duration_minutes: 30,
  fulfillment_score: 4,
  note: null,
  created_at: '2025-01-15T07:30:00.000Z',
  updated_at: '2025-01-15T07:30:00.000Z',
  tagIds: [],
};

const meta = {
  title: 'Features/Aside/Record/ListCard',
  component: RecordListCard,
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
} satisfies Meta<typeof RecordListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本的な Record カード */
export const Default: Story = {
  args: {
    record: BASE_RECORD,
  },
};

/** 充実度5（星全部点灯） */
export const HighFulfillment: Story = {
  args: {
    record: {
      ...BASE_RECORD,
      id: 'record-high',
      title: 'チーム企画会議 - 新プロジェクト立ち上げ',
      fulfillment_score: 5,
      duration_minutes: 90,
    },
  },
};

/** 充実度1（星1つ） */
export const LowFulfillment: Story = {
  args: {
    record: {
      ...BASE_RECORD,
      id: 'record-low',
      title: 'メール整理',
      fulfillment_score: 1,
      duration_minutes: 15,
    },
  },
};

/** 充実度なし（星非表示） */
export const NoFulfillment: Story = {
  args: {
    record: {
      ...BASE_RECORD,
      id: 'record-no-score',
      title: 'ドキュメント作成',
      fulfillment_score: null,
      duration_minutes: 120,
    },
  },
};

/** タイトルなし */
export const NoTitle: Story = {
  args: {
    record: {
      ...BASE_RECORD,
      id: 'record-no-title',
      title: null,
      fulfillment_score: 3,
    },
  },
};

/** 時間なし（start_time / end_time がnull） */
export const NoTime: Story = {
  args: {
    record: {
      ...BASE_RECORD,
      id: 'record-no-time',
      title: '読書',
      start_time: null,
      end_time: null,
      duration_minutes: 60,
      fulfillment_score: 4,
    },
  },
};

/** タグ付き */
export const WithTags: Story = {
  args: {
    record: {
      ...BASE_RECORD,
      id: 'record-with-tags',
      title: 'TypeScript学習',
      tagIds: ['tag-1', 'tag-2'],
      fulfillment_score: 4,
      duration_minutes: 45,
    },
  },
};

/** 長いタイトル（2行で省略） */
export const LongTitle: Story = {
  args: {
    record: {
      ...BASE_RECORD,
      id: 'record-long',
      title: 'プロジェクト計画書の作成とレビュー - 第三四半期の目標設定と予算配分について検討する',
      fulfillment_score: 3,
      duration_minutes: 180,
    },
  },
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  args: {
    record: BASE_RECORD,
  },
  render: () => (
    <div className="flex w-[280px] flex-col gap-2">
      <RecordListCard record={BASE_RECORD} onClick={fn()} />
      <RecordListCard
        record={{
          ...BASE_RECORD,
          id: 'r2',
          title: '充実度5',
          fulfillment_score: 5,
          duration_minutes: 90,
        }}
        onClick={fn()}
      />
      <RecordListCard
        record={{
          ...BASE_RECORD,
          id: 'r3',
          title: null,
          fulfillment_score: null,
          start_time: null,
          end_time: null,
          duration_minutes: 60,
        }}
        onClick={fn()}
      />
      <RecordListCard
        record={{
          ...BASE_RECORD,
          id: 'r4',
          title: 'タグ付きRecord',
          tagIds: ['tag-1'],
          fulfillment_score: 2,
        }}
        onClick={fn()}
      />
    </div>
  ),
};
