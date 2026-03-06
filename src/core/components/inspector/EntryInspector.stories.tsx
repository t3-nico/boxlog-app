import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, ChevronDown, Plus, Repeat } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { EntryOrigin, FulfillmentScore } from '@/core/types/entry';
import type { EntryState } from '@/lib/entry-status';
import { cn } from '@/lib/utils';

import { FulfillmentButton } from './FulfillmentButton';
import { InlineNoteSection } from './InlineNoteSection';
import { InspectorDetailsLayout } from './InspectorDetailsLayout';
import { InspectorTimeSection } from './InspectorTimeSection';
import { InspectorFrame } from './story-helpers';

/**
 * Entry Inspector — 3パターンの表示確認
 *
 * entries統合後の Inspector 完成形。
 * `entryState`（upcoming / active / past）と `origin`（planned / unplanned）の
 * 組み合わせで UI が切り替わる。
 *
 * ## 3パターン
 *
 * | パターン | entryState | origin | 予定行 | 記録行 | 充実度 | 繰り返し/リマインダー |
 * |----------|-----------|--------|--------|--------|--------|----------------------|
 * | **Upcoming + Planned** | upcoming | planned | 編集可 | "Same as planned" | × | ○ |
 * | **Past + Planned** | past | planned | 編集可 | 編集可 + 差分表示 | ○ | × |
 * | **Past + Unplanned** | past | unplanned | プレースホルダー | 編集可 | ○ | × |
 */
const meta = {
  title: 'Recipes/Inspector/EntryInspector',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────────────────
// Mock: タグ行（InspectorTagRow は useTagsMap 依存のためモック）
// ─────────────────────────────────────────────────────────

function MockTagRow({
  tagName,
  dotClass,
}: {
  tagName?: string | undefined;
  dotClass?: string | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-1">
      <button
        type="button"
        className="hover:bg-state-hover -mt-1 -ml-1.5 flex items-center gap-2 rounded-lg py-1 pr-2 pl-1.5 text-base font-semibold transition-colors"
      >
        {tagName ? (
          <>
            <span
              className={cn('inline-block size-2.5 flex-shrink-0 rounded-full', dotClass)}
              aria-hidden
            />
            <span className="text-foreground">{tagName}</span>
            <ChevronDown className="text-muted-foreground size-4 flex-shrink-0" aria-hidden />
          </>
        ) : (
          <>
            <Plus className="text-muted-foreground size-3.5 flex-shrink-0" aria-hidden />
            <span className="text-muted-foreground">Add tag</span>
            <ChevronDown className="text-muted-foreground size-4 flex-shrink-0" aria-hidden />
          </>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Mock: オプションボタン（feature依存のためモック）
// ─────────────────────────────────────────────────────────

function MockRecurrenceButton() {
  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex h-7 items-center gap-1 rounded-md border border-transparent px-2 transition-colors"
    >
      <Repeat className="size-4" />
    </button>
  );
}

function MockReminderButton() {
  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground hover:bg-state-hover flex h-7 items-center gap-1 rounded-md border border-transparent px-2 transition-colors"
    >
      <Bell className="size-4" />
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// Interactive Wrapper
// ─────────────────────────────────────────────────────────

interface EntryInspectorStoryProps {
  entryState: EntryState;
  origin: EntryOrigin;
  tagName?: string;
  tagDotClass?: string;
  initialPlannedStart?: string;
  initialPlannedEnd?: string;
  initialActualStart?: string | null;
  initialActualEnd?: string | null;
  initialNote?: string;
  initialFulfillment?: FulfillmentScore | null;
}

function EntryInspectorStory({
  entryState,
  origin,
  tagName,
  tagDotClass,
  initialPlannedStart = '10:00',
  initialPlannedEnd = '11:30',
  initialActualStart = null,
  initialActualEnd = null,
  initialNote = '',
  initialFulfillment = null,
}: EntryInspectorStoryProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [plannedStart, setPlannedStart] = useState(initialPlannedStart);
  const [plannedEnd, setPlannedEnd] = useState(initialPlannedEnd);
  const [actualStart, setActualStart] = useState<string | null>(initialActualStart);
  const [actualEnd, setActualEnd] = useState<string | null>(initialActualEnd);
  const [note, setNote] = useState(initialNote);
  const [fulfillment, setFulfillment] = useState<FulfillmentScore | null>(initialFulfillment);
  const t = useTranslations();

  const showFulfillment = entryState !== 'upcoming';
  const showRecurrence = entryState === 'upcoming';

  return (
    <InspectorFrame>
      <InspectorDetailsLayout
        tagRow={<MockTagRow tagName={tagName} dotClass={tagDotClass} />}
        schedule={
          <InspectorTimeSection
            selectedDate={date}
            onDateChange={setDate}
            plannedStart={plannedStart}
            plannedEnd={plannedEnd}
            onPlannedStartChange={setPlannedStart}
            onPlannedEndChange={setPlannedEnd}
            actualStart={actualStart}
            actualEnd={actualEnd}
            onActualStartChange={setActualStart}
            onActualEndChange={setActualEnd}
            entryState={entryState}
            origin={origin}
          />
        }
        note={
          <InlineNoteSection
            label={t('plan.inspector.note.label')}
            note={note}
            onNoteChange={setNote}
            placeholder={t('plan.inspector.note.placeholder')}
          />
        }
        options={
          <>
            {showFulfillment && (
              <FulfillmentButton score={fulfillment} onScoreChange={setFulfillment} />
            )}
            {showRecurrence && (
              <>
                <MockRecurrenceButton />
                <MockReminderButton />
              </>
            )}
          </>
        }
      />
    </InspectorFrame>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/**
 * ## Upcoming + Planned
 *
 * 未来の予定エントリ。
 * - 予定行: 編集可能（10:00–11:30）
 * - 記録行: "Same as planned" プレースホルダー
 * - オプション: 繰り返し + リマインダー
 * - 充実度: 非表示
 */
export const UpcomingPlanned: Story = {
  render: () => (
    <EntryInspectorStory
      entryState="upcoming"
      origin="planned"
      tagName="Work"
      tagDotClass="bg-blue-500"
      initialPlannedStart="14:00"
      initialPlannedEnd="15:30"
      initialNote="Prepare slides for the meeting"
    />
  ),
};

/**
 * ## Past + Planned
 *
 * 完了した予定エントリ（予定 vs 記録の差分表示）。
 * - 予定行: 編集可能（10:00–11:30）
 * - 記録行: 編集可能（10:15–12:00）+ 差分表示
 * - オプション: 充実度ボタン
 * - 繰り返し/リマインダー: 非表示
 */
export const PastPlanned: Story = {
  render: () => (
    <EntryInspectorStory
      entryState="past"
      origin="planned"
      tagName="Meeting"
      tagDotClass="bg-purple-500"
      initialPlannedStart="10:00"
      initialPlannedEnd="11:30"
      initialActualStart="10:15"
      initialActualEnd="12:00"
      initialNote="Ran over by 30 minutes"
      initialFulfillment={2}
    />
  ),
};

/**
 * ## Past + Unplanned
 *
 * 直接記録されたエントリ（予定なし）。
 * - 予定行: "No planned time" プレースホルダー
 * - 記録行: 編集可能（13:00–14:00）
 * - オプション: 充実度ボタン
 * - 繰り返し/リマインダー: 非表示
 */
export const PastUnplanned: Story = {
  render: () => (
    <EntryInspectorStory
      entryState="past"
      origin="unplanned"
      tagName="Personal"
      tagDotClass="bg-green-500"
      initialPlannedStart="13:00"
      initialPlannedEnd="14:00"
      initialActualStart="13:00"
      initialActualEnd="14:00"
      initialNote="Spontaneous lunch walk"
      initialFulfillment={3}
    />
  ),
};

/**
 * ## All Patterns
 *
 * 3パターンを横並びで比較確認。
 */
export const AllPatterns: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium">
          Upcoming + Planned
        </p>
        <EntryInspectorStory
          entryState="upcoming"
          origin="planned"
          tagName="Work"
          tagDotClass="bg-blue-500"
          initialPlannedStart="14:00"
          initialPlannedEnd="15:30"
          initialNote="Prepare slides"
        />
      </div>
      <div>
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium">Past + Planned</p>
        <EntryInspectorStory
          entryState="past"
          origin="planned"
          tagName="Meeting"
          tagDotClass="bg-purple-500"
          initialPlannedStart="10:00"
          initialPlannedEnd="11:30"
          initialActualStart="10:15"
          initialActualEnd="12:00"
          initialNote="Ran 30min over"
          initialFulfillment={2}
        />
      </div>
      <div>
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium">
          Past + Unplanned
        </p>
        <EntryInspectorStory
          entryState="past"
          origin="unplanned"
          tagName="Personal"
          tagDotClass="bg-green-500"
          initialPlannedStart="13:00"
          initialPlannedEnd="14:00"
          initialActualStart="13:00"
          initialActualEnd="14:00"
          initialNote="Lunch walk"
          initialFulfillment={3}
        />
      </div>
    </div>
  ),
};
