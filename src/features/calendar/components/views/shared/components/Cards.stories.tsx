import type { Meta, StoryObj } from '@storybook/react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import { DragSelectionPreview } from './CalendarDragSelection/DragSelectionPreview';
import { PlanCard } from './PlanCard/PlanCard';

/**
 * カレンダー上に表示されるカードのすべてのバリエーション。
 *
 * ## カード種別
 * - **Plan**: 通常の予定（チェックボックス付き）
 * - **Record**: 実績記録（左ボーダー付き、読み取り専用）
 * - **Draft**: 新規作成中のプレビュー
 *
 * ## ドラフト表示の流れ
 * 1. **DragSelectionPreview**: ドラッグ選択中に表示
 * 2. **PlanCard (isDraft)**: Inspector表示後に表示
 *
 * 両者は同じPlanCardContentを使用し、一貫した見た目を実現。
 */
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">{children}</p>;
}

// カレンダーグリッド風のコンテナ（HOUR_HEIGHT=72pxに合わせる）
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
  height: 72,
};

const formatTime = (hour: number, minute: number) => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
// Plan系
// ---------------------------------------------------------------------------

/** Plan: 通常の予定 */
export const Plan: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <GridContainer>
          <PlanCard plan={basePlan} position={basePosition} />
        </GridContainer>
      </div>

      <div>
        <SectionLabel>バリエーション</SectionLabel>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">完了済み</span>
            <GridContainer>
              <PlanCard plan={{ ...basePlan, status: 'closed' }} position={basePosition} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">選択中</span>
            <GridContainer>
              <PlanCard plan={basePlan} position={basePosition} isSelected />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">繰り返し</span>
            <GridContainer>
              <PlanCard plan={{ ...basePlan, isRecurring: true }} position={basePosition} />
            </GridContainer>
          </div>
        </div>
      </div>
    </div>
  ),
};

/** Record: 実績記録 */
export const Record: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <GridContainer>
          <PlanCard
            plan={{ ...basePlan, id: 'record-1', type: 'record', title: '開発作業' }}
            position={basePosition}
          />
        </GridContainer>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Draft系
// ---------------------------------------------------------------------------

/** DraftDragging: ドラッグ選択中のプレビュー */
export const DraftDragging: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <GridContainer>
          <DragSelectionPreview
            selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
            formatTime={formatTime}
          />
        </GridContainer>
      </div>
      <p className="text-muted-foreground text-xs">
        PlanCardContentを使用してPlanCard Draftと同じ見た目を実現
      </p>
    </div>
  ),
};

/** DraftOverlapping: 時間重複時のエラー表示 */
export const DraftOverlapping: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <GridContainer>
          <DragSelectionPreview
            selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
            formatTime={formatTime}
            isOverlapping
          />
        </GridContainer>
      </div>
      <p className="text-muted-foreground text-xs">
        赤背景 + Banアイコンで警告。この状態では予定を作成できない
      </p>
    </div>
  ),
};

/** DraftCreating: Inspector表示後のドラフト */
export const DraftCreating: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <SectionLabel>基本</SectionLabel>
        <GridContainer>
          <PlanCard
            plan={{ ...basePlan, id: '__draft__', title: '新しい予定', isDraft: true }}
            position={basePosition}
          />
        </GridContainer>
      </div>
      <p className="text-muted-foreground text-xs">
        PlanCardにisDraft=trueを渡した状態。チェックボックス無効、ドラッグ・リサイズ不可
      </p>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// サイズバリエーション
// ---------------------------------------------------------------------------

/** SizeVariations: 時間帯による高さの違い */
export const SizeVariations: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <SectionLabel>HOUR_HEIGHT=72px ベース</SectionLabel>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">15分</span>
            <GridContainer height={18}>
              <PlanCard plan={basePlan} position={{ ...basePosition, height: 18 }} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">30分</span>
            <GridContainer height={36}>
              <PlanCard plan={basePlan} position={{ ...basePosition, height: 36 }} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">1時間</span>
            <GridContainer>
              <PlanCard plan={basePlan} position={basePosition} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">2時間</span>
            <GridContainer height={144}>
              <PlanCard plan={basePlan} position={{ ...basePosition, height: 144 }} />
            </GridContainer>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 全状態一覧
// ---------------------------------------------------------------------------

/** AllStates: すべてのカード状態を一覧表示 */
export const AllStates: Story = {
  render: () => (
    <div className="space-y-8 p-4">
      {/* Plan系 */}
      <div>
        <SectionLabel>Plan（予定）</SectionLabel>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">通常</span>
            <GridContainer>
              <PlanCard plan={basePlan} position={basePosition} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">完了済み</span>
            <GridContainer>
              <PlanCard plan={{ ...basePlan, status: 'closed' }} position={basePosition} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">選択中</span>
            <GridContainer>
              <PlanCard plan={basePlan} position={basePosition} isSelected />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">繰り返し</span>
            <GridContainer>
              <PlanCard plan={{ ...basePlan, isRecurring: true }} position={basePosition} />
            </GridContainer>
          </div>
        </div>
      </div>

      {/* Record系 */}
      <div>
        <SectionLabel>Record（実績記録）</SectionLabel>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">通常</span>
            <GridContainer>
              <PlanCard
                plan={{ ...basePlan, id: 'record-1', type: 'record', title: '開発作業' }}
                position={basePosition}
              />
            </GridContainer>
          </div>
        </div>
      </div>

      {/* Draft系 */}
      <div>
        <SectionLabel>Draft（新規作成中）</SectionLabel>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">ドラッグ選択中</span>
            <GridContainer>
              <DragSelectionPreview
                selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
                formatTime={formatTime}
              />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Inspector表示後</span>
            <GridContainer>
              <PlanCard
                plan={{ ...basePlan, id: '__draft__', title: '新しい予定', isDraft: true }}
                position={basePosition}
              />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">時間重複エラー</span>
            <GridContainer>
              <DragSelectionPreview
                selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
                formatTime={formatTime}
                isOverlapping
              />
            </GridContainer>
          </div>
        </div>
      </div>

      {/* サイズ */}
      <div>
        <SectionLabel>サイズバリエーション</SectionLabel>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">15分</span>
            <GridContainer height={18}>
              <PlanCard plan={basePlan} position={{ ...basePosition, height: 18 }} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">30分</span>
            <GridContainer height={36}>
              <PlanCard plan={basePlan} position={{ ...basePosition, height: 36 }} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">1時間</span>
            <GridContainer>
              <PlanCard plan={basePlan} position={basePosition} />
            </GridContainer>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">2時間</span>
            <GridContainer height={144}>
              <PlanCard plan={basePlan} position={{ ...basePosition, height: 144 }} />
            </GridContainer>
          </div>
        </div>
      </div>
    </div>
  ),
};
