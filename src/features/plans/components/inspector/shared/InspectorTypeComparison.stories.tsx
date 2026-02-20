'use client';

/**
 * Inspector タイプ区別パターン比較
 *
 * Plan と Record の Inspector が同じ見た目で区別しにくい問題に対し、
 * 複数のパターンを横並びで視覚比較するための Story。
 *
 * - Current: 現状（区別なし）
 * - WithLabel: ヘッダーにテキストラベルのみ
 * - WithBorder: 左ボーダーのみ
 * - WithLabelAndBorder: テキストラベル + 左ボーダー
 * - WithTitleUnderline: タイトル行下に色付き横線
 */

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

import {
  FulfillmentButton,
  NoteIconButton,
  ScheduleRow,
  TagsIconButton,
  TitleInput,
} from './index';
import { InspectorFrame, MockPlanLinkButton, mockTags } from './story-helpers';

import type { FulfillmentScore } from '@/features/records/types/record';
import { RecurrenceIconButton } from '../../shared/RecurrenceIconButton';
import { ReminderSelect } from '../../shared/ReminderSelect';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Features/Inspector/TypeComparison',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘッダー
// ---------------------------------------------------------------------------

function EditHeader({ typeLabel }: { typeLabel?: string | undefined }) {
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
            <Button variant="ghost" icon size="sm" aria-label="次へ">
              <ChevronDown className="size-5" />
            </Button>
          </HoverTooltip>
        </div>
        {typeLabel && (
          <span className="text-muted-foreground ml-1 text-xs font-medium">{typeLabel}</span>
        )}
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
// 共通 props 型
// ---------------------------------------------------------------------------

interface FormStyleProps {
  typeLabel?: string | undefined;
  variant?: 'plan' | 'record' | undefined;
  /** タイトル行下に色付き横線 */
  titleUnderline?: 'plan' | 'record' | undefined;
}

// ---------------------------------------------------------------------------
// Plan フォーム（手動レイアウト — タイトル横線を正確に配置するため）
// ---------------------------------------------------------------------------

function PlanForm({ typeLabel, variant, titleUnderline }: FormStyleProps) {
  const [tagIds, setTagIds] = useState(['tag-1']);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date('2024-01-15'));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(15);

  return (
    <InspectorFrame variant={variant}>
      <EditHeader typeLabel={typeLabel} />
      <div>
        {/* Row 1: タイトル */}
        <div
          className={cn(
            'px-4 pt-4 pb-2',
            titleUnderline === 'plan' && 'border-b-plan-border border-b-2',
            titleUnderline === 'record' && 'border-b-record-border border-b-2',
          )}
        >
          <TitleInput
            value="チームミーティング"
            onChange={() => {}}
            placeholder="タイトルを追加"
            aria-label="プランタイトル"
          />
        </div>

        {/* Row 2: スケジュール */}
        <ScheduleRow
          selectedDate={scheduleDate}
          startTime={startTime}
          endTime={endTime}
          onDateChange={setScheduleDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />

        {/* Row 3: オプション（Plan固有: Records, Recurrence, Reminder） */}
        <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">
          <TagsIconButton
            tagIds={tagIds}
            onTagsChange={setTagIds}
            popoverSide="bottom"
            availableTags={mockTags}
          />
          <NoteIconButton id="plan-compare" note="<p>週次の進捗確認</p>" onNoteChange={() => {}} />
          <RecurrenceIconButton
            recurrenceRule={null}
            recurrenceType={null}
            onRepeatTypeChange={() => {}}
            onRecurrenceRuleChange={() => {}}
          />
          <ReminderSelect value={reminderMinutes} onChange={setReminderMinutes} variant="icon" />
        </div>
      </div>
    </InspectorFrame>
  );
}

// ---------------------------------------------------------------------------
// Record フォーム
// ---------------------------------------------------------------------------

function RecordForm({ typeLabel, variant, titleUnderline }: FormStyleProps) {
  const [tagIds, setTagIds] = useState(['tag-1']);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date('2024-01-15'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [score, setScore] = useState<FulfillmentScore | null>(3);

  return (
    <InspectorFrame variant={variant}>
      <EditHeader typeLabel={typeLabel} />
      <div>
        {/* Row 1: タイトル */}
        <div
          className={cn(
            'px-4 pt-4 pb-2',
            titleUnderline === 'plan' && 'border-b-plan-border border-b-2',
            titleUnderline === 'record' && 'border-b-record-border border-b-2',
          )}
        >
          <TitleInput
            value="開発作業"
            onChange={() => {}}
            placeholder="何をした？"
            aria-label="記録タイトル"
          />
        </div>

        {/* Row 2: スケジュール */}
        <ScheduleRow
          selectedDate={scheduleDate}
          startTime={startTime}
          endTime={endTime}
          onDateChange={setScheduleDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />

        {/* Row 3: オプション（Record固有: Plan紐付け, 充実度） */}
        <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">
          <TagsIconButton
            tagIds={tagIds}
            onTagsChange={setTagIds}
            popoverSide="bottom"
            availableTags={mockTags}
          />
          <MockPlanLinkButton planName="チームミーティング" />
          <FulfillmentButton score={score} onScoreChange={setScore} />
          <NoteIconButton id="record-compare" note="" onNoteChange={() => {}} />
        </div>
      </div>
    </InspectorFrame>
  );
}

// ---------------------------------------------------------------------------
// 比較レイアウト
// ---------------------------------------------------------------------------

function ComparisonRow({
  label,
  typeLabel,
  variant,
  titleUnderline,
}: {
  label: string;
  typeLabel?: { plan: string; record: string } | undefined;
  variant?: boolean | undefined;
  titleUnderline?: boolean | undefined;
}) {
  return (
    <div>
      <h3 className="text-foreground mb-3 text-sm font-bold">{label}</h3>
      <div className="flex gap-6">
        <div>
          <p className="text-muted-foreground mb-2 text-xs">Plan Edit</p>
          <PlanForm
            typeLabel={typeLabel?.plan}
            variant={variant ? 'plan' : undefined}
            titleUnderline={titleUnderline ? 'plan' : undefined}
          />
        </div>
        <div>
          <p className="text-muted-foreground mb-2 text-xs">Record Edit</p>
          <RecordForm
            typeLabel={typeLabel?.record}
            variant={variant ? 'record' : undefined}
            titleUnderline={titleUnderline ? 'record' : undefined}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 現状（区別なし）。Plan と Record が同じ見た目。 */
export const Current: Story = {
  render: () => <ComparisonRow label="Current — 区別なし" />,
};

/** ヘッダーにテキストラベルのみ。 */
export const WithLabel: Story = {
  render: () => (
    <ComparisonRow
      label="Pattern A — テキストラベル"
      typeLabel={{ plan: 'Plan', record: 'Record' }}
    />
  ),
};

/** 左ボーダーのみ。 */
export const WithBorder: Story = {
  render: () => <ComparisonRow label="Pattern C — 左ボーダー" variant />,
};

/** テキストラベル + 左ボーダー。 */
export const WithLabelAndBorder: Story = {
  render: () => (
    <ComparisonRow
      label="Pattern A+C — テキストラベル + 左ボーダー"
      typeLabel={{ plan: 'Plan', record: 'Record' }}
      variant
    />
  ),
};

/** タイトル行下に色付き横線のみ。 */
export const WithTitleUnderline: Story = {
  render: () => <ComparisonRow label="Pattern D — タイトル横線" titleUnderline />,
};

/** タイトル横線 + テキストラベル。 */
export const WithTitleUnderlineAndLabel: Story = {
  render: () => (
    <ComparisonRow
      label="Pattern A+D — テキストラベル + タイトル横線"
      typeLabel={{ plan: 'Plan', record: 'Record' }}
      titleUnderline
    />
  ),
};

/** 全パターン比較。 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-col gap-12">
      <ComparisonRow label="1. Current — 区別なし" />
      <ComparisonRow
        label="2. Pattern A — テキストラベルのみ"
        typeLabel={{ plan: 'Plan', record: 'Record' }}
      />
      <ComparisonRow label="3. Pattern C — 左ボーダーのみ" variant />
      <ComparisonRow
        label="4. Pattern A+C — テキストラベル + 左ボーダー"
        typeLabel={{ plan: 'Plan', record: 'Record' }}
        variant
      />
      <ComparisonRow label="5. Pattern D — タイトル横線" titleUnderline />
      <ComparisonRow
        label="6. Pattern A+D — テキストラベル + タイトル横線"
        typeLabel={{ plan: 'Plan', record: 'Record' }}
        titleUnderline
      />
    </div>
  ),
};
