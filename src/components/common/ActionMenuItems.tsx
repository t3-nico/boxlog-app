'use client'

import type { ReactNode } from 'react'

/**
 * メニューアクション定義
 */
export interface MenuAction<T = any> {
  /** アクションのキー */
  key: string
  /** アイコン */
  icon: ReactNode
  /** ラベル */
  label: string
  /** クリック時の処理 */
  onClick: (item: T) => void
  /** 表示スタイル */
  variant?: 'default' | 'destructive'
  /** 無効化フラグ */
  disabled?: boolean
}

/**
 * サブメニューアクション定義
 */
export interface SubMenuAction<T = any> {
  /** サブメニューのキー */
  key: string
  /** トリガー情報 */
  trigger: {
    icon: ReactNode
    label: string
  }
  /** サブメニュー項目 */
  items: Array<{
    key: string
    icon?: ReactNode
    label: string
    onClick: (item: T) => void
  }>
}

/**
 * アクショングループ定義
 */
export interface ActionGroup<T = any> {
  /** グループのキー */
  key: string
  /** 通常アクション */
  actions?: MenuAction<T>[]
  /** サブメニューアクション */
  subMenus?: SubMenuAction<T>[]
}

/**
 * ActionMenuItemsのProps
 */
export interface ActionMenuItemsProps<T = any> {
  /** 対象アイテム */
  item: T
  /** アクショングループのリスト */
  groups: ActionGroup<T>[]
  /** メニュー項目をレンダリングするための関数 */
  renderMenuItem: (props: {
    key?: string
    icon: ReactNode
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive'
    disabled?: boolean
  }) => ReactNode
  /** サブメニューをレンダリングするための関数（オプション） */
  renderSubMenu?: (props: {
    trigger: { icon: ReactNode; label: string }
    items: Array<{
      key: string
      icon?: ReactNode
      label: string
      onClick: () => void
    }>
  }) => ReactNode
  /** セパレーターをレンダリングするための関数（オプション） */
  renderSeparator?: () => ReactNode
}

/**
 * 共通アクションメニュー項目
 *
 * ContextMenuとDropdownMenuの両方で使用できる共通のメニュー項目
 * すべてのページ（Tags, Inbox, 将来のページ）で再利用可能
 *
 * @example
 * ```tsx
 * <ActionMenuItems
 *   item={tag}
 *   groups={[
 *     {
 *       key: 'edit',
 *       actions: [
 *         { key: 'view', icon: <Eye />, label: '表示', onClick: (item) => onView(item) },
 *         { key: 'edit', icon: <Pencil />, label: '編集', onClick: (item) => onEdit(item) },
 *       ]
 *     },
 *     {
 *       key: 'danger',
 *       actions: [
 *         { key: 'delete', icon: <Trash2 />, label: '削除', onClick: (item) => onDelete(item), variant: 'destructive' },
 *       ]
 *     }
 *   ]}
 *   renderMenuItem={({ icon, label, onClick, variant }) => (
 *     <ContextMenuItem onClick={onClick} className={variant === 'destructive' ? 'text-destructive' : ''}>
 *       {icon}
 *       {label}
 *     </ContextMenuItem>
 *   )}
 *   renderSeparator={() => <ContextMenuSeparator />}
 * />
 * ```
 */
export function ActionMenuItems<T = any>({
  item,
  groups,
  renderMenuItem,
  renderSubMenu,
  renderSeparator,
}: ActionMenuItemsProps<T>) {
  const elements: ReactNode[] = []

  groups.forEach((group, groupIndex) => {
    // 通常アクション
    if (group.actions) {
      group.actions.forEach((action) => {
        elements.push(
          renderMenuItem({
            key: action.key,
            icon: action.icon,
            label: action.label,
            onClick: () => action.onClick(item),
            variant: action.variant,
            disabled: action.disabled,
          })
        )
      })
    }

    // サブメニューアクション
    if (group.subMenus && renderSubMenu) {
      group.subMenus.forEach((subMenu) => {
        elements.push(
          renderSubMenu({
            trigger: subMenu.trigger,
            items: subMenu.items.map((subItem) => ({
              key: subItem.key,
              icon: subItem.icon,
              label: subItem.label,
              onClick: () => subItem.onClick(item),
            })),
          })
        )
      })
    }

    // セパレーター（最後のグループ以外）
    if (renderSeparator && groupIndex < groups.length - 1) {
      elements.push(renderSeparator())
    }
  })

  return <>{elements}</>
}
