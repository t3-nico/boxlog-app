'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown, ChevronUp, MoreHorizontal, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { Tag } from '@/features/tags/types';

import type { Plan } from '../../types/plan';
import { PlanInspectorDetailsTab } from './PlanInspectorContent/PlanInspectorDetailsTab';

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

const filledPlan: Plan = {
  ...basePlan,
  title: 'チームミーティング',
  description: '<p>週次の進捗確認。アジェンダを事前に共有すること。</p>',
  start_time: '2024-01-15T10:00:00+09:00',
  end_time: '2024-01-15T11:00:00+09:00',
  due_date: '2024-01-15',
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

/** ドラフトモードフッター（キャンセル + 作成ボタン） */
function DraftFooter() {
  return (
    <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
      <Button variant="ghost">キャンセル</Button>
      <Button>Plan 作成</Button>
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
  isDraftMode = false,
  initialTagIds = [],
  initialScheduleDate,
  initialStartTime = '',
  initialEndTime = '',
  initialDueDate,
  initialReminderType = 'none',
  timeConflictError = false,
}: {
  plan: Plan;
  isDraftMode?: boolean;
  initialTagIds?: string[];
  initialScheduleDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  initialDueDate?: Date;
  initialReminderType?: string;
  timeConflictError?: boolean;
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
      {isDraftMode ? <DraftHeader /> : <EditHeader />}
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
          timeConflictError={timeConflictError}
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
          isDraftMode={isDraftMode}
          availableTags={mockTags}
        />
      </div>
      {isDraftMode ? <DraftFooter /> : <EditFooter status={plan.status} />}
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
      isDraftMode
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
      isDraftMode
      initialTagIds={['tag-1', 'tag-2']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialDueDate={new Date('2024-01-15')}
      initialReminderType="15min"
    />
  ),
};

/** 既存Plan編集（open status）。ナビゲーション付きヘッダー + 完了ボタン。 */
export const PlanEdit: Story = {
  render: () => (
    <PlanFormStory
      plan={filledPlan}
      initialTagIds={['tag-1']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialDueDate={new Date('2024-01-15')}
      initialReminderType="15min"
    />
  ),
};

/** 完了済みPlan。「未完了に戻す」ボタンが表示される。 */
export const PlanEditCompleted: Story = {
  render: () => (
    <PlanFormStory
      plan={completedPlan}
      initialTagIds={['tag-1', 'tag-2']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
      initialDueDate={new Date('2024-01-15')}
      initialReminderType="15min"
    />
  ),
};

/** 時間重複エラー状態。ScheduleRowの時間フィールドが赤くハイライト。 */
export const TimeConflict: Story = {
  render: () => (
    <PlanFormStory
      plan={filledPlan}
      initialTagIds={['tag-1']}
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
        isDraftMode
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
        isDraftMode
        initialTagIds={['tag-1', 'tag-2']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialDueDate={new Date('2024-01-15')}
        initialReminderType="15min"
      />
      <PlanFormStory
        plan={filledPlan}
        initialTagIds={['tag-1']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialDueDate={new Date('2024-01-15')}
        initialReminderType="15min"
      />
      <PlanFormStory
        plan={completedPlan}
        initialTagIds={['tag-1', 'tag-2']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        initialDueDate={new Date('2024-01-15')}
        initialReminderType="15min"
      />
      <PlanFormStory
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
