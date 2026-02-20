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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverTooltip } from '@/components/ui/tooltip';
import {
  FulfillmentButton,
  NoteIconButton,
  ScheduleRow,
  TagsIconButton,
  TitleInput,
} from '@/features/plans/components/inspector/shared';
import {
  InspectorFrame,
  MockPlanLinkButton,
  mockTags,
} from '@/features/plans/components/inspector/shared/story-helpers';
import { cn } from '@/lib/utils';

import type { FulfillmentScore } from '@/features/records/types/record';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/** Record Inspector のフォーム画面。新規作成・編集の全パターン。 */
const meta = {
  title: 'Features/Records/RecordForm',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパーコンポーネント
// ---------------------------------------------------------------------------

/** ドラフトモードヘッダー（Record タブがアクティブ） */
function DraftHeader() {
  return (
    <div className="bg-card relative flex shrink-0 items-center px-4 pt-4 pb-2">
      <Tabs value="record" className="relative z-10">
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

/** 編集モードヘッダー */
function EditHeader() {
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
            <Button variant="ghost" icon size="sm" disabled aria-label="前へ">
              <ChevronUp className="size-5" />
            </Button>
          </HoverTooltip>
          <HoverTooltip content="次へ" side="top">
            <Button variant="ghost" icon size="sm" disabled aria-label="次へ">
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

// ---------------------------------------------------------------------------
// インタラクティブラッパー
// ---------------------------------------------------------------------------

function RecordFormStory({
  isDraftMode = false,
  initialTitle = '',
  initialTagIds = [],
  initialScheduleDate,
  initialStartTime = '',
  initialEndTime = '',
  initialNote = '',
  initialPlanName,
  initialScore = null,
  timeConflictError = false,
}: {
  isDraftMode?: boolean;
  initialTitle?: string;
  initialTagIds?: string[];
  initialScheduleDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  initialNote?: string;
  initialPlanName?: string;
  initialScore?: FulfillmentScore | null;
  timeConflictError?: boolean;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [tagIds, setTagIds] = useState(initialTagIds);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(initialScheduleDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [note, setNote] = useState(initialNote);
  const [score, setScore] = useState<FulfillmentScore | null>(initialScore);

  return (
    <InspectorFrame>
      {isDraftMode ? <DraftHeader /> : <EditHeader />}
      <div>
        {/* Row 1: タイトル */}
        <div className="px-4 pt-4 pb-2">
          <TitleInput
            value={title}
            onChange={setTitle}
            placeholder="何をした？"
            aria-label="記録タイトル"
          />
        </div>

        {/* Row 2: 日付 + 時間 */}
        <ScheduleRow
          selectedDate={scheduleDate}
          startTime={startTime}
          endTime={endTime}
          onDateChange={setScheduleDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          timeConflictError={timeConflictError}
        />

        {/* Row 3: Tags + Plan紐付け + 充実度 + メモ */}
        <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">
          <TagsIconButton
            tagIds={tagIds}
            onTagsChange={setTagIds}
            popoverSide="bottom"
            availableTags={mockTags}
          />
          <MockPlanLinkButton {...(initialPlanName ? { planName: initialPlanName } : {})} />
          <FulfillmentButton score={score} onScoreChange={setScore} />
          <NoteIconButton id="record-story" note={note} onNoteChange={setNote} />
        </div>
      </div>

      {/* フッター */}
      {isDraftMode && (
        <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
          <Button variant="ghost">キャンセル</Button>
          <Button>Record 作成</Button>
        </div>
      )}
    </InspectorFrame>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Record新規作成（空フォーム）。ドラフトモードヘッダー + 空入力フィールド。 */
export const RecordCreate: Story = {
  render: () => (
    <RecordFormStory
      isDraftMode
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
    />
  ),
};

/** Record新規作成（入力済み）。タイトル・時間・タグ・Plan紐付け・スコア入力済み。 */
export const RecordCreateFilled: Story = {
  render: () => (
    <RecordFormStory
      isDraftMode
      initialTitle="開発作業"
      initialTagIds={['tag-1', 'tag-2']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="09:00"
      initialEndTime="12:00"
      initialNote="<p>React コンポーネントのリファクタリング</p>"
      initialPlanName="チームミーティング"
      initialScore={3}
    />
  ),
};

/** 既存Record編集。ナビゲーション付きヘッダー + メニュー。 */
export const RecordEdit: Story = {
  render: () => (
    <RecordFormStory
      initialTitle="開発作業"
      initialTagIds={['tag-1']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="09:00"
      initialEndTime="12:00"
      initialNote="<p>React コンポーネントのリファクタリング</p>"
    />
  ),
};

/** フル入力済みRecord。Plan紐付け + タグ + 充実度 + メモ。 */
export const RecordEditWithPlan: Story = {
  render: () => (
    <RecordFormStory
      initialTitle="開発作業"
      initialTagIds={['tag-1', 'tag-2', 'tag-3']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="09:00"
      initialEndTime="12:00"
      initialNote="<p>React コンポーネントのリファクタリング完了。テスト追加。</p>"
      initialPlanName="Sprint 3 開発"
      initialScore={4}
    />
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <RecordFormStory
        isDraftMode
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
      />
      <RecordFormStory
        isDraftMode
        initialTitle="開発作業"
        initialTagIds={['tag-1', 'tag-2']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="09:00"
        initialEndTime="12:00"
        initialNote="<p>React コンポーネントのリファクタリング</p>"
        initialPlanName="チームミーティング"
        initialScore={3}
      />
      <RecordFormStory
        initialTitle="開発作業"
        initialTagIds={['tag-1']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="09:00"
        initialEndTime="12:00"
        initialNote="<p>React コンポーネントのリファクタリング</p>"
      />
      <RecordFormStory
        initialTitle="開発作業"
        initialTagIds={['tag-1', 'tag-2', 'tag-3']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="09:00"
        initialEndTime="12:00"
        initialNote="<p>React コンポーネントのリファクタリング完了。テスト追加。</p>"
        initialPlanName="Sprint 3 開発"
        initialScore={4}
      />
    </div>
  ),
};
