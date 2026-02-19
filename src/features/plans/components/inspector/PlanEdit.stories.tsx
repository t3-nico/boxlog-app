import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';

import type { Tag } from '@/features/tags/types';

import type { Plan } from '../../types/plan';
import { PlanInspectorDetailsTab } from './PlanInspectorContent/PlanInspectorDetailsTab';
import { PlanInspectorMenu } from './PlanInspectorContent/PlanInspectorMenu';
import { InspectorHeader } from './shared';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/** Plan編集画面。InspectorHeader・メニュー・フッターを含む完全な編集体験。 */
const meta = {
  title: 'Features/Plans/PlanEdit',
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
  start_time: null,
  end_time: null,
  recurrence_type: null,
  recurrence_end_date: null,
  recurrence_rule: null,
  reminder_minutes: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

const filledPlan: Plan = {
  ...basePlan,
  title: 'チームミーティング',
  description: '<p>週次の進捗確認。アジェンダを事前に共有すること。</p>',
  start_time: '2024-01-15T10:00:00+09:00',
  end_time: '2024-01-15T11:00:00+09:00',
  reminder_minutes: 15,
};

const completedPlan: Plan = {
  ...filledPlan,
  status: 'closed',
  completed_at: '2024-01-15T11:05:00+09:00',
};

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント
// ---------------------------------------------------------------------------

const noop = () => {};

/** Inspector風コンテナ */
function InspectorFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border-border w-[400px] overflow-hidden rounded-xl border shadow-lg">
      {children}
    </div>
  );
}

/** Plan用メニューコンテンツ */
const planMenuContent = (
  <PlanInspectorMenu onDuplicate={noop} onSaveAsTemplate={noop} onCopyId={noop} onDelete={noop} />
);

/** 編集モードフッター（完了にするスプリットボタン） */
function EditFooter({ status }: { status: 'open' | 'closed' }) {
  if (status === 'closed') {
    return (
      <div className="flex shrink-0 justify-end px-4 py-4">
        <Button variant="outline">未完了に戻す</Button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 justify-end px-4 py-4">
      <div className="flex items-center overflow-hidden rounded-md">
        <Button variant="primary" className="rounded-none border-0">
          完了にする
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="primary"
              icon
              className="rounded-none border-0"
              aria-label="完了オプション"
            >
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>完了にする</DropdownMenuItem>
            <DropdownMenuItem>完了 + Record作成</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// インタラクティブラッパー
// ---------------------------------------------------------------------------

function PlanEditStory({
  plan,
  initialTagIds = [],
  initialScheduleDate,
  initialStartTime = '',
  initialEndTime = '',
  initialReminderMinutes = null as number | null,
  timeConflictError = false,
}: {
  plan: Plan;
  initialTagIds?: string[];
  initialScheduleDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  initialReminderMinutes?: number | null;
  timeConflictError?: boolean;
}) {
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [tagIds, setTagIds] = useState(initialTagIds);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(initialScheduleDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(initialReminderMinutes);

  return (
    <InspectorFrame>
      <InspectorHeader
        hasPrevious
        hasNext
        onClose={noop}
        onPrevious={noop}
        onNext={noop}
        menuContent={planMenuContent}
      />
      <div>
        <PlanInspectorDetailsTab
          plan={plan}
          planId={plan.id}
          titleRef={titleRef}
          scheduleDate={scheduleDate}
          startTime={startTime}
          endTime={endTime}
          reminderMinutes={reminderMinutes}
          selectedTagIds={tagIds}
          recurrenceRule={null}
          recurrenceType={null}
          timeConflictError={timeConflictError}
          onAutoSave={noop}
          onScheduleDateChange={setScheduleDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onReminderChange={setReminderMinutes}
          onTagsChange={setTagIds}
          onRemoveTag={(id) => setTagIds((prev) => prev.filter((t) => t !== id))}
          onRepeatTypeChange={noop}
          onRecurrenceRuleChange={noop}
          isDraftMode={false}
          availableTags={mockTags}
        />
      </div>
      <EditFooter status={plan.status} />
    </InspectorFrame>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 既存Plan編集。InspectorHeader（ナビゲーション + メニュー）+ 完了スプリットボタン。 */
export const Edit: Story = {
  render: () => (
    <PlanEditStory
      plan={filledPlan}
      initialTagIds={['tag-1']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialReminderMinutes={15}
    />
  ),
};

/** 完了済みPlan。「未完了に戻す」ボタン表示。 */
export const Completed: Story = {
  render: () => (
    <PlanEditStory
      plan={completedPlan}
      initialTagIds={['tag-1', 'tag-2']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialReminderMinutes={15}
    />
  ),
};

/** 時間重複エラー。ScheduleRowの時間フィールドが赤くハイライト。 */
export const TimeConflict: Story = {
  render: () => (
    <PlanEditStory
      plan={filledPlan}
      initialTagIds={['tag-1']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      timeConflictError
    />
  ),
};

/** ローディング状態。データ取得中のスピナー表示。 */
export const Loading: Story = {
  render: () => (
    <InspectorFrame>
      <InspectorHeader onClose={noop} />
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    </InspectorFrame>
  ),
};

/** 空状態。Planが見つからない場合の表示。 */
export const Empty: Story = {
  render: () => (
    <InspectorFrame>
      <InspectorHeader onClose={noop} />
      <div className="flex h-48 items-center justify-center">
        <p className="text-muted-foreground">プランが見つかりません</p>
      </div>
    </InspectorFrame>
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <PlanEditStory
        plan={filledPlan}
        initialTagIds={['tag-1']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialReminderMinutes={15}
      />
      <PlanEditStory
        plan={completedPlan}
        initialTagIds={['tag-1', 'tag-2']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialReminderMinutes={15}
      />
      <PlanEditStory
        plan={filledPlan}
        initialTagIds={['tag-1']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        timeConflictError
      />
    </div>
  ),
};
