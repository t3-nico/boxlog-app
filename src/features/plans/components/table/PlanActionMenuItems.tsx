'use client';

import {
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardCopy,
  Copy,
  Pencil,
  Tag,
  Trash2,
} from 'lucide-react';

import type { PlanStatus } from '@/features/plans/types/plan';

import { ActionMenuItems, type ActionGroup } from './ActionMenuItems';

import type { PlanItem } from '../../hooks/usePlanData';

interface PlanActionMenuItemsProps {
  item: PlanItem;
  /** メニュー項目をレンダリングするための関数 */
  renderMenuItem: (props: {
    key?: string | undefined;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | undefined;
    disabled?: boolean | undefined;
  }) => React.ReactNode;
  /** セパレーターをレンダリングするための関数 */
  renderSeparator?: (() => React.ReactNode) | undefined;
  /** アクションハンドラー */
  onEdit?: ((item: PlanItem) => void) | undefined;
  onDuplicate?: ((item: PlanItem) => void) | undefined;
  onCopy?: ((item: PlanItem) => void) | undefined;
  onAddTags?: ((item: PlanItem) => void) | undefined;
  onChangeDueDate?: ((item: PlanItem) => void) | undefined;
  onStatusChange?: ((item: PlanItem, status: PlanStatus) => void) | undefined;
  onDelete: (item: PlanItem) => void;
}

/**
 * Planアクションメニュー項目（共通ActionMenuItemsのラッパー）
 *
 * ContextMenuとDropdownMenuの両方で使用できる共通のメニュー項目
 * renderMenuItem関数を使って、各メニューシステムに対応
 */
export function PlanActionMenuItems({
  item,
  renderMenuItem,
  renderSeparator,
  onEdit,
  onDuplicate,
  onCopy,
  onAddTags,
  onChangeDueDate,
  onStatusChange,
  onDelete,
}: PlanActionMenuItemsProps) {
  const groups: ActionGroup<PlanItem>[] = [];

  // 編集・複製・コピー・タグ・期限グループ
  const editActions = [];
  if (onEdit) {
    editActions.push({
      key: 'edit',
      icon: <Pencil className="mr-2 size-4" />,
      label: '編集',
      onClick: onEdit,
    });
  }
  if (onDuplicate) {
    editActions.push({
      key: 'duplicate',
      icon: <Copy className="mr-2 size-4" />,
      label: '複製',
      onClick: onDuplicate,
    });
  }
  if (onCopy) {
    editActions.push({
      key: 'copy',
      icon: <ClipboardCopy className="mr-2 size-4" />,
      label: 'コピー',
      onClick: onCopy,
    });
  }
  if (onAddTags) {
    editActions.push({
      key: 'add-tags',
      icon: <Tag className="mr-2 size-4" />,
      label: 'タグを追加',
      onClick: onAddTags,
    });
  }
  if (onChangeDueDate) {
    editActions.push({
      key: 'change-due-date',
      icon: <Calendar className="mr-2 size-4" />,
      label: '期限を設定',
      onClick: onChangeDueDate,
    });
  }

  if (editActions.length > 0) {
    groups.push({
      key: 'edit',
      actions: editActions,
    });
  }

  // ステータス変更グループ
  if (onStatusChange) {
    const statusActions = [];
    // 現在のステータスと逆のオプションを表示
    if (item.status !== 'open') {
      statusActions.push({
        key: 'status-open',
        icon: <Circle className="mr-2 size-4" />,
        label: 'Open',
        onClick: (i: PlanItem) => onStatusChange(i, 'open'),
      });
    }
    if (item.status !== 'closed') {
      statusActions.push({
        key: 'status-closed',
        icon: <CheckCircle2 className="text-success mr-2 size-4" />,
        label: 'Closed',
        onClick: (i: PlanItem) => onStatusChange(i, 'closed'),
      });
    }
    if (statusActions.length > 0) {
      groups.push({
        key: 'status',
        actions: statusActions,
      });
    }
  }

  // 削除グループ
  groups.push({
    key: 'danger',
    actions: [
      {
        key: 'delete',
        icon: <Trash2 className="mr-2 size-4" />,
        label: '削除',
        onClick: onDelete,
        variant: 'destructive' as const,
      },
    ],
  });

  return (
    <ActionMenuItems
      item={item}
      groups={groups}
      renderMenuItem={renderMenuItem}
      renderSeparator={renderSeparator}
    />
  );
}
