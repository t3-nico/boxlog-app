import type { Meta, StoryObj } from '@storybook/react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { DragSelectionPreview } from './CalendarDragSelection/DragSelectionPreview';
import { PlanCard } from './PlanCard/PlanCard';

/** カレンダー上のカード（Plan/Record/Draft）の全バリエーション。 */
const meta = {
  title: 'Features/Calendar/Cards',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

function GridContainer({ children, height = 72 }: { children: React.ReactNode; height?: number }) {
  return (
    <div
      className="bg-card border-border relative border-l"
      style={{
        width: 200,
        height,
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent, transparent 17px, var(--border) 17px, var(--border) 18px)',
      }}
    >
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
    <div className="flex flex-wrap gap-4 p-4">
      <GridContainer>
        <PlanCard plan={basePlan} position={basePosition} />
      </GridContainer>
      <GridContainer>
        <PlanCard plan={{ ...basePlan, status: 'closed' }} position={basePosition} />
      </GridContainer>
      <GridContainer>
        <PlanCard plan={basePlan} position={basePosition} isSelected />
      </GridContainer>
      <GridContainer>
        <PlanCard plan={{ ...basePlan, isRecurring: true }} position={basePosition} />
      </GridContainer>
    </div>
  ),
};

/** Record（実績記録）。左ボーダーで区別。 */
export const Record: Story = {
  render: () => (
    <div className="p-4">
      <GridContainer>
        <PlanCard
          plan={{ ...basePlan, id: 'record-1', type: 'record', title: '開発作業' }}
          position={basePosition}
        />
      </GridContainer>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Draft系
// ---------------------------------------------------------------------------

/** ドラッグ選択中のプレビュー。PlanCardContentを使用。 */
export const DraftDragging: Story = {
  render: () => (
    <div className="p-4">
      <GridContainer>
        <DragSelectionPreview
          selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
          formatTime={formatTime}
        />
      </GridContainer>
    </div>
  ),
};

/** 時間重複時のエラー表示。赤背景 + Banアイコン。 */
export const DraftOverlapping: Story = {
  render: () => (
    <div className="p-4">
      <GridContainer>
        <DragSelectionPreview
          selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
          formatTime={formatTime}
          isOverlapping
        />
      </GridContainer>
    </div>
  ),
};

/** Inspector表示後のドラフト。isDraft=trueでチェックボックス無効・ドラッグ不可。 */
export const DraftCreating: Story = {
  render: () => (
    <div className="p-4">
      <GridContainer>
        <PlanCard
          plan={{ ...basePlan, id: '__draft__', title: '新しい予定', isDraft: true }}
          position={basePosition}
        />
      </GridContainer>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 状態バリエーション
// ---------------------------------------------------------------------------

/** リマインダー設定あり。ベルアイコンが表示される。 */
export const WithReminder: Story = {
  render: () => (
    <div className="p-4">
      <GridContainer>
        <PlanCard plan={{ ...basePlan, reminder_minutes: 15 }} position={basePosition} />
      </GridContainer>
    </div>
  ),
};

/** タグ付きのPlan。 */
export const WithTags: Story = {
  render: () => (
    <div className="p-4">
      <GridContainer height={100}>
        <PlanCard
          plan={{ ...basePlan, tagIds: ['tag-1', 'tag-2'] }}
          position={{ ...basePosition, height: 100 }}
        />
      </GridContainer>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// サイズバリエーション
// ---------------------------------------------------------------------------

/** 時間帯による高さの違い（HOUR_HEIGHT=72pxベース）。 */
export const SizeVariations: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4 p-4">
      <GridContainer height={18}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 18 }} />
      </GridContainer>
      <GridContainer height={36}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 36 }} />
      </GridContainer>
      <GridContainer>
        <PlanCard plan={basePlan} position={basePosition} />
      </GridContainer>
      <GridContainer height={144}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 144 }} />
      </GridContainer>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 全パターン一覧
// ---------------------------------------------------------------------------

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6 p-4">
      <div className="flex flex-wrap gap-4">
        <GridContainer>
          <PlanCard plan={basePlan} position={basePosition} />
        </GridContainer>
        <GridContainer>
          <PlanCard plan={{ ...basePlan, status: 'closed' }} position={basePosition} />
        </GridContainer>
        <GridContainer>
          <PlanCard plan={basePlan} position={basePosition} isSelected />
        </GridContainer>
        <GridContainer>
          <PlanCard plan={{ ...basePlan, isRecurring: true }} position={basePosition} />
        </GridContainer>
      </div>

      <GridContainer>
        <PlanCard
          plan={{ ...basePlan, id: 'record-1', type: 'record', title: '開発作業' }}
          position={basePosition}
        />
      </GridContainer>

      <div className="flex flex-wrap gap-4">
        <GridContainer>
          <DragSelectionPreview
            selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
            formatTime={formatTime}
          />
        </GridContainer>
        <GridContainer>
          <PlanCard
            plan={{ ...basePlan, id: '__draft__', title: '新しい予定', isDraft: true }}
            position={basePosition}
          />
        </GridContainer>
        <GridContainer>
          <DragSelectionPreview
            selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
            formatTime={formatTime}
            isOverlapping
          />
        </GridContainer>
      </div>

      <div className="flex flex-wrap gap-4">
        <GridContainer>
          <PlanCard plan={{ ...basePlan, reminder_minutes: 15 }} position={basePosition} />
        </GridContainer>
        <GridContainer height={100}>
          <PlanCard
            plan={{ ...basePlan, tagIds: ['tag-1', 'tag-2'] }}
            position={{ ...basePosition, height: 100 }}
          />
        </GridContainer>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <GridContainer height={18}>
          <PlanCard plan={basePlan} position={{ ...basePosition, height: 18 }} />
        </GridContainer>
        <GridContainer height={36}>
          <PlanCard plan={basePlan} position={{ ...basePosition, height: 36 }} />
        </GridContainer>
        <GridContainer>
          <PlanCard plan={basePlan} position={basePosition} />
        </GridContainer>
        <GridContainer height={144}>
          <PlanCard plan={basePlan} position={{ ...basePosition, height: 144 }} />
        </GridContainer>
      </div>
    </div>
  ),
};
