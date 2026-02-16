'use client';

/**
 * PlanInspector の詳細タブ（Toggl風3行レイアウト）
 *
 * Row 1: Title
 * Row 2: Date + Time + Duration
 * Row 3: Tags + [Records] [Description] [Status*] [Recurrence] [Reminder]
 */

import { memo, useCallback } from 'react';

import { useTranslations } from 'next-intl';
import {
  NoteIconButton,
  ScheduleRow,
  TagsIconButton,
  TitleInput,
  TitleSuggestInput,
} from '../shared';

import type { Tag } from '@/features/tags/types';

import type { Plan } from '../../../types/plan';
import { RecordsIconButton } from '../../shared/RecordsIconButton';
import { RecurrenceIconButton } from '../../shared/RecurrenceIconButton';
import { ReminderSelect } from '../../shared/ReminderSelect';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;

interface PlanInspectorDetailsTabProps {
  plan: Plan;
  planId: string;
  titleRef: React.RefObject<HTMLInputElement | null>;
  scheduleDate: Date | undefined; // スケジュール日（カレンダー配置用）
  startTime: string;
  endTime: string;
  reminderType: string;
  selectedTagIds: string[];
  recurrenceRule: string | null;
  recurrenceType: RecurrenceType;
  /** 時間重複エラー状態（視覚的フィードバック用） */
  timeConflictError?: boolean;
  onAutoSave: (field: string, value: string | undefined) => void;
  onScheduleDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onReminderChange: (type: string) => void;
  onTagsChange: (tagIds: string[]) => void;
  onRemoveTag: (tagId: string) => void;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rrule: string | null) => void;
  /** ドラフトモード（新規作成時） */
  isDraftMode?: boolean;
  /** 外部からタグデータを注入（Storybook等で使用） */
  availableTags?: Tag[] | undefined;
}

export const PlanInspectorDetailsTab = memo(function PlanInspectorDetailsTab({
  plan,
  planId,
  titleRef,
  scheduleDate,
  startTime,
  endTime,
  reminderType,
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
  availableTags,
}: PlanInspectorDetailsTabProps) {
  const t = useTranslations();

  const handleSuggestionSelect = useCallback(
    (entry: { title: string; tagIds: string[] }) => {
      onAutoSave('title', entry.title);
      onTagsChange(entry.tagIds);
    },
    [onAutoSave, onTagsChange],
  );

  return (
    <>
      {/* Row 1: Title */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        {isDraftMode ? (
          <TitleSuggestInput
            value={plan.title}
            onChange={(value) => onAutoSave('title', value)}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder="タイトルを追加"
            className="flex-1"
            autoFocus
          />
        ) : (
          <TitleInput
            ref={titleRef}
            value={plan.title}
            onChange={(value) => onAutoSave('title', value)}
            placeholder={t('calendar.event.noTitle')}
            className="flex-1"
          />
        )}
      </div>

      {/* Row 2: Date + Time + Duration */}
      <ScheduleRow
        selectedDate={scheduleDate}
        startTime={startTime}
        endTime={endTime}
        onDateChange={onScheduleDateChange}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={onEndTimeChange}
        timeConflictError={timeConflictError}
      />

      {/* Row 3: Option Icons */}
      <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">
        {/* Tags */}
        <TagsIconButton
          tagIds={selectedTagIds}
          onTagsChange={onTagsChange}
          popoverSide="bottom"
          {...(availableTags ? { availableTags } : {})}
        />

        {/* Records - 編集モードのみ */}
        {!isDraftMode && planId && <RecordsIconButton planId={planId} />}

        {/* Description */}
        <NoteIconButton
          id={plan.id}
          note={plan.description || ''}
          onNoteChange={(html) => onAutoSave('description', html)}
          labels={{
            editTooltip: '説明を編集',
            addTooltip: '説明を追加',
            placeholder: '説明を追加...',
          }}
        />

        {/* Recurrence */}
        <RecurrenceIconButton
          recurrenceRule={recurrenceRule}
          recurrenceType={recurrenceType}
          onRepeatTypeChange={onRepeatTypeChange}
          onRecurrenceRuleChange={onRecurrenceRuleChange}
        />

        {/* Reminder */}
        <ReminderSelect value={reminderType} onChange={onReminderChange} variant="icon" />
      </div>
    </>
  );
});
