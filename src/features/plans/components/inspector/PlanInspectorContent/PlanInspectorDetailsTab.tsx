'use client';

/**
 * Inspector の詳細タブ — 3パターン対応
 *
 * Row 0: タグ（カラードット + タグ名）+ ⋯ メニュー
 * Row 1: 予定/記録 時間比較セクション
 * Row 2: オプションボタン群
 */

import type { ReactNode } from 'react';
import { memo } from 'react';

import {
  InspectorDetailsLayout,
  InspectorTagRow,
  InspectorTimeSection,
} from '@/core/components/inspector';
import { useTranslations } from 'next-intl';

import type {
  EntryOrigin,
  EntryWithTags,
  FulfillmentScore,
  RecurrenceType,
} from '@/core/types/entry';
import type { EntryState } from '@/lib/entry-status';

import { Bell, Repeat } from 'lucide-react';

import { ReminderSelect } from '@/components/common/ReminderSelect';

import { RecurrenceIconButton } from '../../shared/RecurrenceIconButton';

interface PlanInspectorDetailsTabProps {
  plan: EntryWithTags;
  /** ⋯ メニューの内容（InspectorTagRow に伝搬） */
  menuContent?: ReactNode;
  scheduleDate: Date | undefined;
  startTime: string;
  endTime: string;
  reminderMinutes: number | null;
  selectedTagId: string | null;
  onTagChange: (tagId: string | null) => void;
  recurrenceRule: string | null;
  recurrenceType: RecurrenceType | null;
  timeConflictError?: boolean;
  onAutoSave: (field: string, value: string | undefined) => void;
  onScheduleDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onReminderChange: (minutes: number | null) => void;
  onRepeatTypeChange: (type: string) => void;
  onRecurrenceRuleChange: (rrule: string | null) => void;
  entryState?: EntryState;
  origin?: EntryOrigin;
  fulfillmentScore?: FulfillmentScore | null;
  onFulfillmentChange?: (score: FulfillmentScore | null) => void;
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
  onTagChange,
  recurrenceRule,
  recurrenceType,
  timeConflictError = false,
  onAutoSave,
  onScheduleDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onReminderChange,
  onRepeatTypeChange,
  onRecurrenceRuleChange,
  entryState = 'upcoming',
  origin = 'planned',
  fulfillmentScore,
  onFulfillmentChange,
  actualStart = null,
  actualEnd = null,
  onActualStartChange,
  onActualEndChange,
}: PlanInspectorDetailsTabProps) {
  const t = useTranslations();

  // upcoming のみ繰り返し・リマインダーを表示
  const showRecurrence = entryState === 'upcoming';

  return (
    <InspectorDetailsLayout
      tagRow={
        <InspectorTagRow
          tagId={selectedTagId}
          onTagChange={onTagChange}
          menuContent={menuContent}
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
          fulfillmentScore={entryState !== 'upcoming' ? fulfillmentScore : undefined}
          onFulfillmentChange={entryState !== 'upcoming' ? onFulfillmentChange : undefined}
          note={plan.description || ''}
          onNoteChange={(text) => onAutoSave('description', text)}
          notePlaceholder={t('plan.inspector.note.placeholder')}
          recurrenceRow={
            showRecurrence ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="text-muted-foreground size-4 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">
                    {t('common.recurrence.label')}
                  </span>
                </div>
                <RecurrenceIconButton
                  recurrenceRule={recurrenceRule}
                  recurrenceType={recurrenceType}
                  onRepeatTypeChange={onRepeatTypeChange}
                  onRecurrenceRuleChange={onRecurrenceRuleChange}
                />
              </div>
            ) : undefined
          }
          reminderRow={
            showRecurrence ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="text-muted-foreground size-4 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">
                    {t('common.reminder.label')}
                  </span>
                </div>
                <ReminderSelect
                  value={reminderMinutes}
                  onChange={onReminderChange}
                  variant="inspector"
                />
              </div>
            ) : undefined
          }
        />
      }
    />
  );
});
