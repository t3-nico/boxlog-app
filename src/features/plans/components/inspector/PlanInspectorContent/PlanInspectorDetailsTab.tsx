'use client';

/**
 * PlanInspector の詳細タブ（Toggl風3行レイアウト）
 *
 * Row 1: Title
 * Row 2: Date + Time + Duration
 * Row 3: Tags + [Records] [Due] [Description] [Status*] [Recurrence] [Reminder]
 */

import { memo } from 'react';

import { NoteIconButton } from '@/features/inspector/components/NoteIconButton';
import { ScheduleRow } from '@/features/inspector/components/ScheduleRow';
import { TagsIconButton } from '@/features/inspector/components/TagsIconButton';
import { TitleInput } from '@/features/inspector/components/TitleInput';
import { useTranslations } from 'next-intl';

import type { Plan } from '../../../types/plan';
import { DueDateIconButton } from '../../shared/DueDateIconButton';
import { RecordsIconButton } from '../../shared/RecordsIconButton';
import { RecurrenceIconButton } from '../../shared/RecurrenceIconButton';
import { ReminderSelect } from '../../shared/ReminderSelect';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;

interface PlanInspectorDetailsTabProps {
  plan: Plan;
  planId: string;
  titleRef: React.RefObject<HTMLInputElement | null>;
  scheduleDate: Date | undefined; // スケジュール日（カレンダー配置用）
  dueDate: Date | undefined; // 期限日
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
  onDueDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onReminderChange: (type: string) => void;
  onTagsChange: (tagIds: string[]) => void;
  onRemoveTag: (tagId: string) => void;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rrule: string | null) => void;
  /** ドラフトモード（新規作成時） */
  isDraftMode?: boolean;
}

export const PlanInspectorDetailsTab = memo(function PlanInspectorDetailsTab({
  plan,
  planId,
  titleRef,
  scheduleDate,
  dueDate,
  startTime,
  endTime,
  reminderType,
  selectedTagIds,
  recurrenceRule,
  recurrenceType,
  timeConflictError = false,
  onAutoSave,
  onScheduleDateChange,
  onDueDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onReminderChange,
  onTagsChange,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  isDraftMode = false,
}: PlanInspectorDetailsTabProps) {
  const t = useTranslations();

  return (
    <>
      {/* Row 1: Title */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <TitleInput
          ref={titleRef}
          value={plan.title}
          onChange={(value) => onAutoSave('title', value)}
          placeholder={isDraftMode ? 'タイトルを追加' : t('calendar.event.noTitle')}
          className="flex-1"
        />
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
        <TagsIconButton tagIds={selectedTagIds} onTagsChange={onTagsChange} popoverSide="bottom" />

        {/* Records - 編集モードのみ */}
        {!isDraftMode && planId && <RecordsIconButton planId={planId} />}

        {/* Due Date */}
        <DueDateIconButton dueDate={dueDate} onDueDateChange={onDueDateChange} />

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
