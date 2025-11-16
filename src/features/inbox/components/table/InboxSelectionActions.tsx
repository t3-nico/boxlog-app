'use client'

import { Archive, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface InboxSelectionActionsProps {
  selectedCount: number
  onArchive: () => void
  onDelete: () => void
  onClearSelection: () => void
}

/**
 * Inbox選択時のアクションボタン群
 *
 * 構成:
 * - アーカイブ
 * - 削除
 */
export function InboxSelectionActions({
  selectedCount,
  onArchive,
  onDelete,
  onClearSelection,
}: InboxSelectionActionsProps) {
  return (
    <TooltipProvider>
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
            className="h-9 w-9"
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
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-9 w-9"
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>削除</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
