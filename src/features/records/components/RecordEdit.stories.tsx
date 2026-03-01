import type { Meta, StoryObj } from '@storybook/react-vite';
import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { TagsIconButton } from '@/components/inspector';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import {
  FulfillmentButton,
  InspectorHeader,
  NoteIconButton,
  ScheduleRow,
  TitleInput,
} from '@/core/components/inspector';
import {
  InspectorFrame,
  MockPlanLinkButton,
  mockTags,
} from '@/core/components/inspector/story-helpers';

import type { FulfillmentScore } from '../types/record';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/** Record編集画面。InspectorHeader・メニュー・Record固有ウィジェットを含む完全な編集体験。 */
const meta = {
  title: 'Features/Records/RecordEdit',
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

const noop = () => {};

/** Recordメニューコンテンツ（削除のみ） */
const recordMenuContent = (
  <>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={noop} className="text-destructive focus:text-destructive">
      <Trash2 className="mr-2 size-4" />
      削除
    </DropdownMenuItem>
  </>
);

// ---------------------------------------------------------------------------
// インタラクティブラッパー
// ---------------------------------------------------------------------------

function RecordEditStory({
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
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [tagIds, setTagIds] = useState(initialTagIds);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(initialScheduleDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [note, setNote] = useState(initialNote);
  const [score, setScore] = useState<FulfillmentScore | null>(initialScore);

  return (
    <InspectorFrame>
      <InspectorHeader
        hasPrevious
        hasNext
        onClose={noop}
        onPrevious={noop}
        onNext={noop}
        menuContent={recordMenuContent}
      />
      <div>
        {/* Row 1: タイトル */}
        <div className="px-4 pt-4 pb-2">
          <TitleInput
            ref={titleRef}
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
          <NoteIconButton id="record-edit-story" note={note} onNoteChange={setNote} />
        </div>
      </div>
    </InspectorFrame>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 既存Record編集。InspectorHeader（ナビゲーション + メニュー）付き。 */
export const Edit: Story = {
  render: () => (
    <RecordEditStory
      initialTitle="開発作業"
      initialTagIds={['tag-1']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="09:00"
      initialEndTime="12:00"
      initialNote="<p>React コンポーネントのリファクタリング</p>"
    />
  ),
};

/** フル入力済みRecord。Plan紐付け + 全タグ + 充実度 + メモ。 */
export const EditWithPlan: Story = {
  render: () => (
    <RecordEditStory
      initialTitle="開発作業"
      initialTagIds={['tag-1', 'tag-2', 'tag-3']}
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="09:00"
      initialEndTime="12:00"
      initialNote="<p>React コンポーネントのリファクタリング完了。テスト追加。</p>"
      initialPlanName="Sprint 3 開発"
      initialScore={3}
    />
  ),
};

/** 時間重複エラー。ScheduleRowの時間フィールドが赤くハイライト。 */
export const TimeConflict: Story = {
  render: () => (
    <RecordEditStory
      initialTitle="開発作業"
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

/** 空状態。Recordが見つからない場合の表示。 */
export const Empty: Story = {
  render: () => (
    <InspectorFrame>
      <InspectorHeader onClose={noop} />
      <div className="flex h-48 items-center justify-center">
        <p className="text-muted-foreground">Recordが見つかりません</p>
      </div>
    </InspectorFrame>
  ),
};

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <RecordEditStory
        initialTitle="開発作業"
        initialTagIds={['tag-1']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="09:00"
        initialEndTime="12:00"
        initialNote="<p>React コンポーネントのリファクタリング</p>"
      />
      <RecordEditStory
        initialTitle="開発作業"
        initialTagIds={['tag-1', 'tag-2', 'tag-3']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="09:00"
        initialEndTime="12:00"
        initialNote="<p>React コンポーネントのリファクタリング完了。テスト追加。</p>"
        initialPlanName="Sprint 3 開発"
        initialScore={3}
      />
      <RecordEditStory
        initialTitle="開発作業"
        initialTagIds={['tag-1']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
        timeConflictError
      />
    </div>
  ),
};
