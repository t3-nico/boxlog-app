'use client';

/**
 * Inspector の詳細タブ（Toggl風3行レイアウト）
 *
 * Row 1: Title
 * Row 2: Date + Time + Duration
 * Row 3: Tags + [Description] + [Fulfillment*] + [Recurrence*] + [Reminder*]
 *
 * 「Time waits for no one」原則:
 * - upcoming: 繰り返し、リマインダーあり / 充実度なし
 * - active: 充実度あり（先行入力可）/ 繰り返し、リマインダーなし
 * - past: 充実度あり / 繰り返し、リマインダーなし
 */

import { memo, useCallback } from 'react';

import { useTranslations } from 'next-intl';
import {
  FulfillmentButton,
  InspectorDetailsLayout,
  NoteIconButton,
  ScheduleRow,
  TagsIconButton,
  TitleInput,
} from '../shared';

import { SuggestInput } from '@/components/common/SuggestInput';
import type { FulfillmentScore } from '@/core/types/entry';
import type { Tag } from '@/core/types/tag';
import type { EntryState } from '@/lib/entry-status';

import type { Plan } from '../../../types/plan';
import { RecurrenceIconButton } from '../../shared/RecurrenceIconButton';
import { ReminderSelect } from '../../shared/ReminderSelect';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;

interface PlanInspectorDetailsTabProps {
  plan: Plan;
  titleRef: React.RefObject<HTMLInputElement | null>;
  scheduleDate: Date | undefined;
  startTime: string;
  endTime: string;
  reminderMinutes: number | null;
  selectedTagIds: string[];
  recurrenceRule: string | null;
  recurrenceType: RecurrenceType;
  timeConflictError?: boolean;
  onAutoSave: (field: string, value: string | undefined) => void;
  onScheduleDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onReminderChange: (minutes: number | null) => void;
  onTagsChange: (tagIds: string[]) => void;
  onRemoveTag: (tagId: string) => void;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rrule: string | null) => void;
  isDraftMode?: boolean;
  /** 時間位置ベースの状態（upcoming/active/past） */
  entryState?: EntryState;
  /** 充実度スコア */
  fulfillmentScore?: FulfillmentScore | null;
  /** 充実度変更コールバック */
  onFulfillmentChange?: (score: FulfillmentScore | null) => void;
  availableTags?: Tag[] | undefined;
}

export const PlanInspectorDetailsTab = memo(function PlanInspectorDetailsTab({
  plan,
  titleRef,
  scheduleDate,
  startTime,
  endTime,
  reminderMinutes,
  selectedTagIds,
  recurrenceRule,
  recurrenceType,
  timeConflictError = false,
  onAutoSave,
  onScheduleDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onReminderChange,
  onTagsChange,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  isDraftMode = false,
  entryState = 'upcoming',
  fulfillmentScore,
  onFulfillmentChange,
  availableTags,
}: PlanInspectorDetailsTabProps) {
  const t = useTranslations();

  // past entries は record サジェスト、それ以外は plan サジェスト
  const suggestType = entryState === 'past' ? 'record' : 'plan';

  // past entries は "何をしてた？" プレースホルダー
  const titlePlaceholder =
    entryState === 'past'
      ? t('plan.inspector.recordCreate.titlePlaceholder')
      : isDraftMode
        ? t('plan.inspector.addTitle')
        : t('calendar.event.noTitle');

  // upcoming のみ繰り返し・リマインダーを表示
  const showRecurrence = entryState === 'upcoming';
  // active/past で充実度を表示
  const showFulfillment = entryState !== 'upcoming' && onFulfillmentChange;

  const handleSuggestionSelect = useCallback(
    (entry: { title: string; tagIds: string[] }) => {
      onAutoSave('title', entry.title);
      onTagsChange(entry.tagIds);
    },
    [onAutoSave, onTagsChange],
  );

  return (
    <InspectorDetailsLayout
      title={
        isDraftMode ? (
          <SuggestInput
            value={plan.title}
            onChange={(value) => onAutoSave('title', value)}
            onSuggestionSelect={handleSuggestionSelect}
            type={suggestType}
            placeholder={titlePlaceholder}
            autoFocus
          />
        ) : (
          <TitleInput
            ref={titleRef}
            value={plan.title}
            onChange={(value) => onAutoSave('title', value)}
            placeholder={titlePlaceholder}
          />
        )
      }
      schedule={
        <ScheduleRow
          selectedDate={scheduleDate}
          startTime={startTime}
          endTime={endTime}
          onDateChange={onScheduleDateChange}
          onStartTimeChange={onStartTimeChange}
          onEndTimeChange={onEndTimeChange}
          timeConflictError={timeConflictError}
        />
      }
      options={
        <>
          <TagsIconButton
            tagIds={selectedTagIds}
            onTagsChange={onTagsChange}
            popoverSide="bottom"
            {...(availableTags ? { availableTags } : {})}
          />
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
