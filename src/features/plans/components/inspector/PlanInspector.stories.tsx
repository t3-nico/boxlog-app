'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown, ChevronUp, MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { EntryWithTags } from '@/core/types/entry';
import { PlanInspectorDetailsTab } from './PlanInspectorContent/PlanInspectorDetailsTab';
import { InspectorFrame, mockTags } from './shared/story-helpers';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/** Plan Inspector のフォーム画面。新規作成・編集の全パターン。 */
const meta = {
  title: 'Features/Plans/PlanForm',
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

/** 編集モードヘッダー（ナビゲーション + メニュー + 閉じる） */
function EditHeader({
  hasPrevious = true,
  hasNext = true,
}: {
  hasPrevious?: boolean;
  hasNext?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-between px-4 pt-4 pb-2',
        'bg-card',
      )}
    >
      <div className="relative z-10 flex items-center gap-1">
        <div className="flex items-center">
          <HoverTooltip content="前へ" side="top">
            <Button variant="ghost" icon size="sm" disabled={!hasPrevious} aria-label="前へ">
              <ChevronUp className="size-5" />
            </Button>
          </HoverTooltip>
          <HoverTooltip content="次へ" side="top">
            <Button variant="ghost" icon size="sm" disabled={!hasNext} aria-label="次へ">
              <ChevronDown className="size-5" />
            </Button>
          </HoverTooltip>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" icon size="sm" aria-label="オプション">
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>複製</DropdownMenuItem>
            <DropdownMenuItem>リンクをコピー</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <HoverTooltip content="閉じる" side="top">
          <Button variant="ghost" icon size="sm" aria-label="閉じる" className="ml-1">
            <X className="size-5" />
          </Button>
        </HoverTooltip>
      </div>
    </div>
  );
}

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
// インタラクティブラッパー（useStateでフォーム操作可能にする）
// ---------------------------------------------------------------------------

function PlanFormStory({
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
      <EditHeader />
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
          onAutoSave={() => {}}
          onScheduleDateChange={setScheduleDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onReminderChange={setReminderMinutes}
          onTagChange={setTagId}
          onRepeatTypeChange={() => {}}
          onRecurrenceRuleChange={() => {}}
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

/** Plan新規作成（空フォーム）。ドラフトモードヘッダー + 空入力フィールド。 */
export const PlanCreate: Story = {
  render: () => (
    <PlanFormStory
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
    <PlanFormStory
      plan={{
        ...basePlan,
        id: '__draft__',
        title: 'チームミーティング',
        description: '<p>週次の進捗確認</p>',
      }}
      initialTagId="tag-1"
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialReminderMinutes={15}
    />
  ),
};

/** 既存Plan編集（open status）。ナビゲーション付きヘッダー + 完了ボタン。 */
export const PlanEdit: Story = {
  render: () => (
    <PlanFormStory
      plan={filledPlan}
      initialTagId="tag-1"
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialReminderMinutes={15}
    />
  ),
};

/** 完了済みPlan。「未完了に戻す」ボタンが表示される。 */
export const PlanEditCompleted: Story = {
  render: () => (
    <PlanFormStory
      plan={completedPlan}
      initialTagId="tag-1"
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialReminderMinutes={15}
    />
  ),
};

/** 時間重複エラー状態。ScheduleRowの時間フィールドが赤くハイライト。 */
export const TimeConflict: Story = {
  render: () => (
    <PlanFormStory
      plan={filledPlan}
      initialTagId="tag-1"
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      timeConflictError
    />
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <PlanFormStory
        plan={{ ...basePlan, id: '__draft__' }}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
      />
      <PlanFormStory
        plan={{
          ...basePlan,
          id: '__draft__',
          title: 'チームミーティング',
          description: '<p>週次の進捗確認</p>',
        }}
        initialTagId="tag-1"
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialReminderMinutes={15}
      />
      <PlanFormStory
        plan={filledPlan}
        initialTagId="tag-1"
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialReminderMinutes={15}
      />
      <PlanFormStory
        plan={completedPlan}
        initialTagId="tag-1"
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialReminderMinutes={15}
      />
      <PlanFormStory
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
