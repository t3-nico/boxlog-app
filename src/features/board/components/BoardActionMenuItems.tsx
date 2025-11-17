'use client'

import { Archive, Calendar, Copy, Pencil, Tag, Trash2 } from 'lucide-react'

import { ActionMenuItems, type ActionGroup } from '@/components/common/ActionMenuItems'

import type { InboxItem } from '@/features/inbox/hooks/useInboxData'

interface BoardActionMenuItemsProps {
  item: InboxItem
  /** メニュー項目をレンダリングするための関数 */
  renderMenuItem: (props: {
    key?: string
    icon: React.ReactNode
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive'
    disabled?: boolean
  }) => React.ReactNode
  /** セパレーターをレンダリングするための関数 */
  renderSeparator?: () => React.ReactNode
  /** アクションハンドラー */
  onEdit?: (item: InboxItem) => void
  onDuplicate?: (item: InboxItem) => void
  onAddTags?: (item: InboxItem) => void
  onChangeDueDate?: (item: InboxItem) => void
  onArchive?: (item: InboxItem) => void
  onDelete: (item: InboxItem) => void
}

/**
 * Boardアクションメニュー項目（共通ActionMenuItemsのラッパー）
 *
 * ContextMenuとDropdownMenuの両方で使用できる共通のメニュー項目
 * renderMenuItem関数を使って、各メニューシステムに対応
 */
export function BoardActionMenuItems({
  item,
  renderMenuItem,
  renderSeparator,
  onEdit,
  onDuplicate,
  onAddTags,
  onChangeDueDate,
  onArchive,
  onDelete,
}: BoardActionMenuItemsProps) {
  const groups: ActionGroup<InboxItem>[] = []

  // 編集・複製・タグ・期限グループ
  const editActions = []
  if (onEdit) {
    editActions.push({
      key: 'edit',
      icon: <Pencil className="mr-2 size-4" />,
      label: '編集',
      onClick: onEdit,
    })
  }
  if (onDuplicate) {
    editActions.push({
      key: 'duplicate',
      icon: <Copy className="mr-2 size-4" />,
      label: '複製',
      onClick: onDuplicate,
    })
  }
  if (onAddTags) {
    editActions.push({
      key: 'add-tags',
      icon: <Tag className="mr-2 size-4" />,
      label: 'タグを追加',
      onClick: onAddTags,
    })
  }
  if (onChangeDueDate) {
    editActions.push({
      key: 'change-due-date',
      icon: <Calendar className="mr-2 size-4" />,
      label: '期限を設定',
      onClick: onChangeDueDate,
    })
  }

  if (editActions.length > 0) {
    groups.push({
      key: 'edit',
      actions: editActions,
    })
  }

  // アーカイブ・削除グループ
  const dangerActions = []
  if (onArchive) {
    dangerActions.push({
      key: 'archive',
      icon: <Archive className="mr-2 size-4" />,
      label: 'アーカイブ',
      onClick: onArchive,
    })
  }
  dangerActions.push({
    key: 'delete',
    icon: <Trash2 className="mr-2 size-4" />,
    label: '削除',
    onClick: onDelete,
    variant: 'destructive' as const,
  })

  groups.push({
    key: 'danger',
    actions: dangerActions,
  })

  return (
    <ActionMenuItems item={item} groups={groups} renderMenuItem={renderMenuItem} renderSeparator={renderSeparator} />
  )
}
