'use client';

/**
 * PlanInspector の詳細タブ
 */

import { memo, useCallback, useState } from 'react';

import { Bell, CalendarDays, CheckCircle2, Circle, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';

import { cn } from '@/lib/utils';

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
  onStatusChange: (status: 'open' | 'done') => void;
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
  const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);
  const status = normalizeStatus(plan.status);

  const handleStatusClick = useCallback(() => {
    const newStatus = status === 'done' ? 'open' : 'done';
    onStatusChange(newStatus);
  }, [status, onStatusChange]);
  return (
    <>
      {/* Title */}
      <div className="flex min-h-10 items-start gap-2 px-4 py-2">
        <button
          type="button"
          onClick={handleStatusClick}
          onMouseEnter={() => setIsCheckboxHovered(true)}
          onMouseLeave={() => setIsCheckboxHovered(false)}
          className={cn(
            'mt-0.5 flex-shrink-0 cursor-pointer rounded-md transition-all',
            'hover:bg-state-hover flex min-h-7 min-w-7 items-center justify-center',
            'hover:scale-105 active:scale-95',
          )}
          aria-label={status === 'done' ? '未完了に戻す' : '完了にする'}
        >
          {status === 'done' ? (
            <CheckCircle2 className="text-success size-6" />
          ) : isCheckboxHovered ? (
            <CheckCircle2 className="text-success size-6" />
          ) : (
            <Circle className="text-muted-foreground size-6" />
          )}
        </button>
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
        </div>
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

      {/* Due Date - 期限 */}
      <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
        <CalendarDays className="text-muted-foreground mt-2 size-4 flex-shrink-0" />
        <div className="flex h-8 flex-1 items-center">
          <DatePickerPopover
            selectedDate={dueDate}
            onDateChange={onDueDateChange}
            placeholder="期限を設定"
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
