'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { addDays, subHours } from 'date-fns';

import type { CalendarPlan } from '../../../../types/calendar.types';

import type { OverduePlan } from '../../../../hooks/useOverduePlans';
import { OverdueBadge } from './OverdueBadge';
import { OverdueSection, OverdueSectionSingle } from './OverdueSection';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/** カレンダーの保留中（期限切れ）プランバッジ。WeekView等の上部に表示。 */
const meta = {
  title: 'Features/Calendar/OverdueSection',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// モックデータ
// ---------------------------------------------------------------------------

const now = new Date();

const basePlan: CalendarPlan = {
  id: 'plan-1',
  title: 'チームミーティング',
  description: '週次の進捗確認',
  startDate: subHours(now, 3),
  endDate: subHours(now, 2),
  status: 'open',
  color: 'var(--primary)',
  createdAt: now,
  updatedAt: now,
  displayStartDate: subHours(now, 3),
  displayEndDate: subHours(now, 2),
  duration: 60,
  isMultiDay: false,
  isRecurring: false,
  type: 'plan',
};

const mockOverduePlans: OverduePlan[] = [
  {
    plan: basePlan,
    overdueMinutes: 120,
  },
];

const mockOverduePlansMultiple: OverduePlan[] = [
  {
    plan: basePlan,
    overdueMinutes: 120,
  },
  {
    plan: {
      ...basePlan,
      id: 'plan-2',
      title: 'デザインレビュー',
      startDate: subHours(now, 5),
      endDate: subHours(now, 4),
      displayStartDate: subHours(now, 5),
      displayEndDate: subHours(now, 4),
    },
    overdueMinutes: 240,
  },
  {
    plan: {
      ...basePlan,
      id: 'plan-3',
      title: 'コードレビュー',
      startDate: subHours(now, 7),
      endDate: subHours(now, 6),
      displayStartDate: subHours(now, 7),
      displayEndDate: subHours(now, 6),
    },
    overdueMinutes: 360,
  },
];

/** OverdueSection用: endDateが過去のプラン（useAllOverduePlansでフィルタされる） */
const overdueSectionPlans: CalendarPlan[] = [
  basePlan,
  {
    ...basePlan,
    id: 'plan-2',
    title: 'デザインレビュー',
    startDate: subHours(now, 5),
    endDate: subHours(now, 4),
    displayStartDate: subHours(now, 5),
    displayEndDate: subHours(now, 4),
  },
];

/** 今日を含む1週間の日付 */
function weekDates(): Date[] {
  const dayOfWeek = now.getDay();
  const start = addDays(now, -dayOfWeek);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// ---------------------------------------------------------------------------
// Stories: OverdueBadge（バッジ単体）
// ---------------------------------------------------------------------------

/** バッジ単体（1件）。クリックでPopoverが開く。 */
export const Badge: Story = {
  render: () => (
    <OverdueBadge
      overduePlans={mockOverduePlans}
      className="border-warning hover:bg-state-hover h-6 w-48 rounded-lg border px-1"
    />
  ),
};

/** バッジ単体（複数件）。Popoverで一覧表示。 */
export const BadgeMultiple: Story = {
  render: () => (
    <OverdueBadge
      overduePlans={mockOverduePlansMultiple}
      className="border-warning hover:bg-state-hover h-6 w-48 rounded-lg border px-1"
    />
  ),
};

// ---------------------------------------------------------------------------
// Stories: OverdueSection（WeekView等のレイアウト）
// ---------------------------------------------------------------------------

/** WeekViewレイアウト。今日の列にバッジが表示される。 */
export const InWeekView: Story = {
  render: () => (
    <div className="w-[800px]">
      <OverdueSection dates={weekDates()} plans={overdueSectionPlans} />
    </div>
  ),
};

/** DayViewレイアウト（単一日付）。今日の場合にバッジが表示される。 */
export const InDayView: Story = {
  render: () => (
    <div className="w-[400px]">
      <OverdueSectionSingle date={now} plans={overdueSectionPlans} />
    </div>
  ),
};

/** 保留中なし。バッジは非表示。 */
export const Empty: Story = {
  render: () => (
    <div className="w-[800px]">
      <OverdueSection dates={weekDates()} plans={[]} />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 全パターン一覧
// ---------------------------------------------------------------------------

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <OverdueBadge
        overduePlans={mockOverduePlans}
        className="border-warning hover:bg-state-hover h-6 w-48 rounded-lg border px-1"
      />
      <OverdueBadge
        overduePlans={mockOverduePlansMultiple}
        className="border-warning hover:bg-state-hover h-6 w-48 rounded-lg border px-1"
      />
      <div className="w-[800px]">
        <OverdueSection dates={weekDates()} plans={overdueSectionPlans} />
      </div>
      <div className="w-[400px]">
        <OverdueSectionSingle date={now} plans={overdueSectionPlans} />
      </div>
    </div>
  ),
};
