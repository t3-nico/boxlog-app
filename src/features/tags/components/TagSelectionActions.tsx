'use client';

import { Archive, Folder, FolderX, Merge, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors';
import type { Tag, TagGroup } from '@/features/tags/types';

import { TagActionMenuItems } from './TagActionMenuItems';

interface TagSelectionActionsProps {
  selectedTagIds: string[];
  tags: Tag[];
  groups: TagGroup[];
  onMoveToGroup: (tag: Tag, groupId: string | null) => void;
  onArchive?: (tagIds: string[]) => Promise<void>;
  /** 復元（アーカイブモード用） */
  onRestore?: (tagIds: string[]) => Promise<void>;
  onDelete: () => void;
  /** 単一タグマージ（1つ選択時のみ有効） */
  onSingleMerge?: (tag: Tag) => void;
  onEdit?: (tag: Tag) => void;
  onView?: (tag: Tag) => void;
  onClearSelection: () => void;
  t: (key: string) => string;
}

/**
 * タグ選択時の共通アクションボタン群
 *
 * 構成:
 * - グループに移動（ドロップダウン）
 * - アーカイブ（オプション）
 * - 完全削除
 * - その他メニュー（コンテキストメニューと同じ内容）
 */
export function TagSelectionActions({
  selectedTagIds,
  tags,
  groups,
  onMoveToGroup,
  onArchive,
  onRestore,
  onDelete,
  onSingleMerge,
  onEdit,
  onView,
  onClearSelection,
  t,
}: TagSelectionActionsProps) {
  const hasGroups = groups.length > 0;
  const isSingleSelection = selectedTagIds.length === 1;
  const selectedTag = isSingleSelection ? tags.find((t) => t.id === selectedTagIds[0]) : null;

  return (
    <>
      {/* グループに移動 */}
      {hasGroups && (
        <DropdownMenu modal={false}>
          <HoverTooltip content={t('tag.page.moveToGroup')} side="top">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('tag.page.moveToGroup')}>
                <Folder className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </HoverTooltip>
          <DropdownMenuContent className="min-w-48">
            <DropdownMenuItem
              onClick={() => {
                selectedTagIds.forEach((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  if (tag) onMoveToGroup(tag, null);
                });
              }}
            >
              <FolderX className="text-muted-foreground mr-2 h-4 w-4" />
              {t('tag.page.noGroup')}
            </DropdownMenuItem>
            {groups.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={() => {
                  selectedTagIds.forEach((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    if (tag) onMoveToGroup(tag, group.id);
                  });
                }}
              >
                <Folder
                  className="mr-2 h-4 w-4"
                  style={{ color: group.color || DEFAULT_GROUP_COLOR }}
                />
                {group.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* 復元（アーカイブモード用） */}
      {onRestore && (
        <HoverTooltip content={t('tag.archive.restore')} side="top">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await onRestore(selectedTagIds);
              onClearSelection();
            }}
            aria-label={t('tag.archive.restore')}
          >
            <RotateCcw className="size-4" />
          </Button>
        </HoverTooltip>
      )}

      {/* アーカイブ */}
      {onArchive && (
        <HoverTooltip content={t('tag.page.archive')} side="top">
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await onArchive(selectedTagIds);
              onClearSelection();
            }}
            aria-label={t('tag.page.archive')}
          >
            <Archive className="size-4" />
          </Button>
        </HoverTooltip>
      )}

      {/* マージ（1つ選択時のみ） */}
      {isSingleSelection && selectedTag && onSingleMerge && (
        <HoverTooltip content={t('tags.merge.title')} side="top">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSingleMerge(selectedTag)}
            aria-label={t('tags.merge.title')}
          >
            <Merge className="size-4" />
          </Button>
        </HoverTooltip>
      )}

      {/* 完全削除 */}
      <HoverTooltip content={t('tag.page.delete')} side="top">
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          aria-label={t('tag.page.delete')}
        >
          <Trash2 className="size-4" />
        </Button>
      </HoverTooltip>

      {/* その他メニュー（単一選択時のみ有効） */}
      {selectedTag && (
        <DropdownMenu modal={false}>
          <HoverTooltip content={t('common.moreActions')} side="top">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('common.moreActions')}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </HoverTooltip>
          <DropdownMenuContent>
            <TagActionMenuItems
              tag={selectedTag}
              groups={groups}
              {...(onView && { onView })}
              {...(onEdit && { onEdit })}
              onMoveToGroup={(tag, groupId) => {
                onMoveToGroup(tag, groupId);
              }}
              {...(onArchive && {
                onArchive: async (tag) => {
                  await onArchive([tag.id]);
                  onClearSelection();
                },
              })}
              onDelete={() => {
                onDelete();
                onClearSelection();
              }}
              t={t}
              renderMenuItem={({ icon, label, onClick, variant }) => (
                <DropdownMenuItem
                  onClick={onClick}
                  className={
                    variant === 'destructive'
                      ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                      : ''
                  }
                >
                  {icon}
                  {label}
                </DropdownMenuItem>
              )}
              renderSubMenu={({ trigger, items }) => (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {trigger.icon}
                    {trigger.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="min-w-48">
                    {items.map((item) => (
                      <DropdownMenuItem key={item.key} onClick={item.onClick}>
                        {item.icon}
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
