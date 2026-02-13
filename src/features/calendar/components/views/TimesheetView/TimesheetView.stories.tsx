import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { TimesheetGrid } from './components/TimesheetGrid';

import type { TimesheetData, TimesheetTagGroup } from './TimesheetView.types';

/**
 * TimesheetView - タグ×日のピボットテーブルビュー
 *
 * タグ（プロジェクト）を行、曜日を列として週単位の時間配分を一覧表示。
 * Plan は Clock アイコン（青）、Record は PenLine アイコン（緑）で区別。
 *
 * **内部コンポーネント TimesheetGrid を直接レンダリング**
 * （TimesheetView は useCalendarFilterStore / useTagsMap に依存するため）
 */
const meta = {
  title: 'Features/Calendar/Views/TimesheetView',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const weekStart = startOfWeek(today, { weekStartsOn: 1 });
const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });

function makeDate(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function dateKey(dayOffset: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────

const basePlan: CalendarPlan = {
  id: '',
  title: '',
  startDate: null,
  endDate: null,
  status: 'open',
  color: 'var(--primary)',
  createdAt: now,
  updatedAt: now,
  displayStartDate: now,
  displayEndDate: now,
  duration: 60,
  isMultiDay: false,
  isRecurring: false,
  type: 'plan',
};

function makePlan(
  overrides: Partial<CalendarPlan> & { id: string; title: string; dayOffset: number },
): CalendarPlan {
  const start = makeDate(overrides.dayOffset, 10);
  const end = makeDate(overrides.dayOffset, 11);
  return {
    ...basePlan,
    startDate: start,
    endDate: end,
    displayStartDate: start,
    displayEndDate: end,
    ...overrides,
  };
}

// Named plans for type safety (avoid array index access)
const planApiDesign = makePlan({ id: 'p1', title: 'API設計', dayOffset: 0, duration: 120 });
const planCodeReview = makePlan({ id: 'p2', title: 'コードレビュー', dayOffset: 1, duration: 60 });
const planBugFix = makePlan({ id: 'p3', title: 'バグ修正', dayOffset: 3, duration: 90 });
const planMockup = makePlan({ id: 'p4', title: 'モックアップ作成', dayOffset: 1, duration: 120 });
const planDesignReview = makePlan({
  id: 'p5',
  title: 'デザインレビュー',
  dayOffset: 4,
  duration: 60,
});
const recordMeeting = makePlan({
  id: 'r1',
  title: 'ミーティング',
  dayOffset: 0,
  duration: 30,
  type: 'record',
});
const recordDocs = makePlan({
  id: 'r2',
  title: 'ドキュメント作成',
  dayOffset: 2,
  duration: 45,
  type: 'record',
});
const planMisc = makePlan({ id: 'p6', title: '雑務', dayOffset: 0, duration: 30 });

// タグごとのグループ
const workGroup: TimesheetTagGroup = {
  tagId: 'tag-1',
  tagName: 'Work',
  tagColor: '#3B82F6',
  parentId: null,
  plans: [planApiDesign, planCodeReview, planBugFix, recordMeeting],
  dailyTotals: {
    [dateKey(0)]: 150, // 120 + 30(record)
    [dateKey(1)]: 60,
    [dateKey(3)]: 90,
  },
  weekTotal: 300,
};

const designGroup: TimesheetTagGroup = {
  tagId: 'tag-2',
  tagName: 'Design',
  tagColor: '#10B981',
  parentId: null,
  plans: [planMockup, planDesignReview, recordDocs],
  dailyTotals: {
    [dateKey(1)]: 120,
    [dateKey(2)]: 45,
    [dateKey(4)]: 60,
  },
  weekTotal: 225,
};

const untaggedGroup: TimesheetTagGroup = {
  tagId: null,
  tagName: '',
  tagColor: '#6b7280',
  parentId: null,
  plans: [planMisc],
  dailyTotals: {
    [dateKey(0)]: 30,
  },
  weekTotal: 30,
};

const mockData: TimesheetData = {
  tagGroups: [workGroup, designGroup, untaggedGroup],
  dailyTotals: {
    [dateKey(0)]: 180,
    [dateKey(1)]: 180,
    [dateKey(2)]: 45,
    [dateKey(3)]: 90,
    [dateKey(4)]: 60,
  },
  weekTotal: 555,
  weekDates,
};

const emptyData: TimesheetData = {
  tagGroups: [],
  dailyTotals: {},
  weekTotal: 0,
  weekDates,
};

const singleTagData: TimesheetData = {
  tagGroups: [workGroup],
  dailyTotals: {
    [dateKey(0)]: 150,
    [dateKey(1)]: 60,
    [dateKey(3)]: 90,
  },
  weekTotal: 300,
  weekDates,
};

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/** 複数タグ + Untagged + Plan/Record混在 */
export const Default: Story = {
  render: () => (
    <div className="h-[600px] p-4">
      <TimesheetGrid data={mockData} onPlanClick={fn()} />
    </div>
  ),
};

/** 空状態（タググループなし） */
export const Empty: Story = {
  render: () => (
    <div className="h-[300px] p-4">
      <TimesheetGrid data={emptyData} onPlanClick={fn()} />
    </div>
  ),
};

/** 単一タグのみ */
export const SingleTag: Story = {
  render: () => (
    <div className="h-[400px] p-4">
      <TimesheetGrid data={singleTagData} onPlanClick={fn()} />
    </div>
  ),
};

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">複数タグ + Plan/Record混在</h3>
        <TimesheetGrid data={mockData} onPlanClick={fn()} />
      </div>
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">単一タグ</h3>
        <TimesheetGrid data={singleTagData} onPlanClick={fn()} />
      </div>
      <div>
        <h3 className="text-foreground mb-2 text-sm font-bold">空状態</h3>
        <TimesheetGrid data={emptyData} onPlanClick={fn()} />
      </div>
    </div>
  ),
};
