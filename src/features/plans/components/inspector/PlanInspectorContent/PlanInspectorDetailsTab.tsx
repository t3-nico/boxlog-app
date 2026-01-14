'use client';

/**
 * PlanInspector の詳細タブ
 */

import { memo } from 'react';

import { Bell, CalendarDays, CheckCircle2, Circle, FileText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

import { normalizeStatus } from '../../../utils/status';

import type { Plan } from '../../../types/plan';
import { DatePickerPopover } from '../../shared/DatePickerPopover';
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
  /** ステータス変更ハンドラー */
  onStatusChange: (status: 'open' | 'closed') => void;
}

export const PlanInspectorDetailsTab = memo(function PlanInspectorDetailsTab({
  plan,
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
  onRemoveTag,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  onStatusChange,
}: PlanInspectorDetailsTabProps) {
  const status = normalizeStatus(plan.status);

  return (
    <>
      {/* Title */}
      <div className="px-4 py-3">
        <span
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onAutoSave('title', e.currentTarget.textContent || '')}
          className="block w-full border-0 text-lg font-semibold outline-none"
        >
          {plan.title}
        </span>
      </div>

      {/* Schedule */}
      <PlanScheduleSection
        selectedDate={scheduleDate}
        startTime={startTime}
        endTime={endTime}
        onDateChange={onScheduleDateChange}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={onEndTimeChange}
        recurrenceRule={recurrenceRule}
        recurrenceType={recurrenceType}
        onRepeatTypeChange={onRepeatTypeChange}
        onRecurrenceRuleChange={onRecurrenceRuleChange}
        showBorderTop={true}
        timeConflictError={timeConflictError}
      />

      {/* Due Date */}
      <div className="border-border/50 flex min-h-10 items-center gap-2 border-t px-4 py-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <CalendarDays className="text-muted-foreground size-4" />
        </div>
        <div className="flex h-8 flex-1 items-center">
          <DatePickerPopover
            selectedDate={dueDate}
            onDateChange={onDueDateChange}
            placeholder="期限を設定..."
          />
        </div>
      </div>

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

      {/* Status */}
      <div className="border-border/50 flex min-h-10 items-center gap-2 border-t px-4 py-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
          {status === 'closed' ? (
            <CheckCircle2 className="text-success size-4" />
          ) : (
            <Circle className="text-muted-foreground size-4" />
          )}
        </div>
        <Badge
          variant={status === 'closed' ? 'success' : 'secondary'}
          className="hover:bg-state-hover cursor-pointer transition-colors"
          onClick={() => onStatusChange(status === 'closed' ? 'open' : 'closed')}
        >
          {status === 'closed' ? 'Closed' : 'Open'}
        </Badge>
      </div>

      {/* Description */}
      <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <FileText className="text-muted-foreground size-4" />
        </div>
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
      <div className="border-border/50 flex min-h-10 items-center gap-2 border-t px-4 py-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
          <Bell className="text-muted-foreground size-4" />
        </div>
        <div className="flex h-8 flex-1 items-center">
          <ReminderSelect value={reminderType} onChange={onReminderChange} variant="inspector" />
        </div>
      </div>
    </>
  );
});
