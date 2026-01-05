'use client';

/**
 * PlanInspector の詳細タブ
 */

import { memo } from 'react';

import { Bell, CheckSquare, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { Plan } from '../../../types/plan';
import { PlanScheduleSection } from '../../shared/PlanScheduleSection';
import { PlanTagsSection } from '../../shared/PlanTagsSection';
import { ReminderSelect } from '../../shared/ReminderSelect';

// Novel エディターは重いため遅延ロード
const NovelDescriptionEditor = dynamic(
  () => import('../../shared/NovelDescriptionEditor').then((mod) => mod.NovelDescriptionEditor),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground min-h-8 px-2 py-1 text-sm">読み込み中...</div>
    ),
  },
);

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null;

interface PlanInspectorDetailsTabProps {
  plan: Plan;
  planId: string;
  titleRef: React.RefObject<HTMLSpanElement | null>;
  selectedDate: Date | undefined;
  startTime: string;
  endTime: string;
  reminderType: string;
  selectedTagIds: string[];
  recurrenceRule: string | null;
  recurrenceType: RecurrenceType;
  /** 時間重複エラー状態（視覚的フィードバック用） */
  timeConflictError?: boolean;
  onAutoSave: (field: string, value: string | undefined) => void;
  onDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onReminderChange: (type: string) => void;
  onTagsChange: (tagIds: string[]) => void;
  onRemoveTag: (tagId: string) => void;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rrule: string | null) => void;
}

export const PlanInspectorDetailsTab = memo(function PlanInspectorDetailsTab({
  plan,
  titleRef,
  selectedDate,
  startTime,
  endTime,
  reminderType,
  selectedTagIds,
  recurrenceRule,
  recurrenceType,
  timeConflictError = false,
  onAutoSave,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onReminderChange,
  onTagsChange,
  onRemoveTag,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
}: PlanInspectorDetailsTabProps) {
  return (
    <>
      {/* Title */}
      <div className="flex min-h-10 items-start gap-2 px-4 py-2">
        <CheckSquare className="text-muted-foreground mt-1.5 size-4 flex-shrink-0" />
        <div className="flex min-h-8 flex-1 items-center">
          <span
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onAutoSave('title', e.currentTarget.textContent || '')}
            className="bg-popover border-0 px-0 text-lg font-semibold outline-none"
          >
            {plan.title}
          </span>
          {plan.plan_number && (
            <span className="text-muted-foreground ml-2 text-sm">#{plan.plan_number}</span>
          )}
        </div>
      </div>

      {/* Schedule */}
      <PlanScheduleSection
        selectedDate={selectedDate}
        startTime={startTime}
        endTime={endTime}
        onDateChange={onDateChange}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={onEndTimeChange}
        recurrenceRule={recurrenceRule}
        recurrenceType={recurrenceType}
        onRepeatTypeChange={onRepeatTypeChange}
        onRecurrenceRuleChange={onRecurrenceRuleChange}
        showBorderTop={true}
        timeConflictError={timeConflictError}
      />

      {/* Tags */}
      <PlanTagsSection
        selectedTagIds={selectedTagIds}
        onTagsChange={onTagsChange}
        onRemoveTag={onRemoveTag}
        showBorderTop={true}
        popoverAlign="end"
        popoverSide="bottom"
        popoverAlignOffset={-80}
      />

      {/* Description */}
      <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
        <FileText className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
        <div className="max-h-52 min-h-8 min-w-0 flex-1 overflow-y-auto">
          <NovelDescriptionEditor
            key={plan.id}
            content={plan.description || ''}
            onChange={(html) => onAutoSave('description', html)}
            placeholder="説明を追加..."
          />
        </div>
      </div>

      {/* Reminder */}
      <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
        <Bell className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
        <div className="flex h-8 flex-1 items-center">
          <ReminderSelect value={reminderType} onChange={onReminderChange} variant="inspector" />
        </div>
      </div>
    </>
  );
});
