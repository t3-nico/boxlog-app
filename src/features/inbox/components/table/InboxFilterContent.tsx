'use client';

import {
  MobileSettingsChip,
  MobileSettingsRadioGroup,
  MobileSettingsSection,
} from '@/components/common';
import { Label } from '@/components/ui/label';
import type { PlanStatus } from '@/features/plans/types/plan';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { type DueDateFilter, useInboxFilterStore } from '../../stores/useInboxFilterStore';

/**
 * ステータス選択肢
 */
const STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: 'todo', label: 'Todo' },
  { value: 'doing', label: 'Doing' },
  { value: 'done', label: 'Done' },
];

/**
 * 期限フィルター選択肢
 */
const DUE_DATE_OPTIONS: Array<{ value: DueDateFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日期限' },
  { value: 'tomorrow', label: '明日期限' },
  { value: 'this_week', label: '今週中' },
  { value: 'next_week', label: '来週' },
  { value: 'overdue', label: '期限切れ' },
  { value: 'no_due_date', label: '期限なし' },
];

/**
 * Inboxフィルターコンテンツ
 *
 * TableNavigationのフィルターシートに表示する内容
 * - 期限フィルター
 * - ステータスフィルター
 */
export function InboxFilterContent() {
  const { status, dueDate, setStatus, setDueDate } = useInboxFilterStore();

  // ステータストグル
  const toggleStatus = (value: PlanStatus) => {
    const newStatus = status.includes(value)
      ? status.filter((s) => s !== value)
      : [...status, value];
    setStatus(newStatus as PlanStatus[]);
  };

  return (
    <>
      {/* 期限フィルター */}
      <MobileSettingsSection icon={<Calendar />} title="期限">
        <MobileSettingsRadioGroup
          options={DUE_DATE_OPTIONS}
          value={dueDate}
          onValueChange={setDueDate}
          idPrefix="filter-due-date"
        />
      </MobileSettingsSection>

      {/* ステータスフィルター */}
      <MobileSettingsSection icon={<CheckCircle2 />} title="ステータス" showSeparator={false}>
        <Label className="text-muted-foreground mb-2 block text-xs">複数選択可</Label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <MobileSettingsChip
              key={option.value}
              id={`filter-status-${option.value}`}
              label={option.label}
              checked={status.includes(option.value)}
              onCheckedChange={() => toggleStatus(option.value)}
            />
          ))}
        </div>
      </MobileSettingsSection>
    </>
  );
}
