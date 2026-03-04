'use client';

/**
 * Inspector の詳細タブ
 *
 * Row 0: タグ（カラードット + タグ名）
 * Row 1: 予定/記録 時間比較セクション
 * Row 2: オプションボタン群
 *
 * 「Time waits for no one」原則:
 * - upcoming: 繰り返し、リマインダーあり / 充実度なし / 記録行なし
 * - active: 充実度あり（先行入力可）/ 繰り返し、リマインダーなし / 記録行あり
 * - past: 充実度あり / 繰り返し、リマインダーなし / 記録行あり
 */

import { memo } from 'react';

import { useTranslations } from 'next-intl';
import {
  FulfillmentButton,
  InspectorDetailsLayout,
  InspectorTagRow,
  NoteIconButton,
  TimeComparisonSection,
} from '../shared';

import type { FulfillmentScore } from '@/core/types/entry';
import type { Tag } from '@/core/types/tag';
import type { EntryState } from '@/lib/entry-status';

import type { Plan } from '../../../types/plan';
import { RecurrenceIconButton } from '../../shared/RecurrenceIconButton';
import { ReminderSelect } from '../../shared/ReminderSelect';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;

interface PlanInspectorDetailsTabProps {
  plan: Plan;
  scheduleDate: Date | undefined;
  startTime: string;
  endTime: string;
  reminderMinutes: number | null;
  selectedTagId: string | null;
  recurrenceRule: string | null;
  recurrenceType: RecurrenceType;
  timeConflictError?: boolean;
  onAutoSave: (field: string, value: string | undefined) => void;
  onScheduleDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onReminderChange: (minutes: number | null) => void;
  onTagChange: (tagId: string | null) => void;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rrule: string | null) => void;
  /** @deprecated kept for story compatibility */
  isDraftMode?: boolean;
  entryState?: EntryState;
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

  return (
    <InspectorDetailsLayout
      tagRow={
        <InspectorTagRow
          tagId={selectedTagId}
          onTagChange={onTagChange}
          {...(availableTags ? { availableTags } : {})}
        />
      }
      schedule={
        <TimeComparisonSection
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
          timeConflictError={timeConflictError}
        />
      }
      options={
        <>
          <NoteIconButton
            id={plan.id}
            note={plan.description || ''}
            onNoteChange={(html) => onAutoSave('description', html)}
            labels={{
              editTooltip: t('plan.inspector.editDescription'),
              addTooltip: t('plan.inspector.addDescription'),
              placeholder: t('plan.inspector.addDescriptionPlaceholder'),
            }}
          />
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
