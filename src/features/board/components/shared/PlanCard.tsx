'use client';

import { useState } from 'react';

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
import type { InboxItem } from '@/features/inbox/hooks/useInboxData';
import { DateTimePopoverContent } from '@/features/plans/components/shared/DateTimePopoverContent';
import { PlanTagSelectDialogEnhanced } from '@/features/plans/components/shared/PlanTagSelectDialogEnhanced';
import { RecurringIndicator } from '@/features/plans/components/shared/RecurringIndicator';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useplanTags } from '@/features/plans/hooks/usePlanTags';
import { useplanCacheStore } from '@/features/plans/stores/usePlanCacheStore';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { toLocalISOString } from '@/features/plans/utils/datetime';
import { minutesToReminderType, reminderTypeToMinutes } from '@/features/plans/utils/reminder';
import { getEffectiveStatus } from '@/features/plans/utils/status';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { Bell, Calendar as CalendarIcon, CheckCircle2, Circle, Plus, Tag } from 'lucide-react';

import { useBoardFocusStore } from '../../stores/useBoardFocusStore';
import { BoardActionMenuItems } from '../BoardActionMenuItems';

interface PlanCardProps {
  item: InboxItem;
}

/**
 * PlanCard - Plan表示用カードコンポーネント
 *
 * **機能**:
 * - ドラッグ可能（useDraggable）
 * - 日時編集（Popover）
 * - タグ編集（PlanTagSelectDialogEnhanced）
 * - コンテキストメニュー（編集・複製・削除等）
 *
 * **使用箇所**:
 * - PlanKanbanBoard（Kanbanボード）
 * - InboxCardList（Calendar Sidebar）
 */
export function PlanCard({ item }: PlanCardProps) {
  const { openInspector, planId } = usePlanInspectorStore();
  const { focusedId, setFocusedId } = useBoardFocusStore();
  const { addplanTag, removeplanTag } = useplanTags();
  const { updatePlan } = usePlanMutations();
  const { getCache } = useplanCacheStore();
  const { formatDate: formatDateWithSettings, formatTime: formatTimeWithSettings } =
    useDateFormat();
  const isActive = planId === item.id;
  const isFocused = focusedId === item.id;

  // ドラッグ可能にする
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  // ドラッグ時のスタイル
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // 日時編集用の状態
  const [dateTimeOpen, setDateTimeOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    item.due_date ? parseDateString(item.due_date) : undefined,
  );
  const [startTime, setStartTime] = useState(
    item.start_time ? format(parseDatetimeString(item.start_time), 'HH:mm') : '',
  );
  const [endTime, setEndTime] = useState(
    item.end_time ? format(parseDatetimeString(item.end_time), 'HH:mm') : '',
  );
  // 通知設定: UI文字列形式（'', '開始時刻', '10分前', ...）
  const [reminderType, setReminderType] = useState<string>(
    minutesToReminderType(item.reminder_minutes),
  );

  // 繰り返し設定（Zustandキャッシュから取得、なければitemから）
  const cache = getCache(item.id);
  const recurrenceType =
    cache?.recurrence_type !== undefined
      ? cache.recurrence_type === 'none' || !cache.recurrence_type
        ? 'none'
        : cache.recurrence_type
      : item.recurrence_type === 'none' || !item.recurrence_type
        ? 'none'
        : item.recurrence_type;
  const recurrenceRule =
    cache?.recurrence_rule !== undefined ? cache.recurrence_rule : (item.recurrence_rule ?? null);

  // タグ変更ハンドラー
  const handleTagsChange = async (tagIds: string[]) => {
    const currentTagIds = item.tags?.map((tag) => tag.id) ?? [];
    const addedTagIds = tagIds.filter((id) => !currentTagIds.includes(id));
    const removedTagIds = currentTagIds.filter((id) => !tagIds.includes(id));

    // タグを追加
    for (const tagId of addedTagIds) {
      await addplanTag(item.id, tagId);
    }

    // タグを削除
    for (const tagId of removedTagIds) {
      await removeplanTag(item.id, tagId);
    }
  };

  // 日時データ変更ハンドラー
  const handleDateTimeChange = () => {
    updatePlan.mutate({
      id: item.id,
      data: {
        due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        start_time:
          selectedDate && startTime
            ? toLocalISOString(format(selectedDate, 'yyyy-MM-dd'), startTime)
            : undefined,
        end_time:
          selectedDate && endTime
            ? toLocalISOString(format(selectedDate, 'yyyy-MM-dd'), endTime)
            : undefined,
        reminder_minutes: reminderTypeToMinutes(reminderType),
      },
    });
  };

  // 日時クリアハンドラー
  const handleDateTimeClear = () => {
    updatePlan.mutate({
      id: item.id,
      data: {
        due_date: undefined,
        start_time: undefined,
        end_time: undefined,
        reminder_minutes: null,
        recurrence_type: 'none',
        recurrence_rule: null,
      },
    });
    setSelectedDate(undefined);
    setStartTime('');
    setEndTime('');
    setReminderType('');
    setDateTimeOpen(false);
  };

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

  const handleClick = () => {
    if (item.type === 'plan') {
      openInspector(item.id);
    }
  };

  // コンテキストメニューアクション
  const handleEdit = (item: InboxItem) => {
    openInspector(item.id);
  };

  const handleDuplicate = (item: InboxItem) => {
    console.log('Duplicate:', item.id);
  };

  const handleAddTags = (item: InboxItem) => {
    console.log('Add tags:', item.id);
  };

  const handleChangeDueDate = (item: InboxItem) => {
    console.log('Change due date:', item.id);
  };

  const handleArchive = (item: InboxItem) => {
    console.log('Archive:', item.id);
  };

  const handleDelete = (item: InboxItem) => {
    console.log('Delete:', item.id);
  };

  return (
    <>
      <ContextMenu
        modal={false}
        onOpenChange={(open) => {
          if (open) {
            // メニューを開いたときにフォーカスを設定
            setFocusedId(item.id);
          } else {
            // メニューを閉じたときにフォーカスをクリア
            setFocusedId(null);
          }
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
              {/* Done チェックボックス */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const effectiveStatus = getEffectiveStatus(item);
                  const newStatus = effectiveStatus === 'done' ? 'todo' : 'done';
                  updatePlan.mutate({
                    id: item.id,
                    data: { status: newStatus },
                  });
                }}
                className="flex-shrink-0 transition-colors hover:opacity-80"
                aria-label={getEffectiveStatus(item) === 'done' ? '未完了に戻す' : '完了にする'}
              >
                {(() => {
                  const status = getEffectiveStatus(item);
                  if (status === 'done') {
                    return <CheckCircle2 className="text-success h-4 w-4" />;
                  }
                  if (status === 'doing') {
                    return <Circle className="text-primary h-4 w-4" />;
                  }
                  // todo
                  return <Circle className="text-muted-foreground h-4 w-4" />;
                })()}
              </button>
              <h3 className="text-foreground min-w-0 text-base leading-tight font-semibold hover:underline">
                {item.title}
              </h3>
              {item.plan_number && (
                <span className="text-muted-foreground shrink-0 text-sm">#{item.plan_number}</span>
              )}
            </div>

            {/* 2. 日付・時間 */}
            <Popover open={dateTimeOpen} onOpenChange={setDateTimeOpen}>
              <PopoverTrigger asChild>
                <div
                  className="text-foreground hover:bg-primary/8 group/date flex w-fit cursor-pointer items-center gap-2 rounded py-0.5 text-sm transition-colors"
                  onClick={(e) => {
                    // カードクリックイベントの伝播を防止
                    e.stopPropagation();
                  }}
                >
                  {getDisplayContent() || (
                    <div className="text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="size-3" />
                      <span>日付を追加</span>
                    </div>
                  )}

                  {/* アイコンコンテナ（Repeat と Reminder を gap-1 でグループ化） */}
                  {(recurrenceRule ||
                    (recurrenceType && recurrenceType !== 'none') ||
                    (reminderType && reminderType !== 'none' && reminderType !== '')) && (
                    <div className="flex items-center gap-1">
                      {/* 繰り返しアイコン（設定時のみ表示・ツールチップ付き） */}
                      <RecurringIndicator
                        recurrenceType={recurrenceType}
                        recurrenceRule={recurrenceRule}
                        size="md"
                        showTooltip
                      />

                      {/* 通知アイコン（設定時のみ表示） */}
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
                onClick={(e) => {
                  // Popover内のクリックイベントがカードに伝播しないようにする
                  e.stopPropagation();
                }}
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
                  onRepeatTypeChange={(type) => {
                    // 型マッピング
                    const typeMap: Record<
                      string,
                      'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'
                    > = {
                      '': 'none',
                      毎日: 'daily',
                      毎週: 'weekly',
                      毎月: 'monthly',
                      毎年: 'yearly',
                      平日: 'weekdays',
                    };
                    const recurrenceType = typeMap[type] || 'none';

                    // optimistic updateがキャッシュを即座に更新
                    updatePlan.mutate({
                      id: item.id,
                      data: {
                        recurrence_type: recurrenceType,
                        recurrence_rule: null,
                      },
                    });
                  }}
                  onRecurrenceRuleChange={(rrule) => {
                    // optimistic updateがキャッシュを即座に更新
                    updatePlan.mutate({
                      id: item.id,
                      data: {
                        recurrence_rule: rrule,
                      },
                    });
                  }}
                />

                {/* アクションボタン */}
                <div className="border-border/50 flex justify-end border-t px-3 py-2">
                  <Button
                    onClick={handleDateTimeClear}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 h-6 px-2 text-xs"
                  >
                    クリア
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* 3. Tags */}
            <PlanTagSelectDialogEnhanced
              selectedTagIds={item.tags?.map((tag) => tag.id) ?? []}
              onTagsChange={handleTagsChange}
            >
              {item.tags && item.tags.length > 0 ? (
                <div
                  className="group/tags flex flex-wrap gap-1"
                  onClick={(e) => {
                    // カードクリックイベントの伝播を防止
                    e.stopPropagation();
                  }}
                >
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="shrink-0 gap-0.5 text-xs font-normal"
                      style={
                        tag.color
                          ? {
                              borderColor: tag.color,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="font-medium"
                        style={tag.color ? { color: tag.color } : undefined}
                      >
                        #
                      </span>
                      {tag.name}
                    </Badge>
                  ))}
                  {item.tags.length > 4 && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      +{item.tags.length - 4}
                    </Badge>
                  )}
                  {/* +アイコン（常時表示） */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/8 text-muted-foreground h-5 w-5 shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                /* タグなしの場合は「タグを追加」 */
                <div
                  className="hover:bg-primary/8 group/tags flex w-fit cursor-pointer flex-wrap gap-1 rounded py-0.5 transition-colors"
                  onClick={(e) => {
                    // カードクリックイベントの伝播を防止
                    e.stopPropagation();
                  }}
                >
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Tag className="size-3" />
                    <span>タグを追加</span>
                  </div>
                </div>
              )}
            </PlanTagSelectDialogEnhanced>
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
    </>
  );
}
