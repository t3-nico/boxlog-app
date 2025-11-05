import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { Archive, Trash2, X } from 'lucide-react'
import { useInboxSelectionStore } from '../../stores/useInboxSelectionStore'

/**
 * 一括操作ツールバーコンポーネント
 *
 * 選択されたアイテムに対する一括操作を提供
 * - ステータス一括変更
 * - 一括アーカイブ
 * - 一括削除
 * - 選択クリア
 *
 * @example
 * ```tsx
 * <BulkActionsToolbar />
 * ```
 */
export function BulkActionsToolbar() {
  const { getSelectedCount, clearSelection } = useInboxSelectionStore()
  const selectedCount = getSelectedCount()

  // 選択がない場合は非表示
  if (selectedCount === 0) {
    return null
  }

  // ステータス変更ハンドラー
  const handleStatusChange = (status: TicketStatus) => {
    // TODO: ステータス一括変更実装
    console.log('Bulk status change:', status, 'for', selectedCount, 'items')
    clearSelection()
  }

  // アーカイブハンドラー
  const handleArchive = () => {
    // TODO: 一括アーカイブ実装
    console.log('Bulk archive:', selectedCount, 'items')
    clearSelection()
  }

  // 削除ハンドラー
  const handleDelete = () => {
    // TODO: 一括削除実装
    console.log('Bulk delete:', selectedCount, 'items')
    clearSelection()
  }

  return (
    <div className="bg-muted/50 border-border flex items-center justify-between border-b px-4 py-3 md:px-6">
      {/* 左側: 選択数表示 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{selectedCount}件選択中</span>
        <Button variant="ghost" size="sm" onClick={clearSelection} className="h-8">
          <X className="mr-1 size-4" />
          クリア
        </Button>
      </div>

      {/* 右側: 一括操作ボタン */}
      <div className="flex items-center gap-2">
        {/* ステータス変更 */}
        <Select onValueChange={(value) => handleStatusChange(value as TicketStatus)}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="ステータス変更" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>ステータス</SelectLabel>
              <SelectItem value="backlog">準備中</SelectItem>
              <SelectItem value="ready">配置済み</SelectItem>
              <SelectItem value="active">作業中</SelectItem>
              <SelectItem value="wait">待ち</SelectItem>
              <SelectItem value="done">完了</SelectItem>
              <SelectItem value="cancel">中止</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* アーカイブ */}
        <Button variant="outline" size="sm" onClick={handleArchive} className="h-8">
          <Archive className="mr-1 size-4" />
          アーカイブ
        </Button>

        {/* 削除 */}
        <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8">
          <Trash2 className="mr-1 size-4" />
          削除
        </Button>
      </div>
    </div>
  )
}
