import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderOpen, Smile, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverTooltip } from '@/components/ui/tooltip';
import {
  NoteIconButton,
  ScheduleRow,
  TagsIconButton,
  TitleInput,
} from '@/features/plans/components/inspector/shared';
import { cn } from '@/lib/utils';

import type { Tag } from '@/features/tags/types';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

/** Record新規作成画面。ドラフトモードの全パターン。 */
const meta = {
  title: 'Features/Records/RecordCreate',
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

/** Plan紐付けボタン（静的表示） */
function PlanLinkButton({ planName }: { planName?: string | undefined }) {
  const hasPlan = !!planName;

  return (
    <HoverTooltip content={planName ?? 'Planに紐付け'} side="top">
      <div
        className={cn(
          'hover:bg-state-hover flex h-8 items-center rounded-lg transition-colors',
          hasPlan ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <button
          type="button"
          className="focus-visible:ring-ring flex items-center gap-1 px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Planに紐付け"
        >
          <FolderOpen className="size-4" />
          {hasPlan && <span className="max-w-20 truncate text-xs">{planName}</span>}
        </button>
        {hasPlan && (
          <button
            type="button"
            className="hover:bg-state-hover mr-1 rounded p-1 transition-colors"
            aria-label="Plan紐付けを解除"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </HoverTooltip>
  );
}

/** 充実度ボタン（インタラクティブ） */
function FulfillmentButton({ initialScore = null }: { initialScore?: number | null }) {
  const [score, setScore] = useState<number | null>(initialScore);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const isPressingRef = useRef(false);
  const hasScore = score !== null && score > 0;

  const handlePressStart = useCallback(() => {
    isPressingRef.current = true;
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setScore(null);
    }, 500);
  }, []);

  const handlePressEnd = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (!isPressingRef.current) return;
    isPressingRef.current = false;
    if (!isLongPressRef.current) {
      setScore((prev) => Math.min((prev ?? 0) + 1, 5));
    }
  }, []);

  return (
    <HoverTooltip
      content={hasScore ? `充実度: ${score}/5（長押しでリセット）` : '充実度（タップで加算）'}
      side="top"
    >
      <button
        type="button"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        className={cn(
          'flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
          'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          'select-none',
          hasScore ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label={`充実度: ${score ?? 0}/5`}
      >
        <Smile className="size-4" />
        {hasScore && <span className="text-xs font-bold tabular-nums">{score}</span>}
      </button>
    </HoverTooltip>
  );
}

// ---------------------------------------------------------------------------
// インタラクティブラッパー
// ---------------------------------------------------------------------------

function RecordCreateStory({
  initialTitle = '',
  initialTagIds = [],
  initialScheduleDate,
  initialStartTime = '',
  initialEndTime = '',
  initialNote = '',
  initialPlanName,
  initialScore = null,
}: {
  initialTitle?: string;
  initialTagIds?: string[];
  initialScheduleDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  initialNote?: string;
  initialPlanName?: string;
  initialScore?: number | null;
}) {
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [tagIds, setTagIds] = useState(initialTagIds);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(initialScheduleDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [note, setNote] = useState(initialNote);

  return (
    <InspectorFrame>
      <DraftHeader />
      <div>
        {/* Row 1: タイトル */}
        <div className="px-4 pt-4 pb-2">
          <TitleInput
            ref={titleRef}
            value={title}
            onChange={setTitle}
            placeholder="何をした？"
            className="pl-2"
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
          timeConflictError={false}
        />

        {/* Row 3: Tags + Plan紐付け + 充実度 + メモ */}
        <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">
          <TagsIconButton
            tagIds={tagIds}
            onTagsChange={setTagIds}
            popoverSide="bottom"
            availableTags={mockTags}
          />
          <PlanLinkButton {...(initialPlanName ? { planName: initialPlanName } : {})} />
          <FulfillmentButton initialScore={initialScore} />
          <NoteIconButton id="record-create-story" note={note} onNoteChange={setNote} />
        </div>
      </div>

      {/* フッター */}
      <div className="flex shrink-0 justify-end gap-2 px-4 py-4">
        <Button variant="ghost">キャンセル</Button>
        <Button>Record 作成</Button>
      </div>
    </InspectorFrame>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Record新規作成（空フォーム）。ドラフトモードヘッダー + 空入力フィールド。 */
export const RecordCreate: Story = {
  render: () => (
    <RecordCreateStory
      initialScheduleDate={new Date('2024-01-15')}
      initialStartTime="10:00"
      initialEndTime="11:00"
    />
  ),
};

/** Record新規作成（入力済み）。タイトル・時間・タグ・Plan紐付け・スコア入力済み。 */
export const RecordCreateFilled: Story = {
  render: () => (
    <RecordCreateStory
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

/** 全パターン一覧。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <RecordCreateStory
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="10:00"
        initialEndTime="11:00"
      />
      <RecordCreateStory
        initialTitle="開発作業"
        initialTagIds={['tag-1', 'tag-2']}
        initialScheduleDate={new Date('2024-01-15')}
        initialStartTime="09:00"
        initialEndTime="12:00"
        initialNote="<p>React コンポーネントのリファクタリング</p>"
        initialPlanName="チームミーティング"
        initialScore={3}
      />
    </div>
  ),
};
