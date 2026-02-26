import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { CalendarPlan, ViewDateRange } from '../../../types/calendar.types';

import { DayView } from './DayView';

/** DayView - 日表示ビュー */
const meta = {
  title: 'Features/Calendar/Views/DayView',
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
    color: '#10B981',
    startDate: makeDate(today, 12, 0),
    endDate: makeDate(today, 13, 0),
    displayStartDate: makeDate(today, 12, 0),
    displayEndDate: makeDate(today, 13, 0),
  },
  {
    ...basePlan,
    id: 'plan-3',
    title: 'デザインレビュー',
    color: '#F59E0B',
    startDate: makeDate(today, 14, 0),
    endDate: makeDate(today, 15, 30),
    displayStartDate: makeDate(today, 14, 0),
    displayEndDate: makeDate(today, 15, 30),
    duration: 90,
  },
  {
    ...basePlan,
    id: 'plan-4',
    title: 'コーディング',
    color: '#8B5CF6',
    startDate: makeDate(today, 16, 0),
    endDate: makeDate(today, 18, 0),
    displayStartDate: makeDate(today, 16, 0),
    displayEndDate: makeDate(today, 18, 0),
    duration: 120,
  },
];

const todayRange: ViewDateRange = {
  start: today,
  end: today,
  days: [today],
};

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** デフォルト（プランあり） */
export const Default: Story = {
  render: () => (
    <div className="h-[700px]">
      <DayView
        dateRange={todayRange}
        plans={mockPlans}
        currentDate={today}
        onPlanClick={fn()}
        onEmptyClick={fn()}
      />
    </div>
  ),
};

/** 空（プランなし） */
export const Empty: Story = {
  render: () => (
    <div className="h-[700px]">
      <DayView dateRange={todayRange} plans={[]} currentDate={today} onPlanClick={fn()} />
    </div>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="h-[500px] w-full">
        <DayView
          dateRange={todayRange}
          plans={mockPlans}
          currentDate={today}
          onPlanClick={fn()}
          onEmptyClick={fn()}
        />
      </div>

      <div className="h-[500px] w-full">
        <DayView dateRange={todayRange} plans={[]} currentDate={today} onPlanClick={fn()} />
      </div>
    </div>
  ),
};
