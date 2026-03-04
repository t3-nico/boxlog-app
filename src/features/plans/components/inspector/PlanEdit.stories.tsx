import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';

import type { EntryWithTags } from '@/core/types/entry';
import { PlanInspectorDetailsTab } from './PlanInspectorContent/PlanInspectorDetailsTab';
import { PlanInspectorMenu } from './PlanInspectorContent/PlanInspectorMenu';
import { InspectorHeader } from './shared';
import { InspectorFrame, mockTags } from './shared/story-helpers';

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

const basePlan: EntryWithTags = {
  id: 'plan-1',
  user_id: 'user-1',
  title: '',
  description: null,
  origin: 'planned',
  start_time: null,
  end_time: null,
  actual_start_time: null,
  actual_end_time: null,
  duration_minutes: null,
  fulfillment_score: null,
  recurrence_type: null,
  recurrence_end_date: null,
  recurrence_rule: null,
  reminder_minutes: null,
  reviewed_at: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  tagId: null,
};

const filledPlan: EntryWithTags = {
  ...basePlan,
  title: 'チームミーティング',
  description: '<p>週次の進捗確認。アジェンダを事前に共有すること。</p>',
  start_time: '2024-01-15T10:00:00+09:00',
  end_time: '2024-01-15T11:00:00+09:00',
};

const completedPlan: EntryWithTags = {
  ...filledPlan,
  actual_start_time: '2024-01-15T10:05:00+09:00',
  actual_end_time: '2024-01-15T11:05:00+09:00',
};

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント
// ---------------------------------------------------------------------------

const noop = () => {};

/** Plan用メニューコンテンツ */
const planMenuContent = <PlanInspectorMenu onDuplicate={noop} onCopyId={noop} onDelete={noop} />;

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
  initialTagId = null as string | null,
  initialScheduleDate,
  initialStartTime = '',
  initialEndTime = '',
  initialReminderMinutes = null as number | null,
  timeConflictError = false,
}: {
  plan: EntryWithTags;
  initialTagId?: string | null;
  initialScheduleDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  initialReminderMinutes?: number | null;
  timeConflictError?: boolean;
}) {
  const [tagId, setTagId] = useState<string | null>(initialTagId);
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
          scheduleDate={scheduleDate}
          startTime={startTime}
          endTime={endTime}
          reminderMinutes={reminderMinutes}
          selectedTagId={tagId}
          recurrenceRule={null}
          recurrenceType={null}
          timeConflictError={timeConflictError}
          onAutoSave={noop}
          onScheduleDateChange={setScheduleDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onReminderChange={setReminderMinutes}
          onTagChange={setTagId}
          onRepeatTypeChange={noop}
          onRecurrenceRuleChange={noop}
          availableTags={mockTags}
        />
      </div>
      <EditFooter status={plan.actual_end_time ? 'closed' : 'open'} />
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
      initialTagId="tag-1"
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
      initialTagId="tag-1"
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
      initialTagId="tag-1"
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
        initialTagId="tag-1"
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialReminderMinutes={15}
      />
      <PlanEditStory
        plan={completedPlan}
        initialTagId="tag-1"
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialReminderMinutes={15}
      />
      <PlanEditStory
        plan={filledPlan}
        initialTagId="tag-1"
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        timeConflictError
      />
    </div>
  ),
};
