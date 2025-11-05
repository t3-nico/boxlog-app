import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Archive, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { InboxItem } from '../../hooks/useInboxData'

interface InboxTableRowActionsProps {
  /** 操作対象のInboxアイテム */
  item: InboxItem
}

/**
 * Inboxテーブル行アクションメニュー
 *
 * 編集、複製、アーカイブ、削除のアクションを提供
 * DropdownMenuで実装し、行クリックイベントとの競合を防止
 *
 * @example
 * ```tsx
 * <InboxTableRowActions item={item} />
 * ```
 */
export function InboxTableRowActions({ item }: InboxTableRowActionsProps) {
  const handleEdit = () => {
    // TODO: 編集機能実装
    console.log('Edit:', item.id)
  }

  const handleDuplicate = () => {
    // TODO: 複製機能実装
    console.log('Duplicate:', item.id)
  }

  const handleArchive = () => {
    // TODO: アーカイブ機能実装
    console.log('Archive:', item.id)
  }

  const handleDelete = () => {
    // TODO: 削除機能実装
    console.log('Delete:', item.id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">メニューを開く</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 size-4" />
          編集
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 size-4" />
          複製
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="mr-2 size-4" />
          アーカイブ
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 size-4" />
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
