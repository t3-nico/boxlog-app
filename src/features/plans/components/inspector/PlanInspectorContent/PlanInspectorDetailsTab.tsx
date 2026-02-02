'use client';

/**
 * PlanInspector の詳細タブ（Toggl風3行レイアウト）
 *
 * Row 1: Title
 * Row 2: Date + Time + Duration
 * Row 3: Tags + [Records] [Due] [Description] [Status*] [Recurrence] [Reminder]
 */

import { memo, useEffect, useState } from 'react';

import { TagsIconButton } from '@/components/common/TagsIconButton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';

import { normalizeStatus } from '../../../utils/status';

import type { Plan } from '../../../types/plan';
import { DescriptionIconButton } from '../../shared/DescriptionIconButton';
import { DueDateIconButton } from '../../shared/DueDateIconButton';
import { PlanScheduleRow } from '../../shared/PlanScheduleRow';
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
  /** ステータス変更ハンドラー */
  onStatusChange: (status: 'open' | 'closed') => void;
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
  onStatusChange,
  isDraftMode = false,
}: PlanInspectorDetailsTabProps) {
  const status = normalizeStatus(plan.status);

  // タイトルのローカル状態（controlled component用）
  const [localTitle, setLocalTitle] = useState(plan.title);

  // plan.titleが変わったらローカル状態を同期（別のプランを開いた時など）
  useEffect(() => {
    setLocalTitle(plan.title);
  }, [plan.title, plan.id]);

  return (
    <>
      {/* Row 1: Title */}
      <div className="px-4 pt-4 pb-2">
        <input
          ref={titleRef}
          type="text"
          value={localTitle}
          placeholder="タイトルを追加"
          onChange={(e) => {
            setLocalTitle(e.target.value);
            onAutoSave('title', e.target.value);
          }}
          className="placeholder:text-muted-foreground block w-full border-0 bg-transparent text-xl font-bold outline-none"
        />
      </div>

      {/* Row 2: Date + Time + Duration */}
      <PlanScheduleRow
        selectedDate={scheduleDate}
        startTime={startTime}
        endTime={endTime}
        onDateChange={onScheduleDateChange}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={onEndTimeChange}
        timeConflictError={timeConflictError}
      />

      {/* Row 3: Option Icons */}
      <div className="flex flex-wrap items-center gap-0.5 px-4 pt-2 pb-4">
        {/* Tags */}
        <TagsIconButton tagIds={selectedTagIds} onTagsChange={onTagsChange} popoverSide="bottom" />

        {/* Records - 編集モードのみ */}
        {!isDraftMode && planId && <RecordsIconButton planId={planId} />}

        {/* Due Date */}
        <DueDateIconButton dueDate={dueDate} onDueDateChange={onDueDateChange} />

        {/* Description */}
        <DescriptionIconButton
          planId={plan.id}
          description={plan.description || ''}
          onDescriptionChange={(html) => onAutoSave('description', html)}
        />

        {/* Status - ドラフトモードでは非表示（新規作成時は常にopen） */}
        {!isDraftMode && (
          <button
            type="button"
            onClick={() => onStatusChange(status === 'closed' ? 'open' : 'closed')}
            className="focus-visible:ring-ring ml-1 rounded-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <Badge
              variant={status === 'closed' ? 'success' : 'info'}
              className="flex items-center gap-1"
            >
              {status === 'closed' ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <Circle className="size-3" />
              )}
              {status === 'closed' ? 'Closed' : 'Open'}
            </Badge>
          </button>
        )}

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
