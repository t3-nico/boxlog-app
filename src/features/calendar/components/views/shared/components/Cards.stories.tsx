import type { Meta, StoryObj } from '@storybook/react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { DragSelectionPreview } from './CalendarDragSelection/DragSelectionPreview';
import { PlanCard } from './PlanCard/PlanCard';

/** カレンダー上のカード（Plan/Record/Draft）の全バリエーション。 */
const meta = {
  title: 'Features/Calendar/Cards',
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

/** PlanCard/DragSelectionPreviewはposition:absoluteのため、relativeな親が必要。 */
function Slot({ children, height = 72 }: { children: React.ReactNode; height?: number }) {
  return (
    <div className="relative w-full" style={{ height }}>
      {children}
    </div>
  );
}

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
  height: 72,
};

const formatTime = (hour: number, minute: number) => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
// Plan系
// ---------------------------------------------------------------------------

/** 通常のPlan。完了済み・選択中・繰り返しのバリエーション含む。 */
export const Plan: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Slot>
        <PlanCard plan={basePlan} position={basePosition} />
      </Slot>
      <Slot>
        <PlanCard plan={{ ...basePlan, status: 'closed' }} position={basePosition} />
      </Slot>
      <Slot>
        <PlanCard plan={basePlan} position={basePosition} isSelected />
      </Slot>
      <Slot>
        <PlanCard plan={{ ...basePlan, isRecurring: true }} position={basePosition} />
      </Slot>
    </div>
  ),
};

/** Record（実績記録）。左ボーダーで区別。 */
export const Record: Story = {
  render: () => (
    <Slot>
      <PlanCard
        plan={{ ...basePlan, id: 'record-1', type: 'record', title: '開発作業' }}
        position={basePosition}
      />
    </Slot>
  ),
};

// ---------------------------------------------------------------------------
// Draft系
// ---------------------------------------------------------------------------

/** ドラッグ選択中のプレビュー。 */
export const DraftDragging: Story = {
  render: () => (
    <Slot>
      <DragSelectionPreview
        selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
        formatTime={formatTime}
      />
    </Slot>
  ),
};

/** 時間重複時のエラー表示。赤背景 + Banアイコン。 */
export const DraftOverlapping: Story = {
  render: () => (
    <Slot>
      <DragSelectionPreview
        selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
        formatTime={formatTime}
        isOverlapping
      />
    </Slot>
  ),
};

/** Inspector表示後のドラフト。isDraft=trueでチェックボックス無効・ドラッグ不可。 */
export const DraftCreating: Story = {
  render: () => (
    <Slot>
      <PlanCard
        plan={{ ...basePlan, id: '__draft__', title: '新しい予定', isDraft: true }}
        position={basePosition}
      />
    </Slot>
  ),
};

// ---------------------------------------------------------------------------
// 状態バリエーション
// ---------------------------------------------------------------------------

/** リマインダー設定あり。ベルアイコンが表示される。 */
export const WithReminder: Story = {
  render: () => (
    <Slot>
      <PlanCard plan={{ ...basePlan, reminder_minutes: 15 }} position={basePosition} />
    </Slot>
  ),
};

/** タグ付きのPlan。 */
export const WithTags: Story = {
  render: () => (
    <Slot height={100}>
      <PlanCard
        plan={{ ...basePlan, tagIds: ['tag-1', 'tag-2'] }}
        position={{ ...basePosition, height: 100 }}
      />
    </Slot>
  ),
};

// ---------------------------------------------------------------------------
// サイズバリエーション
// ---------------------------------------------------------------------------

/** 時間帯による高さの違い（HOUR_HEIGHT=72pxベース）。 */
export const SizeVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Slot height={18}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 18 }} />
      </Slot>
      <Slot height={36}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 36 }} />
      </Slot>
      <Slot>
        <PlanCard plan={basePlan} position={basePosition} />
      </Slot>
      <Slot height={144}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 144 }} />
      </Slot>
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
      <Slot>
        <PlanCard plan={basePlan} position={basePosition} />
      </Slot>
      <Slot>
        <PlanCard plan={{ ...basePlan, status: 'closed' }} position={basePosition} />
      </Slot>
      <Slot>
        <PlanCard plan={basePlan} position={basePosition} isSelected />
      </Slot>
      <Slot>
        <PlanCard plan={{ ...basePlan, isRecurring: true }} position={basePosition} />
      </Slot>
      <Slot>
        <PlanCard
          plan={{ ...basePlan, id: 'record-1', type: 'record', title: '開発作業' }}
          position={basePosition}
        />
      </Slot>
      <Slot>
        <DragSelectionPreview
          selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
          formatTime={formatTime}
        />
      </Slot>
      <Slot>
        <PlanCard
          plan={{ ...basePlan, id: '__draft__', title: '新しい予定', isDraft: true }}
          position={basePosition}
        />
      </Slot>
      <Slot>
        <DragSelectionPreview
          selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
          formatTime={formatTime}
          isOverlapping
        />
      </Slot>
      <Slot>
        <PlanCard plan={{ ...basePlan, reminder_minutes: 15 }} position={basePosition} />
      </Slot>
      <Slot height={100}>
        <PlanCard
          plan={{ ...basePlan, tagIds: ['tag-1', 'tag-2'] }}
          position={{ ...basePosition, height: 100 }}
        />
      </Slot>
      <Slot height={18}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 18 }} />
      </Slot>
      <Slot height={36}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 36 }} />
      </Slot>
      <Slot height={144}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 144 }} />
      </Slot>
    </div>
  ),
};
