import type { Meta, StoryObj } from '@storybook/react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { PlanCard } from './PlanCard';

const meta = {
  title: 'Features/Calendar/PlanCard',
  component: PlanCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
カレンダー上に表示されるイベントカード。

## バリエーション
- **Plan**: 通常の予定（チェックボックス付き）
- **Record**: 実績記録（左ボーダー付き、読み取り専用）
- **Draft**: 新規作成中のプレビュー（点線ボーダー、鉛筆アイコン）

## ドラフト表示について
新規作成やペースト時に、保存前のプレビューとして表示される。
- 点線ボーダーで「未保存」を視覚的に示す
- クリック・ドラッグ不可
- 鉛筆アイコンで編集中を示す
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-card relative h-[200px] w-[300px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本のプランデータ
const basePlan: CalendarPlan = {
  id: 'plan-1',
  title: 'チームミーティング',
  description: '週次の進捗確認',
  startDate: new Date('2024-01-15T10:00:00'),
  endDate: new Date('2024-01-15T11:00:00'),
  status: 'open',
  color: 'var(--primary)',
  createdAt: new Date(),
  updatedAt: new Date(),
  displayStartDate: new Date('2024-01-15T10:00:00'),
  displayEndDate: new Date('2024-01-15T11:00:00'),
  duration: 60,
  isMultiDay: false,
  isRecurring: false,
  type: 'plan',
};

const basePosition = {
  top: 0,
  left: 0,
  width: 100,
  height: 80,
};

/**
 * 通常のPlan表示。チェックボックスで完了状態を切り替え可能。
 */
export const Default: Story = {
  args: {
    plan: basePlan,
    position: basePosition,
  },
};

/**
 * 完了状態のPlan。チェックマークが緑色で表示される。
 */
export const Completed: Story = {
  args: {
    plan: {
      ...basePlan,
      status: 'closed',
    },
    position: basePosition,
  },
};

/**
 * 選択状態のPlan。リングで強調表示される。
 */
export const Selected: Story = {
  args: {
    plan: basePlan,
    position: basePosition,
    isSelected: true,
  },
};

/**
 * Record（実績記録）。左ボーダーで区別され、チェックボックスは表示されない。
 */
export const Record: Story = {
  args: {
    plan: {
      ...basePlan,
      id: 'record-1',
      type: 'record',
      title: '開発作業',
    },
    position: basePosition,
  },
};

/**
 * ドラフト（新規作成プレビュー）。
 * 点線ボーダーと鉛筆アイコンで「未保存」を示す。
 * クリック・ドラッグは無効化される。
 */
export const Draft: Story = {
  args: {
    plan: {
      ...basePlan,
      id: '__draft__',
      title: '新しい予定',
      isDraft: true,
    },
    position: basePosition,
  },
  parameters: {
    docs: {
      description: {
        story: `
新規作成時やペースト時に表示されるプレビュー状態。

**特徴:**
- 点線ボーダー（未保存を示す）
- 鉛筆アイコン（編集中を示す）
- 薄い背景色
- クリック・ドラッグ不可
        `,
      },
    },
  },
};

/**
 * タイトルなしのドラフト。「新しい予定」と表示される。
 */
export const DraftNoTitle: Story = {
  args: {
    plan: {
      ...basePlan,
      id: '__draft__',
      title: '',
      isDraft: true,
    },
    position: basePosition,
  },
};

/**
 * 繰り返しプラン。繰り返しアイコンが表示される。
 */
export const Recurring: Story = {
  args: {
    plan: {
      ...basePlan,
      isRecurring: true,
    },
    position: basePosition,
  },
};

/**
 * 通知設定あり。ベルアイコンが表示される。
 */
export const WithReminder: Story = {
  args: {
    plan: {
      ...basePlan,
      reminder_minutes: 15,
    },
    position: basePosition,
  },
};

/**
 * コンパクト表示（高さが小さい場合）。
 * 30px未満の場合、時間表示が省略される。
 */
export const Compact: Story = {
  args: {
    plan: basePlan,
    position: {
      ...basePosition,
      height: 25,
    },
  },
};

/**
 * タグ付きのPlan。
 */
export const WithTags: Story = {
  args: {
    plan: {
      ...basePlan,
      tagIds: ['tag-1', 'tag-2'],
    },
    position: {
      ...basePosition,
      height: 100,
    },
  },
};
