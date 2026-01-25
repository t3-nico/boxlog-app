'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseDateString, parseDatetimeString } from '@/features/calendar/utils/dateUtils';
import type { PlanItem } from '@/features/inbox/hooks/useInboxData';
import { DateTimePopoverContent } from '@/features/plans/components/shared/DateTimePopoverContent';
import { RecurringIndicator } from '@/features/plans/components/shared/RecurringIndicator';
import { TagSelectCombobox } from '@/features/plans/components/shared/TagSelectCombobox';
import { normalizeStatus } from '@/features/plans/utils/status';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { Bell, Calendar as CalendarIcon, CheckCircle2, Circle, Plus, Tag } from 'lucide-react';

import { BoardActionMenuItems } from '../BoardActionMenuItems';
import { usePlanCardHandlers } from './usePlanCardHandlers';

interface PlanCardProps {
  item: PlanItem;
}

/**
 * PlanCard - Plan表示用カードコンポーネント
 *
 * **機能**:
 * - ドラッグ可能（useDraggable）
 * - 日時編集（Popover）
 * - タグ編集（TagSelectCombobox）
 * - コンテキストメニュー（編集・複製・削除等）
 */
export function PlanCard({ item }: PlanCardProps) {
  const {
    isActive,
    isFocused,
    dateTimeOpen,
    setDateTimeOpen,
    selectedDate,
    setSelectedDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    reminderType,
    setReminderType,
    recurrenceType,
    recurrenceRule,
    tags,
    handleTagsChange,
    handleDateTimeChange,
    handleDateTimeClear,
    handleClick,
    handleEdit,
    handleDuplicate,
    handleAddTags,
    handleChangeDueDate,
    handleArchive,
    handleDelete,
    handleRepeatTypeChange,
    handleRecurrenceRuleChange,
    setFocusedId,
    updatePlan,
  } = usePlanCardHandlers({ item });

  const { formatDate: formatDateWithSettings, formatTime: formatTimeWithSettings } =
    useDateFormat();

  // ドラッグ可能にする
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  // 表示用の日時フォーマット
  const getDisplayContent = () => {
    if (!item.due_date && !item.start_time && !item.end_time) return null;

    const dateStr = item.due_date ? formatDateWithSettings(parseDateString(item.due_date)) : '';
    let timeStr = '';

    if (item.start_time && item.end_time) {
      timeStr = ` ${formatTimeWithSettings(parseDatetimeString(item.start_time))} → ${formatTimeWithSettings(parseDatetimeString(item.end_time))}`;
    } else if (item.start_time) {
      timeStr = ` ${formatTimeWithSettings(parseDatetimeString(item.start_time))}`;
    }

    return (
      <span>
        {dateStr}
        {timeStr}
      </span>
    );
  };

  return (
    <ContextMenu
      modal={false}
      onOpenChange={(open) => {
        setFocusedId(open ? item.id : null);
      }}
    >
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={handleClick}
          className={cn(
            'bg-secondary text-secondary-foreground hover:bg-state-hover border-border group flex cursor-pointer flex-col gap-2 rounded-xl border p-3 shadow-sm transition-colors',
            isActive && 'border-primary',
            isFocused && 'bg-primary-state-selected hover:bg-state-dragged',
            isDragging && 'opacity-50',
          )}
        >
          {/* 1. タイトル + チェックボックス */}
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const currentStatus = normalizeStatus(item.status);
                const newStatus = currentStatus === 'closed' ? 'open' : 'closed';
                updatePlan.mutate({ id: item.id, data: { status: newStatus } });
              }}
              className="flex-shrink-0 transition-colors hover:opacity-80"
              aria-label={normalizeStatus(item.status) === 'closed' ? '未完了に戻す' : '完了にする'}
            >
              {normalizeStatus(item.status) === 'closed' ? (
                <CheckCircle2 className="text-success h-4 w-4" />
              ) : (
                <Circle className="text-muted-foreground h-4 w-4" />
              )}
            </button>
            <h3 className="text-foreground min-w-0 text-base leading-tight font-bold hover:underline">
              {item.title}
            </h3>
          </div>

          {/* 2. 日付・時間 */}
          <Popover open={dateTimeOpen} onOpenChange={setDateTimeOpen}>
            <PopoverTrigger asChild>
              <div
                className="text-foreground hover:bg-primary-state-hover group/date flex w-fit cursor-pointer items-center gap-2 rounded py-0.5 text-sm transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {getDisplayContent() || (
                  <div className="text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    <span>日付を追加</span>
                  </div>
                )}

                {(recurrenceRule ||
                  (recurrenceType && recurrenceType !== 'none') ||
                  (reminderType && reminderType !== 'none' && reminderType !== '')) && (
                  <div className="flex items-center gap-1">
                    <RecurringIndicator
                      recurrenceType={recurrenceType}
                      recurrenceRule={recurrenceRule}
                      size="md"
                      showTooltip
                    />
                    {reminderType && reminderType !== 'none' && reminderType !== '' && (
                      <div
                        title={
                          reminderType === '5min'
                            ? '5分前'
                            : reminderType === '15min'
                              ? '15分前'
                              : reminderType === '30min'
                                ? '30分前'
                                : reminderType === '1hour'
                                  ? '1時間前'
                                  : reminderType === '1day'
                                    ? '1日前'
                                    : ''
                        }
                      >
                        <Bell className="text-muted-foreground size-4" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <DateTimePopoverContent
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  handleDateTimeChange();
                }}
                startTime={startTime}
                onStartTimeChange={(time) => {
                  setStartTime(time);
                  handleDateTimeChange();
                }}
                endTime={endTime}
                onEndTimeChange={(time) => {
                  setEndTime(time);
                  handleDateTimeChange();
                }}
                reminderType={reminderType}
                onReminderChange={(value) => {
                  setReminderType(value);
                  handleDateTimeChange();
                }}
                recurrenceRule={recurrenceRule}
                recurrenceType={recurrenceType}
                onRepeatTypeChange={handleRepeatTypeChange}
                onRecurrenceRuleChange={handleRecurrenceRuleChange}
              />
              <div className="border-border/50 flex justify-end border-t px-3 py-2">
                <Button
                  onClick={handleDateTimeClear}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive-state-hover h-6 px-2 text-xs"
                >
                  クリア
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* 3. Tags */}
          <TagSelectCombobox selectedTagIds={item.tagIds ?? []} onTagsChange={handleTagsChange}>
            {tags.length > 0 ? (
              <div className="group/tags flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                {tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="shrink-0 text-xs font-normal"
                    style={tag.color ? { borderColor: tag.color } : undefined}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 4 && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    +{tags.length - 4}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary-state-hover text-muted-foreground h-5 w-5 shrink-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className="hover:bg-primary-state-hover group/tags flex w-fit cursor-pointer flex-wrap gap-1 rounded py-0.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Tag className="size-3" />
                  <span>タグを追加</span>
                </div>
              </div>
            )}
          </TagSelectCombobox>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <BoardActionMenuItems
          item={item}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onAddTags={handleAddTags}
          onChangeDueDate={handleChangeDueDate}
          onArchive={handleArchive}
          onDelete={handleDelete}
          renderMenuItem={({ icon, label, onClick, variant }) => (
            <ContextMenuItem
              onClick={onClick}
              className={variant === 'destructive' ? 'text-destructive' : ''}
            >
              {icon}
              {label}
            </ContextMenuItem>
          )}
          renderSeparator={() => <ContextMenuSeparator />}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}
