'use client';

import { useCallback, useState } from 'react';

import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal as EllipsisHorizontalIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Tag as TagIcon,
  Trash2 as TrashIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors';
import { useTagStore } from '@/features/tags/stores/useTagStore';
import { Tag } from '@/features/tags/types';
import { useActiveState } from '@/hooks/useActiveState';
import { useTranslations } from 'next-intl';
import { tagIconMapping, TagIconName } from '../constants/icons';

import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { useTagModalNavigation } from '../hooks/useTagModalNavigation';

interface TagsListProps {
  collapsed?: boolean;
  onSelectTag?: (tagId: string) => void;
  selectedTagIds?: string[];
}

interface TagItemProps {
  tag: Tag;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isCollapsed: boolean;
  hasChildren: boolean;
  onToggleExpanded: (tagId: string) => void;
  onSelectTag: (tagId: string) => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tag: Tag) => void;
}

const TagItem = ({
  tag,
  level,
  isExpanded,
  isSelected: _isSelected,
  isCollapsed,
  hasChildren,
  onToggleExpanded,
  onSelectTag,
  onEditTag,
  onDeleteTag,
}: TagItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isTagActive } = useActiveState();

  const isActive = isTagActive(tag.id);
  const paddingLeft = level === 0 ? 8 : level * 16 + 16; // 階層インデント調整（トップレベルにも8px追加）

  const handleToggleExpanded = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (hasChildren) {
        onToggleExpanded(tag.id);
      }
    },
    [hasChildren, onToggleExpanded, tag.id],
  );

  const handleSelectTag = useCallback(() => {
    onSelectTag(tag.id);
    setShowMenu(false);
  }, [onSelectTag, tag.id]);

  // jsx-no-bind optimization handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelectTag();
      }
    },
    [handleSelectTag],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setShowMenu(!showMenu);
    },
    [showMenu],
  );

  const handleMenuButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMenu(!showMenu);
    },
    [showMenu],
  );

  const handleEditTag = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEditTag(tag);
      setShowMenu(false);
    },
    [onEditTag, tag],
  );

  const handleDeleteTag = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteTag(tag);
      setShowMenu(false);
    },
    [onDeleteTag, tag],
  );

  return (
    <div className="space-y-2">
      {/* タグアイテム */}
      <div
        className="hover:bg-state-hover flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors duration-150"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleSelectTag}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* 展開/折りたたみアイコンまたはスペーサー */}
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
            {hasChildren === true && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleExpanded}
                className="tag-toggle-button z-10"
                style={{ '--tag-color': tag.color || DEFAULT_TAG_COLOR } as React.CSSProperties}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="text-muted-foreground h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="text-muted-foreground h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* タグアイコン */}
          {(() => {
            // 子タグを持つ場合はフォルダアイコン、それ以外は通常のタグアイコン
            const IconComponent = hasChildren
              ? isExpanded
                ? FolderOpenIcon
                : FolderIcon
              : tag.icon && tagIconMapping[tag.icon as TagIconName]
                ? tagIconMapping[tag.icon as TagIconName]
                : TagIcon;
            return (
              <div
                className="relative"
                style={{ '--tag-color': tag.color || DEFAULT_TAG_COLOR } as React.CSSProperties}
              >
                <IconComponent
                  className="tag-icon h-4 w-4 flex-shrink-0"
                  style={
                    {
                      color: tag.color || DEFAULT_TAG_COLOR,
                      '--tag-color': tag.color || DEFAULT_TAG_COLOR,
                    } as React.CSSProperties
                  }
                />
              </div>
            );
          })()}

          {/* タグ名 */}
          {!isCollapsed && (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="text-foreground truncate text-sm font-normal" title={tag.name}>
                {tag.name}
              </span>
              {/* アクティブドット */}
              {isActive ? (
                <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
              ) : null}
            </div>
          )}
        </div>

        {/* メニュー */}
        {!isCollapsed && (
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleMenuButtonClick}
              className={`tag-menu-button transition-all ${isHovered || showMenu ? 'opacity-100' : 'opacity-0'}`}
              style={{ '--tag-color': tag.color || DEFAULT_TAG_COLOR } as React.CSSProperties}
            >
              <EllipsisHorizontalIcon className="text-muted-foreground h-4 w-4" />
            </Button>

            {/* コンテキストメニュー */}
            {showMenu != null && (
              <div className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-1 min-w-36 rounded-lg border py-1 shadow-lg">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleEditTag}
                  className="text-foreground flex w-full justify-start gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  編集
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDeleteTag}
                  className="text-destructive hover:bg-destructive-state-hover flex w-full justify-start gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  削除
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 子タグは親コンポーネントで管理 */}
    </div>
  );
};

export const TagsList = ({
  collapsed = false,
  onSelectTag = () => {},
  selectedTagIds = [],
}: TagsListProps) => {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);

  // Zustandストアからデータを取得
  const tags = useTagStore((state) => state.tags);
  // State management tracked in Issue #89
  const [_expandedTags, setExpandedTags] = useState<string[]>([]);
  const toggleTagExpansion = useCallback((tagId: string) => {
    setExpandedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }, []);

  // 表示するタグリストを計算（フラット構造）
  const displayTags = useCallback(() => {
    return tags.map((tag) => ({
      tag,
      level: 0,
      hasChildren: false,
      isExpanded: false,
    }));
  }, [tags]);

  const handleToggleExpanded = useCallback(
    (tagId: string) => {
      toggleTagExpansion(tagId);
    },
    [toggleTagExpansion],
  );

  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const deleteTag = useTagStore((state) => state.deleteTag);
  const { openTagCreateModal } = useTagModalNavigation();

  // TODO: タグ編集モーダルは廃止されインライン編集に置き換え（CalendarFilterList参照）
  const handleEditTag = useCallback((_tag: Tag) => {
    // 現在は編集モーダルなし - インライン編集に移行予定
  }, []);

  const handleDeleteTag = useCallback((tag: Tag) => {
    setDeletingTag(tag);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingTag) return;
    deleteTag(deletingTag.id);
    setDeletingTag(null);
  }, [deletingTag, deleteTag]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeletingTag(null);
  }, []);

  // jsx-no-bind optimization handlers
  const handleToggleExpansion = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleCreateNewTag = useCallback(() => {
    openTagCreateModal();
  }, [openTagCreateModal]);

  const handleCreateNewTagCollapsed = useCallback(() => {
    openTagCreateModal();
  }, [openTagCreateModal]);

  if (collapsed) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* セクションヘッダー */}
      <div className="flex w-full items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggleExpansion}
          className="text-muted-foreground section-header-toggle mb-2 gap-1 px-2 text-xs/6 font-normal"
        >
          {isExpanded ? (
            <ChevronDownIcon className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronRightIcon className="text-muted-foreground h-4 w-4" />
          )}
          {isExpanded ? (
            <FolderOpenIcon className="text-muted-foreground h-4 w-4" />
          ) : (
            <FolderIcon className="text-muted-foreground h-4 w-4" />
          )}
          <span>Tags</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleCreateNewTag}
          className="section-header-button"
        >
          <PlusIcon className="text-muted-foreground h-4 w-4" />
        </Button>
      </div>

      {/* タグリスト */}
      {isExpanded === true && (
        <div className="space-y-2">
          {displayTags().length > 0 ? (
            <>
              {displayTags().map(({ tag, level, hasChildren, isExpanded }) => (
                <TagItem
                  key={tag.id}
                  tag={tag}
                  level={level}
                  hasChildren={hasChildren}
                  isExpanded={isExpanded}
                  isSelected={selectedTagIds.includes(tag.id)}
                  isCollapsed={collapsed}
                  onToggleExpanded={handleToggleExpanded}
                  onSelectTag={onSelectTag}
                  onEditTag={handleEditTag}
                  onDeleteTag={handleDeleteTag}
                />
              ))}
            </>
          ) : (
            <div className="py-4 text-center">
              <TagIcon className="text-muted-foreground mx-auto mb-2 h-6 w-6" />
              <p className="text-muted-foreground mb-2 text-xs">タグがありません</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCreateNewTagCollapsed}
                className="text-primary gap-1 text-xs"
              >
                <PlusIcon className="h-4 w-4" />
                作成
              </Button>
            </div>
          )}
        </div>
      )}

      {/* タグ編集ダイアログは Intercepting Routes に移行 (@modal/(.)tags/edit/[id]) */}

      {/* タグ削除ダイアログ */}
      <DeleteConfirmDialog
        open={!!deletingTag}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={t('tags.delete.confirmTitleWithName', { name: deletingTag?.name ?? '' })}
        description={t('tags.delete.description')}
      />
    </div>
  );
};
