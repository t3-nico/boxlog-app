import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, ChevronDown, MoreHorizontal, Plus, Repeat } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { EntryOrigin, FulfillmentScore } from '@/core/types/entry';
import type { EntryState } from '@/lib/entry-status';
import { cn } from '@/lib/utils';

import { InspectorDetailsLayout } from './InspectorDetailsLayout';
import { InspectorTimeSection } from './InspectorTimeSection';
import { InspectorFrame, MobileInspectorFrame } from './story-helpers';

/**
 * Entry Inspector — 3パターンの表示確認
 *
 * entries統合後の Inspector 完成形。
 * `entryState`（upcoming / active / past）と `origin`（planned / unplanned）の
 * 組み合わせで UI が切り替わる。
 *
 * ## 3パターン
 *
 * | パターン | 予定行 | 記録行 | 期間 | 繰り返し/通知 | 充実度 | メモ |
 * |----------|--------|--------|------|--------------|--------|------|
 * | **Upcoming + Planned** | 編集可 | placeholder | 編集可 | ○ | × (Hide) | ○ |
 * | **Past + Planned** | 編集可 | 編集可 | 編集可 | × (Hide) | ○ | ○ |
 * | **Past + Unplanned** | placeholder | 編集可 | 読取専用 | × (Hide) | ○ | ○ |
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
    <div className="flex items-center justify-between gap-2 px-4 pt-5 pb-0">
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

      <button
        type="button"
        className="text-muted-foreground hover:bg-state-hover flex size-8 items-center justify-center rounded-lg transition-colors"
        aria-label="Options"
      >
        <MoreHorizontal className="size-5" />
      </button>
    </div>
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
  /** trueの場合、モバイルDrawer風フレームで表示 */
  mobile?: boolean;
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
  mobile = false,
}: EntryInspectorStoryProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [plannedStart, setPlannedStart] = useState(initialPlannedStart);
  const [plannedEnd, setPlannedEnd] = useState(initialPlannedEnd);
  const [actualStart, setActualStart] = useState<string | null>(initialActualStart);
  const [actualEnd, setActualEnd] = useState<string | null>(initialActualEnd);
  const [note, setNote] = useState(initialNote);
  const [fulfillment, setFulfillment] = useState<FulfillmentScore | null>(initialFulfillment);
  const t = useTranslations();

  const Frame = mobile ? MobileInspectorFrame : InspectorFrame;

  return (
    <Frame>
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
            fulfillmentScore={fulfillment}
            onFulfillmentChange={setFulfillment}
            note={note}
            onNoteChange={setNote}
            notePlaceholder={t('plan.inspector.note.placeholder')}
            recurrenceRow={
              entryState === 'upcoming' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="text-muted-foreground size-4 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      {t('common.recurrence.label')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:bg-state-hover flex h-8 items-center gap-1 rounded-lg px-2 text-sm transition-colors"
                  >
                    {t('common.recurrence.none')}
                  </button>
                </div>
              ) : undefined
            }
            reminderRow={
              entryState === 'upcoming' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="text-muted-foreground size-4 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      {t('common.reminder.label')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:bg-state-hover flex h-8 items-center gap-1 rounded-lg px-2 text-sm transition-colors"
                  >
                    {t('common.reminder.none')}
                  </button>
                </div>
              ) : undefined
            }
          />
        }
        options={null}
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────

/**
 * ## Upcoming + Planned
 *
 * 未来の予定エントリ。計画の編集がメイン操作。
 * - 予定行: 編集可能 | 記録行: placeholder
 * - 期間: 編集可 | 繰り返し/通知: ○ | 充実度: × (Hide) | メモ: ○
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
 * 完了した予定エントリ。振り返りがメイン操作。
 * - 予定行: 編集可 | 記録行: 編集可
 * - 期間: 編集可 | 繰り返し/通知: × (Hide) | 充実度: ○ | メモ: ○
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
 * 直接記録されたエントリ（予定なし）。記録のみがメイン操作。
 * - 予定行: placeholder | 記録行: 編集可
 * - 期間: 読取専用 | 繰り返し/通知: × (Hide) | 充実度: ○ | メモ: ○
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

/**
 * ## Mobile Drawer
 *
 * モバイルではボトムシート（Drawer）として表示。
 * ドラッグハンドル + メニューボタンが上部に追加される。
 * viewport addon で iframe がリサイズされ、useMediaQuery が反応して自動切替。
 */
export const MobileDrawer: Story = {
  render: () => (
    <EntryInspectorStory
      entryState="upcoming"
      origin="planned"
      tagName="Work"
      tagDotClass="bg-blue-500"
      initialPlannedStart="14:00"
      initialPlannedEnd="15:30"
      initialNote="Prepare slides for the meeting"
      mobile
    />
  ),
  globals: {
    viewport: { value: 'mobile1' },
  },
};
