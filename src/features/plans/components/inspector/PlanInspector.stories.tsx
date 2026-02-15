import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { Tag } from '@/features/tags/types';

import type { Plan } from '../../types/plan';
import { PlanInspectorDetailsTab } from './PlanInspectorContent/PlanInspectorDetailsTab';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/** Plan新規作成画面。ドラフトモードの全パターン。 */
const meta = {
  title: 'Features/Plans/PlanCreate',
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

const mockTags: Tag[] = [
  {
    id: 'tag-1',
    name: '仕事',
    user_id: 'user-1',
    color: '#3B82F6',
    description: '仕事関連のタスク',
    icon: null,
    is_active: true,
    parent_id: null,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tag-2',
    name: '重要',
    user_id: 'user-1',
    color: '#EF4444',
    description: '重要なタスク',
    icon: null,
    is_active: true,
    parent_id: null,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tag-3',
    name: '個人',
    user_id: 'user-1',
    color: '#10B981',
    description: null,
    icon: null,
    is_active: true,
    parent_id: null,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const basePlan: Plan = {
  id: 'plan-1',
  user_id: 'user-1',
  title: '',
  description: null,
  status: 'open',
  completed_at: null,
  due_date: null,
  start_time: null,
  end_time: null,
  recurrence_type: null,
  recurrence_end_date: null,
  recurrence_rule: null,
  reminder_minutes: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント
// ---------------------------------------------------------------------------

/** Inspector風コンテナ */
function InspectorFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border-border w-[400px] overflow-hidden rounded-xl border shadow-lg">
      {children}
    </div>
  );
}

/** ドラフトモードヘッダー（Plan/Record タブ） */
function DraftHeader() {
  return (
    <div className="bg-card relative flex shrink-0 items-center px-4 pt-4 pb-2">
      <Tabs value="plan" className="relative z-10">
        <TabsList className="h-8 rounded-lg border-0 bg-transparent p-0">
          <TabsTrigger
            value="plan"
            className="data-[state=active]:bg-state-selected data-[state=active]:text-foreground rounded-lg font-bold data-[state=active]:shadow-none"
          >
            Plan
          </TabsTrigger>
          <TabsTrigger
            value="record"
            className="data-[state=active]:bg-state-selected data-[state=active]:text-foreground rounded-lg font-bold data-[state=active]:shadow-none"
          >
            Record
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// インタラクティブラッパー
// ---------------------------------------------------------------------------

function PlanCreateStory({
  plan,
  initialTagIds = [],
  initialScheduleDate,
  initialStartTime = '',
  initialEndTime = '',
  initialDueDate,
  initialReminderType = 'none',
}: {
  plan: Plan;
  initialTagIds?: string[];
  initialScheduleDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  initialDueDate?: Date;
  initialReminderType?: string;
}) {
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [tagIds, setTagIds] = useState(initialTagIds);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(initialScheduleDate);
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDueDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [reminderType, setReminderType] = useState(initialReminderType);

  return (
    <InspectorFrame>
      <DraftHeader />
      <div>
        <PlanInspectorDetailsTab
          plan={plan}
          planId={plan.id}
          titleRef={titleRef}
          scheduleDate={scheduleDate}
          dueDate={dueDate}
          startTime={startTime}
          endTime={endTime}
          reminderType={reminderType}
          selectedTagIds={tagIds}
          recurrenceRule={null}
          recurrenceType={null}
          timeConflictError={false}
          onAutoSave={() => {}}
          onScheduleDateChange={setScheduleDate}
          onDueDateChange={setDueDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onReminderChange={setReminderType}
          onTagsChange={setTagIds}
          onRemoveTag={(id) => setTagIds((prev) => prev.filter((t) => t !== id))}
          onRepeatTypeChange={() => {}}
          onRecurrenceRuleChange={() => {}}
          isDraftMode
          availableTags={mockTags}
        />
      </div>
      <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
        <Button variant="ghost">キャンセル</Button>
        <Button>Plan 作成</Button>
      </div>
    </InspectorFrame>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Plan新規作成（空フォーム）。ドラフトモードヘッダー + 空入力フィールド。 */
export const PlanCreate: Story = {
  render: () => (
    <PlanCreateStory
      plan={{ ...basePlan, id: '__draft__' }}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
    />
  ),
};

/** Plan新規作成（入力済み）。タイトル・時間・タグが入力された状態。 */
export const PlanCreateFilled: Story = {
  render: () => (
    <PlanCreateStory
      plan={{
        ...basePlan,
        id: '__draft__',
        title: 'チームミーティング',
        description: '<p>週次の進捗確認</p>',
      }}
      initialTagIds={['tag-1', 'tag-2']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialDueDate={new Date('2024-01-15')}
      initialReminderType="15min"
    />
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <PlanCreateStory
        plan={{ ...basePlan, id: '__draft__' }}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
      />
      <PlanCreateStory
        plan={{
          ...basePlan,
          id: '__draft__',
          title: 'チームミーティング',
          description: '<p>週次の進捗確認</p>',
        }}
        initialTagIds={['tag-1', 'tag-2']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialDueDate={new Date('2024-01-15')}
        initialReminderType="15min"
      />
    </div>
  ),
};
