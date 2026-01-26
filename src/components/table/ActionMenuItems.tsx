'use client';

import type { ReactNode } from 'react';

import {
  ActionMenuItems as BaseActionMenuItems,
  type ActionGroup,
} from '@/components/common/ActionMenuItems';

interface ActionMenuItemsProps<T> {
  /** 対象アイテム */
  item: T;
  /** アクショングループの配列 */
  groups: ActionGroup<T>[];
  /** メニュー項目をレンダリングするための関数 */
  renderMenuItem: (props: {
    key?: string | undefined;
    icon: ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | undefined;
    disabled?: boolean | undefined;
  }) => ReactNode;
  /** セパレーターをレンダリングするための関数 */
  renderSeparator?: (() => ReactNode) | undefined;
}

/**
 * 汎用アクションメニュー項目
 *
 * ContextMenuとDropdownMenuの両方で使用できる共通のメニュー項目
 * renderMenuItem関数を使って、各メニューシステムに対応
 *
 * @example
 * ```tsx
 * <ActionMenuItems
 *   item={selectedItem}
 *   groups={[
 *     {
 *       key: 'edit',
 *       actions: [
 *         {
 *           key: 'edit',
 *           icon: <Pencil className="mr-2 size-4" />,
 *           label: '編集',
 *           onClick: (item) => handleEdit(item),
 *         },
 *       ],
 *     },
 *     {
 *       key: 'danger',
 *       actions: [
 *         {
 *           key: 'delete',
 *           icon: <Trash2 className="mr-2 size-4" />,
 *           label: '削除',
 *           onClick: (item) => handleDelete(item),
 *           variant: 'destructive',
 *         },
 *       ],
 *     },
 *   ]}
 *   renderMenuItem={({ icon, label, onClick, variant }) => (
 *     <DropdownMenuItem
 *       onClick={onClick}
 *       className={variant === 'destructive' ? 'text-destructive' : ''}
 *     >
 *       {icon}
 *       {label}
 *     </DropdownMenuItem>
 *   )}
 *   renderSeparator={() => <DropdownMenuSeparator />}
 * />
 * ```
 */
export function ActionMenuItems<T>({
  item,
  groups,
  renderMenuItem,
  renderSeparator,
}: ActionMenuItemsProps<T>) {
  return (
    <BaseActionMenuItems
      item={item}
      groups={groups}
      renderMenuItem={renderMenuItem}
      renderSeparator={renderSeparator}
    />
  );
}

// 型をre-export
export type { ActionGroup };
