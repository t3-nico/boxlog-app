import type { Meta, StoryObj } from '@storybook/react-vite';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { DailyUsageStrip, DailyUsageStripSingle } from './DailyUsageStrip';

/**
 * DailyUsageStrip - 日別のPlan/Record使用時間を表示するバー。
 *
 * - WeekView/MultiDayView: 各日列にコンパクト表示（P/R + 時間）
 * - DayView: 1行で表示（Plan/Record + 時間）
 * - 左端にタイムゾーン表示
 * - 0h の場合は `-` で省略
 */

const meta = {
  title: 'Features/Calendar/Views/DailyUsageStrip',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

const baseDate = new Date('2025-01-13');

function makeDate(daysOffset: number): Date {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysOffset);
  return d;
}

const weekDates = Array.from({ length: 7 }, (_, i) => makeDate(i));

// 型安全に個別日付を取得
const mon = makeDate(0);
const tue = makeDate(1);
const wed = makeDate(2);
const thu = makeDate(3);
const fri = makeDate(4);
const sat = makeDate(5);

function makePlan(
  id: string,
  date: Date,
  startHour: number,
  endHour: number,
  type: 'plan' | 'record' = 'plan',
): CalendarPlan {
  const start = new Date(date);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(date);
  end.setHours(endHour, 0, 0, 0);

  return {
    id,
    title: `${type} ${id}`,
    startDate: start,
    endDate: end,
    displayStartDate: start,
    displayEndDate: end,
    status: 'open',
    color: 'var(--primary)',
    createdAt: new Date(),
    updatedAt: new Date(),
    duration: (endHour - startHour) * 60,
    isMultiDay: false,
    isRecurring: false,
    type,
  };
}

// サンプルデータ: 月曜〜日曜に適当にPlan/Record
const samplePlans: CalendarPlan[] = [
  // 月曜: Plan 3h, Record 1h
  makePlan('p1', mon, 9, 12, 'plan'),
  makePlan('r1', mon, 13, 14, 'record'),
  // 火曜: Plan 2h
  makePlan('p2', tue, 10, 12, 'plan'),
  // 水曜: Record 4h
  makePlan('r3', wed, 9, 13, 'record'),
  // 木曜: Plan 1h, Record 2h
  makePlan('p4', thu, 14, 15, 'plan'),
  makePlan('r4', thu, 10, 12, 'record'),
  // 金曜: なし
  // 土曜: Plan 6h
  makePlan('p6', sat, 8, 14, 'plan'),
  // 日曜: なし
];

// ---------------------------------------------------------------------------
// WeekView（複数日・コンパクト表示）
// ---------------------------------------------------------------------------

/** WeekView: 7日分の使用時間を表示 */
export const WeekView: Story = {
  render: () => (
    <div className="border-border w-full border">
      <DailyUsageStrip dates={weekDates} plans={samplePlans} timezone="Asia/Tokyo" />
    </div>
  ),
};

/** WeekView: データなし（全日 0h） */
export const WeekViewEmpty: Story = {
  render: () => (
    <div className="border-border w-full border">
      <DailyUsageStrip dates={weekDates} plans={[]} timezone="Asia/Tokyo" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// DayView（単一日・横長表示）
// ---------------------------------------------------------------------------

/** DayView: Plan + Record の時間表示 */
export const DayView: Story = {
  render: () => (
    <div className="border-border w-full border">
      <DailyUsageStripSingle date={mon} plans={samplePlans} timezone="Asia/Tokyo" />
    </div>
  ),
};

/** DayView: データなし */
export const DayViewEmpty: Story = {
  render: () => (
    <div className="border-border w-full border">
      <DailyUsageStripSingle date={fri} plans={[]} timezone="Asia/Tokyo" />
    </div>
  ),
};

/** DayView: Planのみ（Recordなし） */
export const DayViewPlanOnly: Story = {
  render: () => (
    <div className="border-border w-full border">
      <DailyUsageStripSingle date={tue} plans={samplePlans} timezone="Asia/Tokyo" />
    </div>
  ),
};

/** DayView: Recordのみ（Planなし） */
export const DayViewRecordOnly: Story = {
  render: () => (
    <div className="border-border w-full border">
      <DailyUsageStripSingle date={wed} plans={samplePlans} timezone="Asia/Tokyo" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// タイムゾーンなし
// ---------------------------------------------------------------------------

/** タイムゾーン非表示 */
export const NoTimezone: Story = {
  render: () => (
    <div className="border-border w-full border">
      <DailyUsageStrip dates={weekDates} plans={samplePlans} />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 全パターン
// ---------------------------------------------------------------------------

/** 全パターン一覧 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="w-full">
        <p className="text-muted-foreground mb-1 text-xs">WeekView（7日）</p>
        <div className="border-border border">
          <DailyUsageStrip dates={weekDates} plans={samplePlans} timezone="Asia/Tokyo" />
        </div>
      </div>

      <div className="w-full">
        <p className="text-muted-foreground mb-1 text-xs">WeekView（データなし）</p>
        <div className="border-border border">
          <DailyUsageStrip dates={weekDates} plans={[]} timezone="Asia/Tokyo" />
        </div>
      </div>

      <div className="w-full">
        <p className="text-muted-foreground mb-1 text-xs">DayView（Plan + Record）</p>
        <div className="border-border border">
          <DailyUsageStripSingle date={mon} plans={samplePlans} timezone="Asia/Tokyo" />
        </div>
      </div>

      <div className="w-full">
        <p className="text-muted-foreground mb-1 text-xs">DayView（データなし）</p>
        <div className="border-border border">
          <DailyUsageStripSingle date={fri} plans={[]} timezone="Asia/Tokyo" />
        </div>
      </div>
    </div>
  ),
};
