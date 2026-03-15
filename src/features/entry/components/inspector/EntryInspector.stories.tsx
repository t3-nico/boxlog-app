import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Bell, ChevronDown, Plus, Repeat, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { expect, within } from 'storybook/test';

import { cn } from '@/lib/utils';
import type { EntryState, FulfillmentScore } from '../../types/entry';

import { InspectorDetailsLayout } from './InspectorDetailsLayout';
import { InspectorShell } from './InspectorShell';
import { InspectorTimeSection } from './InspectorTimeSection';
import { InspectorFrame } from './story-helpers';

/**
 * Entry Inspector — 2パターンの表示確認
 *
 * entries統合後の Inspector 完成形。
 * `entryState`（upcoming / active / past）で UI が切り替わる。
 *
 * ## 2パターン
 *
 * | パターン | 予定行 | 記録行 | 日付 | 繰り返し/通知 | 充実度 |
 * |----------|--------|--------|------|--------------|--------|
 * | **Upcoming/Active** | 編集可 | 編集可 | 編集可 | ○ | × (Hide) |
 * | **Past** | 非表示 | 編集可 | 非表示 | × (Hide) | ○ |
 *
 * ## レスポンシブ
 *
 * 実際の `InspectorShell` を使用。viewport addon で iframe がリサイズされると
 * `useMediaQuery` が反応し、自動的に PC（DraggableInspector）/ モバイル（Drawer）が切り替わる。
 */
const meta = {
  title: 'Features/Entry/Inspector/EntryInspector',
  parameters: {
    layout: 'fullscreen',
    // button-name / color-contrast / aria-progressbar-name: internal inspector components
    a11y: { test: 'todo' },
  },
  tags: ['autodocs', 'critical'],
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
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        className="hover:bg-state-hover -mt-1 -ml-1.5 flex items-center gap-2 rounded-lg py-1 pr-2 pl-1.5 text-base font-semibold transition-colors"
        aria-label={tagName ? `Tag: ${tagName}` : 'Add tag'}
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

      <button
        type="button"
        className="text-muted-foreground hover:bg-state-hover -mr-2 flex size-8 items-center justify-center rounded-lg transition-colors"
        aria-label="Delete"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Shared content（InspectorShell / InspectorFrame 共用）
// ─────────────────────────────────────────────────────────

interface InspectorContentProps {
  entryState: EntryState;
  tagName?: string;
  tagDotClass?: string;
  initialPlannedStart?: string;
  initialPlannedEnd?: string;
  initialActualStart?: string | null;
  initialActualEnd?: string | null;
  initialNote?: string;
  initialFulfillment?: FulfillmentScore | null;
}

function InspectorContent({
  entryState,
  tagName,
  tagDotClass,
  initialPlannedStart = '10:00',
  initialPlannedEnd = '11:30',
  initialActualStart = null,
  initialActualEnd = null,
  initialNote = '',
  initialFulfillment = null,
}: InspectorContentProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [plannedStart, setPlannedStart] = useState(initialPlannedStart);
  const [plannedEnd, setPlannedEnd] = useState(initialPlannedEnd);
  const [actualStart, setActualStart] = useState<string | null>(initialActualStart);
  const [actualEnd, setActualEnd] = useState<string | null>(initialActualEnd);
  const [note, setNote] = useState(initialNote);
  const [fulfillment, setFulfillment] = useState<FulfillmentScore | null>(initialFulfillment);
  const t = useTranslations();

  const isPast = entryState === 'past';

  return (
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
          fulfillmentScore={entryState !== 'upcoming' ? fulfillment : undefined}
          onFulfillmentChange={entryState !== 'upcoming' ? setFulfillment : undefined}
          note={note}
          onNoteChange={setNote}
          notePlaceholder={t('plan.inspector.note.placeholder')}
          recurrenceRow={
            !isPast ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="text-muted-foreground size-4 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">
                    {t('common.recurrence.label')}
                  </span>
                </div>
                <div className="-mr-2">
                  <button
                    type="button"
                    className="text-muted-foreground hover:bg-state-hover inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm transition-colors"
                    aria-label="Set recurrence"
                  >
                    {t('common.recurrence.none')}
                  </button>
                </div>
              </div>
            ) : undefined
          }
          reminderRow={
            !isPast ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="text-muted-foreground size-4 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">
                    {t('common.reminder.label')}
                  </span>
                </div>
                <div className="-mr-2">
                  <button
                    type="button"
                    className="text-muted-foreground hover:bg-state-hover inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm transition-colors"
                    aria-label="Add reminder"
                  >
                    {t('common.reminder.add')}
                  </button>
                </div>
              </div>
            ) : undefined
          }
        />
      }
      options={null}
    />
  );
}

// ─────────────────────────────────────────────────────────
// Interactive Wrapper（実際の InspectorShell を使用）
// ─────────────────────────────────────────────────────────

function EntryInspectorStory(props: InspectorContentProps) {
  return (
    <InspectorShell isOpen onClose={() => {}} title="Entry Inspector">
      <InspectorContent {...props} />
    </InspectorShell>
  );
}

// ─────────────────────────────────────────────────────────
// Static Wrapper（AllPatterns 比較用、InspectorFrame 使用）
// ─────────────────────────────────────────────────────────

function StaticEntryInspector(props: InspectorContentProps) {
  return (
    <InspectorFrame>
      <InspectorContent {...props} />
    </InspectorFrame>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/**
 * ## Upcoming
 *
 * 未来の予定エントリ。計画の編集がメイン操作。
 * - 予定行: 編集可 | 記録行: 編集可
 * - 日付: 編集可 | 繰り返し/通知: ○ | 充実度: × (Hide) | メモ: ○
 */
export const Upcoming: Story = {
  render: () => (
    <EntryInspectorStory
      entryState="upcoming"
      tagName="Work"
      tagDotClass="bg-blue-500"
      initialPlannedStart="14:00"
      initialPlannedEnd="15:30"
      initialNote="Prepare slides for the meeting"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verify the inspector renders with the note textarea (placeholder is Japanese)
    const noteTextarea = canvas.getByPlaceholderText('メモを追加...');
    await expect(noteTextarea).toBeInTheDocument();
    await expect(noteTextarea).toHaveValue('Prepare slides for the meeting');
  },
};

/**
 * ## Past
 *
 * 過去のエントリ。記録の編集がメイン操作。
 * - 予定行: 非表示 | 記録行: 編集可
 * - 日付: 非表示 | 繰り返し/通知: × (Hide) | 充実度: ○ | メモ: ○
 */
export const Past: Story = {
  render: () => (
    <EntryInspectorStory
      entryState="past"
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
 * ## All Patterns
 *
 * 2パターンを横並びで比較確認（静的 InspectorFrame 使用）。
 */
export const AllPatterns: Story = {
  parameters: {
    layout: 'centered',
  },
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <div>
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium">Upcoming</p>
        <StaticEntryInspector
          entryState="upcoming"
          tagName="Work"
          tagDotClass="bg-blue-500"
          initialPlannedStart="14:00"
          initialPlannedEnd="15:30"
          initialNote="Prepare slides"
        />
      </div>
      <div>
        <p className="text-muted-foreground mb-3 text-center text-xs font-medium">Past</p>
        <StaticEntryInspector
          entryState="past"
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
    </div>
  ),
};
