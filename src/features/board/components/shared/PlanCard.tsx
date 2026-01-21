'use client';

import { useCallback, useRef, useState } from 'react';

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
import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { DateTimePopoverContent } from '@/features/plans/components/shared/DateTimePopoverContent';
import { RecurringIndicator } from '@/features/plans/components/shared/RecurringIndicator';
import { TagSelectCombobox } from '@/features/plans/components/shared/TagSelectCombobox';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useplanTags } from '@/features/plans/hooks/usePlanTags';
import { useDeleteConfirmStore } from '@/features/plans/stores/useDeleteConfirmStore';
import { useplanCacheStore } from '@/features/plans/stores/usePlanCacheStore';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '@/features/plans/stores/useRecurringEditConfirmStore';
import { toLocalISOString } from '@/features/plans/utils/datetime';
import { minutesToReminderType, reminderTypeToMinutes } from '@/features/plans/utils/reminder';
import { normalizeStatus } from '@/features/plans/utils/status';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { useTagsMap } from '@/features/tags/hooks/useTagsMap';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { Bell, Calendar as CalendarIcon, CheckCircle2, Circle, Plus, Tag } from 'lucide-react';

import { useBoardFocusStore } from '../../stores/useBoardFocusStore';
import { BoardActionMenuItems } from '../BoardActionMenuItems';

interface PlanCardProps {
  item: PlanItem;
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
  const { updatePlan, deletePlan } = usePlanMutations();
  const { getTagsByIds } = useTagsMap();
  const { getCache } = useplanCacheStore();
  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const openRecurringDialog = useRecurringEditConfirmStore((state) => state.openDialog);
  const { formatDate: formatDateWithSettings, formatTime: formatTimeWithSettings } =
    useDateFormat();
  const isActive = planId === item.id;
  const isFocused = focusedId === item.id;

  // 繰り返しプラン削除用のターゲットをrefで保持
  const recurringDeleteTargetRef = useRef<PlanItem | null>(null);

  // 繰り返しプラン日時編集用のペンディングデータをrefで保持
  const pendingDateTimeEditRef = useRef<{
    type: 'change' | 'clear';
    data?: {
      due_date: string | undefined;
      start_time: string | undefined;
      end_time: string | undefined;
      reminder_minutes: number | null | undefined;
    };
  } | null>(null);

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
  const handleTagsChange = async (newTagIds: string[]) => {
    const currentTagIds = item.tagIds ?? [];
    const addedTagIds = newTagIds.filter((id) => !currentTagIds.includes(id));
    const removedTagIds = currentTagIds.filter((id) => !newTagIds.includes(id));

    // タグを追加
    for (const tagId of addedTagIds) {
      await addplanTag(item.id, tagId);
    }

    // タグを削除
    for (const tagId of removedTagIds) {
      await removeplanTag(item.id, tagId);
    }
  };

  // タグ情報をtagIdsから取得
  const tags = getTagsByIds(item.tagIds ?? []);

  // 日時データ変更ハンドラー
  const handleDateTimeChange = () => {
    const isRecurring =
      item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;

    const updateData = {
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
    };

    if (isRecurring) {
      // 繰り返しプランの場合はスコープ選択ダイアログを表示
      pendingDateTimeEditRef.current = { type: 'change', data: updateData };
      openRecurringDialog(item.title, 'edit', handleRecurringDateTimeEditConfirm);
      return;
    }

    updatePlan.mutate({
      id: item.id,
      data: updateData,
    });
  };

  // 日時クリアハンドラー
  const handleDateTimeClear = () => {
    const isRecurring =
      item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;

    if (isRecurring) {
      // 繰り返しプランの場合はスコープ選択ダイアログを表示
      pendingDateTimeEditRef.current = { type: 'clear' };
      openRecurringDialog(item.title, 'edit', handleRecurringDateTimeEditConfirm);
      return;
    }

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

  // 繰り返しプラン削除確認ハンドラー
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const target = recurringDeleteTargetRef.current;
      if (!target) return;

      try {
        // PlanItemは親プラン（展開されていない）ので、IDがそのまま親プランID
        const parentPlanId = target.id;

        // 繰り返しプランは「すべて削除」のみ有効（個別インスタンスはカレンダーでのみ操作可能）
        // Boardビューでは展開されたインスタンスではなく親プランを表示しているため
        switch (scope) {
          case 'this':
          case 'thisAndFuture':
            // Board/Tableビューでは親プラン表示のため、この選択肢は実質「すべて」と同じ
            // ただしダイアログでは選択肢を表示するため、すべてと同じ動作にする
            await deletePlan.mutateAsync({ id: parentPlanId });
            break;

          case 'all':
            await deletePlan.mutateAsync({ id: parentPlanId });
            break;
        }
      } catch (err) {
        console.error('Failed to delete recurring plan:', err);
      } finally {
        recurringDeleteTargetRef.current = null;
      }
    },
    [deletePlan],
  );

  // 繰り返しプラン日時編集確認ハンドラー
  const handleRecurringDateTimeEditConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const pending = pendingDateTimeEditRef.current;
      if (!pending) return;

      try {
        // Board/Tableビューでは親プラン表示のため、すべてのスコープで親プランを更新
        switch (scope) {
          case 'this':
          case 'thisAndFuture':
          case 'all':
            if (pending.type === 'clear') {
              // 日時クリア
              await updatePlan.mutateAsync({
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
            } else if (pending.data) {
              // 日時変更
              await updatePlan.mutateAsync({
                id: item.id,
                data: pending.data,
              });
            }
            break;
        }
      } catch (err) {
        console.error('Failed to update recurring plan datetime:', err);
      } finally {
        pendingDateTimeEditRef.current = null;
      }
    },
    [updatePlan, item.id],
  );

  // コンテキストメニューアクション
  const handleEdit = (item: PlanItem) => {
    openInspector(item.id);
  };

  const handleDuplicate = (_item: PlanItem) => {
    // Stub: 複製機能は未実装
  };

  const handleAddTags = (_item: PlanItem) => {
    // Stub: タグ追加機能は未実装
  };

  const handleChangeDueDate = (_item: PlanItem) => {
    // Stub: 期限変更機能は未実装
  };

  const handleArchive = (_item: PlanItem) => {
    // Stub: アーカイブ機能は未実装
  };

  const handleDelete = useCallback(
    (item: PlanItem) => {
      // 繰り返しプランの場合はスコープ選択ダイアログを表示
      const isRecurring =
        item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;

      if (isRecurring) {
        recurringDeleteTargetRef.current = item;
        openRecurringDialog(item.title, 'delete', handleRecurringDeleteConfirm);
        return;
      }

      // 通常プラン: 削除確認ダイアログを使用
      openDeleteDialog(item.id, item.title, async () => {
        try {
          await deletePlan.mutateAsync({ id: item.id });
        } catch (err) {
          console.error('Failed to delete plan:', err);
        }
      });
    },
    [deletePlan, openDeleteDialog, openRecurringDialog, handleRecurringDeleteConfirm],
  );

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
                  const currentStatus = normalizeStatus(item.status);
                  const newStatus = currentStatus === 'closed' ? 'open' : 'closed';
                  updatePlan.mutate({
                    id: item.id,
                    data: { status: newStatus },
                  });
                }}
                className="flex-shrink-0 transition-colors hover:opacity-80"
                aria-label={
                  normalizeStatus(item.status) === 'closed' ? '未完了に戻す' : '完了にする'
                }
              >
                {(() => {
                  const status = normalizeStatus(item.status);
                  if (status === 'closed') {
                    return <CheckCircle2 className="text-success h-4 w-4" />;
                  }
                  // open
                  return <Circle className="text-muted-foreground h-4 w-4" />;
                })()}
              </button>
              <h3 className="text-foreground min-w-0 text-base leading-tight font-semibold hover:underline">
                {item.title}
              </h3>
            </div>

            {/* 2. 日付・時間 */}
            <Popover open={dateTimeOpen} onOpenChange={setDateTimeOpen}>
              <PopoverTrigger asChild>
                <div
                  className="text-foreground hover:bg-primary-state-hover group/date flex w-fit cursor-pointer items-center gap-2 rounded py-0.5 text-sm transition-colors"
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
                <div
                  className="group/tags flex flex-wrap gap-1"
                  onClick={(e) => {
                    // カードクリックイベントの伝播を防止
                    e.stopPropagation();
                  }}
                >
                  {tags.slice(0, 4).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="shrink-0 text-xs font-normal"
                      style={
                        tag.color
                          ? {
                              borderColor: tag.color,
                            }
                          : undefined
                      }
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {tags.length > 4 && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      +{tags.length - 4}
                    </Badge>
                  )}
                  {/* +アイコン（常時表示） */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary-state-hover text-muted-foreground h-5 w-5 shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                /* タグなしの場合は「タグを追加」 */
                <div
                  className="hover:bg-primary-state-hover group/tags flex w-fit cursor-pointer flex-wrap gap-1 rounded py-0.5 transition-colors"
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
    </>
  );
}
