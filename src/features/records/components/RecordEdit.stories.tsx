import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderOpen, Smile, Trash2, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { HoverTooltip } from '@/components/ui/tooltip';
import {
  InspectorHeader,
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

const noop = () => {};

/** Inspector風コンテナ */
function InspectorFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border-border w-[400px] overflow-hidden rounded-xl border shadow-lg">
      {children}
    </div>
  );
}

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
  initialScore?: number | null;
  timeConflictError?: boolean;
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
          <PlanLinkButton {...(initialPlanName ? { planName: initialPlanName } : {})} />
          <FulfillmentButton initialScore={initialScore} />
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
      initialScore={4}
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
        initialScore={4}
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
