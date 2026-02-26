import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { CalendarPlan } from '../../../types/calendar.types';

import { AgendaView } from './AgendaView';

/** AgendaView - アジェンダ（リスト）ビュー */
const meta = {
  title: 'Features/Calendar/Views/AgendaView',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const dayAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

function makeDate(base: Date, hour: number, minute = 0): Date {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const basePlan: CalendarPlan = {
  id: 'plan-1',
  title: 'チームミーティング',
  description: '週次の進捗確認',
  startDate: makeDate(today, 10, 0),
  endDate: makeDate(today, 11, 0),
  status: 'open',
  color: 'var(--primary)',
  createdAt: now,
  updatedAt: now,
  displayStartDate: makeDate(today, 10, 0),
  displayEndDate: makeDate(today, 11, 0),
  duration: 60,
  isMultiDay: false,
  isRecurring: false,
  type: 'plan',
};

const mockPlans: CalendarPlan[] = [
  basePlan,
  {
    ...basePlan,
    id: 'plan-2',
    title: 'ランチ',
    startDate: makeDate(today, 12, 0),
    endDate: makeDate(today, 13, 0),
    displayStartDate: makeDate(today, 12, 0),
    displayEndDate: makeDate(today, 13, 0),
  },
  {
    ...basePlan,
    id: 'plan-3',
    title: 'デザインレビュー',
    startDate: makeDate(tomorrow, 14, 0),
    endDate: makeDate(tomorrow, 15, 30),
    displayStartDate: makeDate(tomorrow, 14, 0),
    displayEndDate: makeDate(tomorrow, 15, 30),
    duration: 90,
  },
  {
    ...basePlan,
    id: 'plan-4',
    title: 'コードレビュー',
    description: 'PR #42 のレビュー',
    startDate: makeDate(dayAfter, 9, 0),
    endDate: makeDate(dayAfter, 10, 0),
    displayStartDate: makeDate(dayAfter, 9, 0),
    displayEndDate: makeDate(dayAfter, 10, 0),
  },
  {
    ...basePlan,
    id: 'plan-5',
    title: '1on1',
    startDate: makeDate(dayAfter, 16, 0),
    endDate: makeDate(dayAfter, 16, 30),
    displayStartDate: makeDate(dayAfter, 16, 0),
    displayEndDate: makeDate(dayAfter, 16, 30),
    duration: 30,
  },
];

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 複数日にプランがある状態 */
export const Default: Story = {
  render: () => (
    <div className="h-[600px]">
      <AgendaView
        plans={mockPlans}
        currentDate={today}
        onPlanClick={fn()}
        onPlanContextMenu={fn()}
      />
    </div>
  ),
};

/** 予定なし（EmptyState表示） */
export const Empty: Story = {
  render: () => (
    <div className="h-[400px]">
      <AgendaView plans={[]} currentDate={today} onPlanClick={fn()} onPlanContextMenu={fn()} />
    </div>
  ),
};

/** 今日のみのプラン */
export const SingleDay: Story = {
  render: () => (
    <div className="h-[400px]">
      <AgendaView
        plans={mockPlans.filter((p) => p.startDate && p.startDate < tomorrow)}
        currentDate={today}
        onPlanClick={fn()}
        onPlanContextMenu={fn()}
      />
    </div>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="h-[500px] w-full">
        <AgendaView
          plans={mockPlans}
          currentDate={today}
          onPlanClick={fn()}
          onPlanContextMenu={fn()}
        />
      </div>

      <div className="h-[300px] w-full">
        <AgendaView plans={[]} currentDate={today} onPlanClick={fn()} onPlanContextMenu={fn()} />
      </div>
    </div>
  ),
};
