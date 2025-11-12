'use client'

import { Archive, Eye, Folder, Pencil, Trash2 } from 'lucide-react'

import type { TagGroup, TagWithChildren } from '@/types/tags'

interface TagActionMenuItemsProps {
  tag: TagWithChildren
  groups: TagGroup[]
  onView?: (tag: TagWithChildren) => void
  onEdit?: (tag: TagWithChildren) => void
  onMoveToGroup: (tag: TagWithChildren, groupId: string | null) => void
  onArchive?: (tag: TagWithChildren) => void
  onDelete: (tag: TagWithChildren) => void
  t: (key: string) => string
  /** メニュー項目をレンダリングするための関数 */
  renderMenuItem: (props: {
    key?: string
    icon: React.ReactNode
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive'
    disabled?: boolean
  }) => React.ReactNode
  /** サブメニューをレンダリングするための関数 */
  renderSubMenu?: (props: {
    trigger: { icon: React.ReactNode; label: string }
    items: Array<{
      key: string
      icon?: React.ReactNode
      label: string
      onClick: () => void
    }>
  }) => React.ReactNode
}

/**
 * タグアクションメニュー項目（共通）
 *
 * ContextMenuとDropdownMenuの両方で使用できる共通のメニュー項目
 * renderMenuItem関数とrenderSubMenu関数を使って、各メニューシステムに対応
 */
export function TagActionMenuItems({
  tag,
  groups,
  onView,
  onEdit,
  onMoveToGroup,
  onArchive,
  onDelete,
  t,
  renderMenuItem,
  renderSubMenu,
}: TagActionMenuItemsProps) {
  const menuItems = []

  // 表示
  if (onView) {
    menuItems.push(
      renderMenuItem({
        key: 'view',
        icon: <Eye className="mr-2 h-4 w-4" />,
        label: t('common.view'),
        onClick: () => onView(tag),
      })
    )
  }

  // 編集
  if (onEdit) {
    menuItems.push(
      renderMenuItem({
        key: 'edit',
        icon: <Pencil className="mr-2 h-4 w-4" />,
        label: t('tags.page.edit'),
        onClick: () => onEdit(tag),
      })
    )
  }

  // グループに移動
  if (renderSubMenu && groups.length > 0) {
    menuItems.push(
      renderSubMenu({
        trigger: {
          icon: <Folder className="mr-2 h-4 w-4" />,
          label: t('tags.page.moveToGroup'),
        },
        items: [
          {
            key: 'no-group',
            label: t('tags.page.noGroup'),
            onClick: () => onMoveToGroup(tag, null),
          },
          ...groups.map((group) => ({
            key: group.id,
            icon: <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: group.color || '#6B7280' }} />,
            label: group.name,
            onClick: () => onMoveToGroup(tag, group.id),
          })),
        ],
      })
    )
  }

  // アーカイブ
  if (onArchive) {
    menuItems.push(
      renderMenuItem({
        key: 'archive',
        icon: <Archive className="mr-2 h-4 w-4" />,
        label: t('tags.page.archive'),
        onClick: () => onArchive(tag),
      })
    )
  }

  // 完全削除
  menuItems.push(
    renderMenuItem({
      key: 'delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      label: t('tags.page.permanentDelete'),
      onClick: () => onDelete(tag),
      variant: 'destructive',
    })
  )

  return <>{menuItems}</>
}
