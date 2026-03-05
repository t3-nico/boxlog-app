'use client';

/**
 * Inspector の詳細タブ — 3パターン対応
 *
 * Row 0: タグ（カラードット + タグ名）+ origin バッジ（past のみ）
 * Row 1: 予定/記録 時間比較セクション
 * Row 2: オプションボタン群
 *
 * 3パターン:
 * 1. upcoming + planned: バッジなし / 予定行 + 「予定と同じ」 / 繰り返し・リマインダー
 * 2. past + planned: 「予定」バッジ / 予定行 + 記録行(diff) / 充実度
 * 3. past + unplanned: 「記録のみ」バッジ / 記録行のみ / 充実度
 */

import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';

import { useTranslations } from 'next-intl';
import {
  FulfillmentButton,
  InlineNoteSection,
  InspectorDetailsLayout,
  InspectorTagRow,
  InspectorTimeSection,
} from '../shared';

import { Badge } from '@/components/ui/badge';
import type {
  EntryOrigin,
  EntryWithTags,
  FulfillmentScore,
  RecurrenceType,
} from '@/core/types/entry';
import type { Tag } from '@/core/types/tag';
import type { EntryState } from '@/lib/entry-status';

import { RecurrenceIconButton } from '../../shared/RecurrenceIconButton';
import { ReminderSelect } from '../../shared/ReminderSelect';

interface PlanInspectorDetailsTabProps {
  plan: EntryWithTags;
  /** ⋯ メニューの内容（InspectorTagRow に伝搬） */
  menuContent?: ReactNode;
  scheduleDate: Date | undefined;
  startTime: string;
  endTime: string;
  reminderMinutes: number | null;
  selectedTagId: string | null;
  recurrenceRule: string | null;
  recurrenceType: RecurrenceType | null;
  timeConflictError?: boolean;
  onAutoSave: (field: string, value: string | undefined) => void;
  onScheduleDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onReminderChange: (minutes: number | null) => void;
  onTagChange: (tagId: string | null) => void;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rrule: string | null) => void;
  entryState?: EntryState;
  origin?: EntryOrigin;
  fulfillmentScore?: FulfillmentScore | null;
  onFulfillmentChange?: (score: FulfillmentScore | null) => void;
  availableTags?: Tag[] | undefined;
  // 記録時間（actual）
  actualStart?: string | null;
  actualEnd?: string | null;
  onActualStartChange?: (time: string | null) => void;
  onActualEndChange?: (time: string | null) => void;
}

export const PlanInspectorDetailsTab = memo(function PlanInspectorDetailsTab({
  plan,
  menuContent,
  scheduleDate,
  startTime,
  endTime,
  reminderMinutes,
  selectedTagId,
  recurrenceRule,
  recurrenceType,
  timeConflictError = false,
  onAutoSave,
  onScheduleDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onReminderChange,
  onTagChange,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  entryState = 'upcoming',
  origin = 'planned',
  fulfillmentScore,
  onFulfillmentChange,
  availableTags,
  actualStart = null,
  actualEnd = null,
  onActualStartChange,
  onActualEndChange,
}: PlanInspectorDetailsTabProps) {
  const t = useTranslations();

  // upcoming のみ繰り返し・リマインダーを表示
  const showRecurrence = entryState === 'upcoming';
  // active/past で充実度を表示
  const showFulfillment = entryState !== 'upcoming' && onFulfillmentChange;

  // origin バッジ
  // upcoming → 「予定」バッジ、past+planned → なし（両行表示で自明）、past+unplanned → 「記録のみ」
  const originBadge = useMemo(() => {
    if (entryState === 'upcoming') {
      return <Badge variant="secondary">{t('common.entry.origin.planned')}</Badge>;
    }
    if (origin === 'unplanned') {
      return <Badge variant="outline">{t('common.entry.origin.unplanned')}</Badge>;
    }
    return undefined; // past + planned: 両行表示で自明
  }, [entryState, origin, t]);

  // メモのプレースホルダー（entryState で出し分け）
  const notePlaceholder =
    entryState === 'upcoming'
      ? t('plan.inspector.note.upcomingPlaceholder')
      : t('plan.inspector.note.pastPlaceholder');

  return (
    <InspectorDetailsLayout
      tagRow={
        <InspectorTagRow
          tagId={selectedTagId}
          onTagChange={onTagChange}
          originBadge={originBadge}
          menuContent={menuContent}
          {...(availableTags ? { availableTags } : {})}
        />
      }
      schedule={
        <InspectorTimeSection
          selectedDate={scheduleDate}
          onDateChange={onScheduleDateChange}
          plannedStart={startTime}
          plannedEnd={endTime}
          onPlannedStartChange={onStartTimeChange}
          onPlannedEndChange={onEndTimeChange}
          actualStart={actualStart ?? null}
          actualEnd={actualEnd ?? null}
          onActualStartChange={onActualStartChange ?? (() => {})}
          onActualEndChange={onActualEndChange ?? (() => {})}
          entryState={entryState}
          origin={origin}
          timeConflictError={timeConflictError}
        />
      }
      note={
        <InlineNoteSection
          note={plan.description || ''}
          onNoteChange={(text) => onAutoSave('description', text)}
          placeholder={notePlaceholder}
        />
      }
      options={
        <>
          {showFulfillment && (
            <FulfillmentButton
              score={fulfillmentScore ?? null}
              onScoreChange={onFulfillmentChange}
            />
          )}
          {showRecurrence && (
            <>
              <RecurrenceIconButton
                recurrenceRule={recurrenceRule}
                recurrenceType={recurrenceType}
                onRepeatTypeChange={onRepeatTypeChange}
                onRecurrenceRuleChange={onRecurrenceRuleChange}
              />
              <ReminderSelect value={reminderMinutes} onChange={onReminderChange} variant="icon" />
            </>
          )}
        </>
      }
    />
  );
});
