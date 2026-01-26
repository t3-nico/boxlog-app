'use client';

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useTags } from '@/features/tags/hooks';
import { Bell, Calendar, CalendarClock, Clock, Pencil, Repeat, RotateCcw, Tag } from 'lucide-react';
import {
  type DateRangeFilter,
  type DueDateFilter,
  type RecurrenceFilter,
  type ReminderFilter,
  type ScheduleFilter,
  usePlanFilterStore,
} from '../../stores/usePlanFilterStore';

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
 * 繰り返しフィルター選択肢
 */
const RECURRENCE_OPTIONS: Array<{ value: RecurrenceFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'yes', label: 'あり' },
  { value: 'no', label: 'なし' },
];

/**
 * リマインダーフィルター選択肢
 */
const REMINDER_OPTIONS: Array<{ value: ReminderFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'yes', label: 'あり' },
  { value: 'no', label: 'なし' },
];

/**
 * スケジュールフィルター選択肢
 */
const SCHEDULE_OPTIONS: Array<{ value: ScheduleFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'scheduled', label: 'スケジュール済み' },
  { value: 'unscheduled', label: '未スケジュール' },
];

/**
 * 日付範囲フィルター選択肢（作成日・更新日共通）
 */
const DATE_RANGE_OPTIONS: Array<{ value: DateRangeFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'this_week', label: '今週' },
  { value: 'last_week', label: '先週' },
  { value: 'this_month', label: '今月' },
];

/**
 * Planフィルターコンテンツ
 *
 * Linear/Account.tsx風の2カラム構造
 * - DropdownMenuSub でカテゴリ → サブメニュー
 * - 期限・繰り返し・リマインダー: RadioGroup（単一選択）
 * - タグ: CheckboxItem（複数選択）
 */
export function PlanFilterContent() {
  const {
    dueDate,
    setDueDate,
    tags: selectedTags,
    setTags,
    recurrence,
    setRecurrence,
    reminder,
    setReminder,
    schedule,
    setSchedule,
    createdAt,
    setCreatedAt,
    updatedAt,
    setUpdatedAt,
    reset,
  } = usePlanFilterStore();
  const { data: allTags } = useTags();

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setTags([...selectedTags, tagId]);
    }
  };

  // フィルターがアクティブかどうか
  const hasActiveFilters =
    dueDate !== 'all' ||
    selectedTags.length > 0 ||
    recurrence !== 'all' ||
    reminder !== 'all' ||
    schedule !== 'all' ||
    createdAt !== 'all' ||
    updatedAt !== 'all';

  return (
    <>
      <DropdownMenuGroup>
        {/* 期限フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calendar />
            <span className="flex-1">期限</span>
            {dueDate !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={dueDate}
              onValueChange={(v) => setDueDate(v as DueDateFilter)}
            >
              {DUE_DATE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* タグフィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Tag />
            <span className="flex-1">タグ</span>
            {selectedTags.length > 0 && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                {selectedTags.length}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            {allTags && allTags.length > 0 ? (
              allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="text-muted-foreground px-2 py-2 text-sm">タグがありません</div>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 繰り返しフィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Repeat />
            <span className="flex-1">繰り返し</span>
            {recurrence !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={recurrence}
              onValueChange={(v) => setRecurrence(v as RecurrenceFilter)}
            >
              {RECURRENCE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* リマインダーフィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Bell />
            <span className="flex-1">リマインダー</span>
            {reminder !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={reminder}
              onValueChange={(v) => setReminder(v as ReminderFilter)}
            >
              {REMINDER_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* スケジュールフィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CalendarClock />
            <span className="flex-1">スケジュール</span>
            {schedule !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={schedule}
              onValueChange={(v) => setSchedule(v as ScheduleFilter)}
            >
              {SCHEDULE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 作成日フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Clock />
            <span className="flex-1">作成日</span>
            {createdAt !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={createdAt}
              onValueChange={(v) => setCreatedAt(v as DateRangeFilter)}
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 更新日フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Pencil />
            <span className="flex-1">更新日</span>
            {updatedAt !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={updatedAt}
              onValueChange={(v) => setUpdatedAt(v as DateRangeFilter)}
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      {/* リセットボタン（フィルターがアクティブな場合のみ表示） */}
      {hasActiveFilters && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={reset}>
            <RotateCcw />
            フィルターをリセット
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
