'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors';
import { TagActionMenuItems } from '@/features/tags/components/TagActionMenuItems';
import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore';
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore';
import type { Tag, TagGroup } from '@/features/tags/types';
import { cn } from '@/lib/utils';
import { Hash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, type MouseEvent } from 'react';

interface TagListItemProps {
  tag: Tag;
  planCount: number;
  isSelected: boolean;
  groups: TagGroup[];
  onMoveToGroup: (tag: Tag, groupId: string | null) => void;
  onArchiveConfirm: (tag: Tag) => void;
  onDeleteConfirm: (tag: Tag) => void;
}

/**
 * タグリストの行アイテム
 *
 * - チェックボックス（ホバー時 or 選択時に表示）
 * - 色付きドット
 * - タグ名
 * - 使用数
 * - 右クリックでコンテキストメニュー
 */
export function TagListItem({
  tag,
  planCount,
  isSelected,
  groups,
  onMoveToGroup,
  onArchiveConfirm,
  onDeleteConfirm,
}: TagListItemProps) {
  const t = useTranslations();
  const {
    openInspector,
    entityId: inspectorTagId,
    isOpen: isInspectorOpen,
  } = useTagInspectorStore();
  const { toggleSelection, setSelectedIds } = useTagSelectionStore();

  // Inspectorで開いているタグかどうか
  const isInspectorActive = isInspectorOpen && inspectorTagId === tag.id;

  // チェックボックスクリック
  const handleCheckboxClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      toggleSelection(tag.id);
    },
    [tag.id, toggleSelection],
  );

  // 行クリック（Inspector を開く）
  const handleRowClick = useCallback(() => {
    openInspector(tag.id);
  }, [tag.id, openInspector]);

  // コンテキストメニュー表示時に選択
  const handleContextMenu = useCallback(() => {
    if (!isSelected) {
      setSelectedIds([tag.id]);
    }
  }, [isSelected, tag.id, setSelectedIds]);

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div
          role="row"
          tabIndex={0}
          className={cn(
            'group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors',
            'hover:bg-state-hover',
            isSelected && 'bg-primary-state-selected hover:bg-state-dragged',
            !isSelected && isInspectorActive && 'bg-state-hover',
          )}
          onClick={handleRowClick}
          onContextMenu={handleContextMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleRowClick();
            }
          }}
        >
          {/* チェックボックス */}
          <div
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={-1}
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-opacity',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground opacity-100'
                : 'border-input bg-background opacity-0 group-hover:opacity-100',
            )}
            onClick={handleCheckboxClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                toggleSelection(tag.id);
              }
            }}
          >
            {isSelected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* 色ドット + 名前 */}
          <Hash className="h-4 w-4 shrink-0" style={{ color: tag.color || DEFAULT_TAG_COLOR }} />
          <span className="min-w-0 flex-1 truncate font-medium">{tag.name}</span>

          {/* 使用数 */}
          <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
            {planCount} {planCount === 1 ? 'plan' : 'plans'}
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <TagActionMenuItems
          tag={tag}
          groups={groups}
          onView={() => openInspector(tag.id)}
          onMoveToGroup={onMoveToGroup}
          onArchive={onArchiveConfirm}
          onDelete={onDeleteConfirm}
          t={t}
          renderMenuItem={({ icon, label, onClick, variant }) => (
            <ContextMenuItem
              onClick={onClick}
              className={
                variant === 'destructive'
                  ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                  : ''
              }
            >
              {icon}
              {label}
            </ContextMenuItem>
          )}
          renderSubMenu={({ trigger, items }) => (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                {trigger.icon}
                {trigger.label}
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="min-w-48">
                {items.map((item) => (
                  <ContextMenuItem key={item.key} onClick={item.onClick}>
                    {item.icon}
                    {item.label}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}
