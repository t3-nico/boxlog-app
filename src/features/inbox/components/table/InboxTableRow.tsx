'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { parseDatetimeString } from '@/features/calendar/utils/dateUtils';
import type { RecurringEditScope } from '@/features/plans/components/RecurringEditConfirmDialog';
import { RecurringIndicator } from '@/features/plans/components/shared/RecurringIndicator';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { useplanTags } from '@/features/plans/hooks/usePlanTags';
import { useDeleteConfirmStore } from '@/features/plans/stores/useDeleteConfirmStore';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useRecurringEditConfirmStore } from '@/features/plans/stores/useRecurringEditConfirmStore';
import type { PlanStatus } from '@/features/plans/types/plan';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef } from 'react';
import type { InboxItem } from '../../hooks/useInboxData';
import { useInboxColumnStore } from '../../stores/useInboxColumnStore';
import { useInboxFocusStore } from '../../stores/useInboxFocusStore';
import { useInboxSelectionStore } from '../../stores/useInboxSelectionStore';
import { DateTimeUnifiedCell } from './DateTimeUnifiedCell';
import { InboxActionMenuItems } from './InboxActionMenuItems';
import { StatusEditCell } from './StatusEditCell';
import { TagsCell } from './TagsCell';

interface InboxTableRowProps {
  /** 表示するInboxアイテム */
  item: InboxItem;
}

/**
 * Inboxテーブル行コンポーネント
 *
 * 行の表示ロジックを独立したコンポーネントに分離
 * - Inspector表示
 * - 日付フォーマット
 * - タグ表示
 * - アクションメニュー
 *
 * @example
 * ```tsx
 * <InboxTableRow item={item} />
 * ```
 */
export function InboxTableRow({ item }: InboxTableRowProps) {
  const { openInspector } = usePlanInspectorStore();
  const { isSelected, setSelectedIds } = useInboxSelectionStore();
  const { getVisibleColumns } = useInboxColumnStore();
  const { focusedId, setFocusedId } = useInboxFocusStore();
  const { updatePlan, deletePlan } = usePlanMutations();
  const { addplanTag, removeplanTag } = useplanTags();
  const openDeleteDialog = useDeleteConfirmStore((state) => state.openDialog);
  const openRecurringDialog = useRecurringEditConfirmStore((state) => state.openDialog);
  const { formatDate: formatDateWithSettings, formatTime: formatTimeWithSettings } =
    useDateFormat();

  const rowRef = useRef<HTMLTableRowElement>(null);
  const recurringDeleteTargetRef = useRef<InboxItem | null>(null);
  // 繰り返しプラン編集用のペンディングデータをrefで保持
  const pendingEditRef = useRef<
    | {
        type: 'status';
        data: { status: PlanStatus };
      }
    | {
        type: 'datetime';
        data: { start_time: string | undefined; end_time: string | undefined };
      }
    | null
  >(null);
  const selected = isSelected(item.id);
  const isFocused = focusedId === item.id;
  const visibleColumns = getVisibleColumns();

  const handleTagsChange = async (tagIds: string[]) => {
    const currentTagIds = item.tags?.map((tag) => tag.id) ?? [];
    const addedTagIds = tagIds.filter((id) => !currentTagIds.includes(id));
    const removedTagIds = currentTagIds.filter((id) => !tagIds.includes(id));

    // NOTE: 現在は個別にタグを追加・削除していますが、
    // 将来的には一括設定API（setplanTags）を使用して効率化する予定です。
    // 一括設定APIは、現在のタグをすべて削除してから新しいタグを設定するため、
    // 複数のタグ変更を1回のAPIコールで完了できます。

    // タグを追加
    for (const tagId of addedTagIds) {
      await addplanTag(item.id, tagId);
    }

    // タグを削除
    for (const tagId of removedTagIds) {
      await removeplanTag(item.id, tagId);
    }
  };

  // 繰り返しプラン削除確認ハンドラー
  const handleRecurringDeleteConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const target = recurringDeleteTargetRef.current;
      if (!target) return;

      try {
        const parentPlanId = target.id;

        // Board/Tableビューでは親プラン表示のため、すべてのスコープで親プランを削除
        switch (scope) {
          case 'this':
          case 'thisAndFuture':
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

  // 繰り返しプラン編集確認ハンドラー
  const handleRecurringEditConfirm = useCallback(
    async (scope: RecurringEditScope) => {
      const pending = pendingEditRef.current;
      if (!pending) return;

      try {
        // Board/Tableビューでは親プラン表示のため、すべてのスコープで親プランを更新
        switch (scope) {
          case 'this':
          case 'thisAndFuture':
          case 'all':
            if (pending.type === 'status' && pending.data.status) {
              await updatePlan.mutateAsync({
                id: item.id,
                data: { status: pending.data.status },
              });
            } else if (pending.type === 'datetime') {
              await updatePlan.mutateAsync({
                id: item.id,
                data: {
                  start_time: pending.data.start_time || undefined,
                  end_time: pending.data.end_time || undefined,
                },
              });
            }
            break;
        }
      } catch (err) {
        console.error('Failed to update recurring plan:', err);
      } finally {
        pendingEditRef.current = null;
      }
    },
    [updatePlan, item.id],
  );

  // インライン編集ハンドラー
  const handleStatusChange = (status: PlanStatus) => {
    const isRecurring =
      item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;

    if (isRecurring) {
      // 繰り返しプランの場合はスコープ選択ダイアログを表示
      pendingEditRef.current = { type: 'status', data: { status } };
      openRecurringDialog(item.title, 'edit', handleRecurringEditConfirm);
      return;
    }

    updatePlan.mutate({
      id: item.id,
      data: { status },
    });
  };

  // 日時変更ハンドラー（DateTimeUnifiedCell用）
  const handleDateTimeChange = (data: {
    date: string | null;
    startTime: string | null;
    endTime: string | null;
  }) => {
    const isRecurring =
      item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;

    // 日付+時刻をISO 8601形式に変換
    const startTime = data.date && data.startTime ? `${data.date}T${data.startTime}:00Z` : null;
    const endTime = data.date && data.endTime ? `${data.date}T${data.endTime}:00Z` : null;

    if (isRecurring) {
      // 繰り返しプランの場合はスコープ選択ダイアログを表示
      pendingEditRef.current = {
        type: 'datetime',
        data: {
          start_time: startTime || undefined,
          end_time: endTime || undefined,
        },
      };
      openRecurringDialog(item.title, 'edit', handleRecurringEditConfirm);
      return;
    }

    updatePlan.mutate({
      id: item.id,
      data: {
        start_time: startTime || undefined,
        end_time: endTime || undefined,
      },
    });
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

  const handleDelete = useCallback(
    (item: InboxItem) => {
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

  // フォーカスされた行をスクロールして表示
  useEffect(() => {
    if (isFocused && rowRef.current) {
      rowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused]);

  // 列IDをキーにセルをレンダリング
  const renderCell = (columnId: string) => {
    // 列情報を取得して幅を適用
    const column = visibleColumns.find((col) => col.id === columnId);
    const style = column
      ? { width: `${column.width}px`, minWidth: `${column.width}px`, maxWidth: `${column.width}px` }
      : undefined;

    switch (columnId) {
      case 'selection':
        return (
          <TableCell key={columnId} onClick={(e) => e.stopPropagation()} style={style}>
            <Checkbox
              checked={selected}
              onCheckedChange={() => {
                if (selected) {
                  // 選択解除: 選択済みIDから削除
                  const newSelection = Array.from(
                    useInboxSelectionStore.getState().getSelectedIds(),
                  ).filter((id) => id !== item.id);
                  setSelectedIds(newSelection);
                } else {
                  // 選択: 選択済みIDに追加
                  const newSelection = [
                    ...Array.from(useInboxSelectionStore.getState().getSelectedIds()),
                    item.id,
                  ];
                  setSelectedIds(newSelection);
                }
              }}
            />
          </TableCell>
        );

      case 'title': {
        const isRecurring =
          item.recurrence_type && item.recurrence_type !== 'none' && item.recurrence_type !== null;
        return (
          <TableCell key={columnId} className="font-medium" style={style}>
            <div className="group flex cursor-pointer items-center gap-2 overflow-hidden">
              <span className="min-w-0 truncate group-hover:underline">{item.title}</span>
              {isRecurring && item.recurrence_type && (
                <RecurringIndicator
                  recurrenceType={item.recurrence_type}
                  recurrenceRule={item.recurrence_rule ?? null}
                  size="sm"
                  showTooltip
                />
              )}
            </div>
          </TableCell>
        );
      }

      case 'status':
        return (
          <StatusEditCell
            key={columnId}
            status={item.status}
            width={column?.width}
            onStatusChange={handleStatusChange}
          />
        );

      case 'tags':
        return (
          <TagsCell
            key={columnId}
            tags={item.tags ?? []}
            width={column?.width}
            onTagsChange={handleTagsChange}
          />
        );

      case 'duration':
        return (
          <DateTimeUnifiedCell
            key={columnId}
            data={{
              date: item.start_time
                ? parseDatetimeString(item.start_time).toISOString().split('T')[0]!
                : null,
              startTime: item.start_time
                ? formatTimeWithSettings(parseDatetimeString(item.start_time))
                : null,
              endTime: item.end_time
                ? formatTimeWithSettings(parseDatetimeString(item.end_time))
                : null,
              reminder: null,
              recurrence: null,
            }}
            {...(column?.width !== undefined && { width: column.width })}
            onChange={handleDateTimeChange}
          />
        );

      case 'created_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm" style={style}>
            {formatDateWithSettings(new Date(item.created_at))}
          </TableCell>
        );

      case 'updated_at':
        return (
          <TableCell key={columnId} className="text-muted-foreground text-sm" style={style}>
            {formatDateWithSettings(new Date(item.updated_at))}
          </TableCell>
        );

      default:
        return null;
    }
  };

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <TableRow
          ref={rowRef}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', item.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          className={cn(
            'hover:bg-state-hover cursor-pointer transition-colors',
            selected && 'bg-primary-state-selected hover:bg-state-dragged',
            isFocused && 'ring-primary ring-2 ring-inset',
          )}
          onClick={() => {
            openInspector(item.id);
            setFocusedId(item.id);
          }}
          onContextMenu={() => {
            // 右クリックされた行を選択（Tagsテーブルと同様）
            if (!selected) {
              setSelectedIds([item.id]);
            }
          }}
        >
          {visibleColumns.map((column) => renderCell(column.id))}
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <InboxActionMenuItems
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
