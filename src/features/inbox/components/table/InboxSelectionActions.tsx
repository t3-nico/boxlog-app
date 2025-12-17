'use client'

import { Archive, Calendar, MoreHorizontal, Tag, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import type { InboxItem } from '../../hooks/useInboxData'
import { InboxActionMenuItems } from './InboxActionMenuItems'

interface InboxSelectionActionsProps {
  selectedCount: number
  selectedIds: string[]
  items: InboxItem[]
  onArchive: () => void
  onDelete: () => void
  onEdit?: (item: InboxItem) => void
  onDuplicate?: (item: InboxItem) => void
  onAddTags?: () => void
  onChangeDueDate?: () => void
  onClearSelection: () => void
}

/**
 * Inbox選択時のアクションボタン群
 *
 * 構成:
 * - タグ一括追加
 * - 期限一括変更
 * - アーカイブ
 * - 削除
 * - その他メニュー（単一選択時のみ: 編集・複製）
 */
export function InboxSelectionActions({
  selectedCount,
  selectedIds,
  items,
  onArchive,
  onDelete,
  onEdit,
  onDuplicate,
  onAddTags,
  onChangeDueDate,
  onClearSelection,
}: InboxSelectionActionsProps) {
  const isSingleSelection = selectedCount === 1
  const selectedItem = isSingleSelection ? items.find((item) => item.id === selectedIds[0]) : null

  const handleSingleItemAction = (action: (item: InboxItem) => void) => {
    if (selectedItem) {
      action(selectedItem)
    }
  }

  return (
    <TooltipProvider>
      {/* タグ一括追加 */}
      {onAddTags && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onAddTags} aria-label="タグを追加">
              <Tag className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>タグを追加</TooltipContent>
        </Tooltip>
      )}

      {/* 期限一括変更 */}
      {onChangeDueDate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onChangeDueDate} aria-label="期限を設定">
              <Calendar className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>期限を設定</TooltipContent>
        </Tooltip>
      )}

      {/* アーカイブ */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onArchive()
              onClearSelection()
            }}
            aria-label="アーカイブ"
          >
            <Archive className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>アーカイブ</TooltipContent>
      </Tooltip>

      {/* 削除 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onDelete()
              onClearSelection()
            }}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            aria-label="削除"
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>削除</TooltipContent>
      </Tooltip>

      {/* その他メニュー（単一選択時のみ） */}
      {isSingleSelection && selectedItem && (
        <DropdownMenu modal={false}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="その他">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>その他</TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <InboxActionMenuItems
              item={selectedItem}
              onEdit={onEdit ? () => handleSingleItemAction(onEdit) : undefined}
              onDuplicate={onDuplicate ? () => handleSingleItemAction(onDuplicate) : undefined}
              onAddTags={onAddTags ? () => onAddTags() : undefined}
              onChangeDueDate={onChangeDueDate ? () => onChangeDueDate() : undefined}
              onArchive={() => {
                onArchive()
                onClearSelection()
              }}
              onDelete={() => {
                onDelete()
                onClearSelection()
              }}
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
              renderSeparator={() => <DropdownMenuSeparator />}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </TooltipProvider>
  )
}
