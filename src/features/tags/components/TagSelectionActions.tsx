'use client'

import { Archive, Folder, FolderX, MoreHorizontal, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { TagGroup, TagWithChildren } from '@/types/tags'

import { TagActionMenuItems } from './TagActionMenuItems'

interface TagSelectionActionsProps {
  selectedTagIds: string[]
  tags: TagWithChildren[]
  groups: TagGroup[]
  onMoveToGroup: (tag: TagWithChildren, groupId: string | null) => void
  onArchive?: (tagIds: string[]) => Promise<void>
  onDelete: () => void
  onEdit?: (tag: TagWithChildren) => void
  onView?: (tag: TagWithChildren) => void
  onClearSelection: () => void
  t: (key: string) => string
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
  onDelete,
  onEdit,
  onView,
  onClearSelection,
  t,
}: TagSelectionActionsProps) {
  const hasGroups = groups.length > 0
  const isSingleSelection = selectedTagIds.length === 1
  const selectedTag = isSingleSelection ? tags.find((t) => t.id === selectedTagIds[0]) : null

  return (
    <TooltipProvider>
      {/* グループに移動 */}
      {hasGroups && (
        <DropdownMenu modal={false}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Folder className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('tag.page.moveToGroup')}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="min-w-48">
            <DropdownMenuItem
              onClick={() => {
                selectedTagIds.forEach((tagId) => {
                  const tag = tags.find((t) => t.id === tagId)
                  if (tag) onMoveToGroup(tag, null)
                })
              }}
            >
              <FolderX className="mr-2 h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              {t('tag.page.noGroup')}
            </DropdownMenuItem>
            {groups.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={() => {
                  selectedTagIds.forEach((tagId) => {
                    const tag = tags.find((t) => t.id === tagId)
                    if (tag) onMoveToGroup(tag, group.id)
                  })
                }}
              >
                <Folder className="mr-2 h-4 w-4" style={{ color: group.color || '#6B7280' }} />
                {group.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* アーカイブ */}
      {onArchive && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await onArchive(selectedTagIds)
                onClearSelection()
              }}
              className="h-9 w-9"
            >
              <Archive className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('tag.page.archive')}</TooltipContent>
        </Tooltip>
      )}

      {/* 完全削除 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-9 w-9"
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('tag.page.delete')}</TooltipContent>
      </Tooltip>

      {/* その他メニュー（単一選択時のみ有効） */}
      {selectedTag && (
        <DropdownMenu modal={false}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('common.moreActions')}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <TagActionMenuItems
              tag={selectedTag}
              groups={groups}
              {...(onView && { onView })}
              {...(onEdit && { onEdit })}
              onMoveToGroup={(tag, groupId) => {
                onMoveToGroup(tag, groupId)
              }}
              {...(onArchive && {
                onArchive: async (tag) => {
                  await onArchive([tag.id])
                  onClearSelection()
                },
              })}
              onDelete={() => {
                onDelete()
                onClearSelection()
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
    </TooltipProvider>
  )
}
