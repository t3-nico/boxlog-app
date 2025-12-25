'use client';

import { Archive, Eye, Folder, FolderX, GitMerge, Pencil, Trash2 } from 'lucide-react';

import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors';
import type { Tag, TagGroup } from '@/features/tags/types';

interface TagActionMenuItemsProps {
  tag: Tag;
  groups: TagGroup[];
  onView?: (tag: Tag) => void;
  onEdit?: (tag: Tag) => void;
  onMoveToGroup: (tag: Tag, groupId: string | null) => void;
  onMerge?: (tag: Tag) => void;
  onArchive?: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  t: (key: string) => string;
  /** メニュー項目をレンダリングするための関数 */
  renderMenuItem: (props: {
    key?: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
  }) => React.ReactNode;
  /** サブメニューをレンダリングするための関数 */
  renderSubMenu?: (props: {
    trigger: { icon: React.ReactNode; label: string };
    items: Array<{
      key: string;
      icon?: React.ReactNode;
      label: string;
      onClick: () => void;
    }>;
  }) => React.ReactNode;
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
  onMerge,
  onArchive,
  onDelete,
  t,
  renderMenuItem,
  renderSubMenu,
}: TagActionMenuItemsProps) {
  const menuItems = [];

  // 表示
  if (onView) {
    menuItems.push(
      renderMenuItem({
        key: 'view',
        icon: <Eye className="mr-2 h-4 w-4" />,
        label: t('common.view'),
        onClick: () => onView(tag),
      }),
    );
  }

  // 編集
  if (onEdit) {
    menuItems.push(
      renderMenuItem({
        key: 'edit',
        icon: <Pencil className="mr-2 h-4 w-4" />,
        label: t('tag.page.edit'),
        onClick: () => onEdit(tag),
      }),
    );
  }

  // グループに移動
  if (renderSubMenu && groups.length > 0) {
    menuItems.push(
      renderSubMenu({
        trigger: {
          icon: <Folder className="mr-2 h-4 w-4" />,
          label: t('tag.page.moveToGroup'),
        },
        items: [
          {
            key: 'no-group',
            icon: <FolderX className="text-muted-foreground mr-2 h-4 w-4" />,
            label: t('tag.page.noGroup'),
            onClick: () => onMoveToGroup(tag, null),
          },
          ...groups.map((group) => ({
            key: group.id,
            icon: (
              <Folder
                className="mr-2 h-4 w-4"
                style={{ color: group.color || DEFAULT_GROUP_COLOR }}
              />
            ),
            label: group.name,
            onClick: () => onMoveToGroup(tag, group.id),
          })),
        ],
      }),
    );
  }

  // マージ
  if (onMerge) {
    menuItems.push(
      renderMenuItem({
        key: 'merge',
        icon: <GitMerge className="mr-2 h-4 w-4" />,
        label: t('tags.merge.title'),
        onClick: () => onMerge(tag),
      }),
    );
  }

  // アーカイブ
  if (onArchive) {
    menuItems.push(
      renderMenuItem({
        key: 'archive',
        icon: <Archive className="mr-2 h-4 w-4" />,
        label: t('tag.page.archive'),
        onClick: () => onArchive(tag),
      }),
    );
  }

  // 完全削除
  menuItems.push(
    renderMenuItem({
      key: 'delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      label: t('tag.page.permanentDelete'),
      onClick: () => onDelete(tag),
      variant: 'destructive',
    }),
  );

  return <>{menuItems}</>;
}
