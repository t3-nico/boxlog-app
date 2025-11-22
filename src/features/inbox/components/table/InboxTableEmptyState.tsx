'use client'

import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { useTicketInspectorStore } from '@/features/plans/stores/useTicketInspectorStore'
import { FileSearch, Filter, Inbox, Plus } from 'lucide-react'
import { useInboxFilterStore } from '../../stores/useInboxFilterStore'

interface InboxTableEmptyStateProps {
  /** 列数（colSpan用） */
  columnCount: number
  /** 全アイテム数（フィルター前） */
  totalItems: number
}

/**
 * Inboxテーブル空状態コンポーネント
 *
 * 状況に応じて異なるメッセージとアクションを表示
 * - フィルター適用中で0件 → フィルタークリアを提案
 * - 検索中で0件 → 検索クリアを提案
 * - 完全に0件 → 新規作成を提案
 *
 * @example
 * ```tsx
 * <InboxTableEmptyState columnCount={5} totalItems={0} />
 * ```
 */
export function InboxTableEmptyState({ columnCount, totalItems }: InboxTableEmptyStateProps) {
  const { search, status, reset } = useInboxFilterStore()
  const { openInspector } = useTicketInspectorStore()

  // フィルター適用中かどうか
  const isFiltered = search !== '' || status.length > 0

  // 検索中かどうか
  const isSearching = search !== ''

  // 新規作成ハンドラー
  const handleCreate = () => {
    openInspector('new')
  }

  // 状態に応じた表示内容
  const getEmptyStateContent = () => {
    if (isSearching) {
      return {
        icon: FileSearch,
        title: '検索結果が見つかりませんでした',
        description: `"${search}" に一致するチケットがありません。別のキーワードで検索してください。`,
        action: (
          <Button onClick={reset} variant="outline">
            <Filter className="mr-2 size-4" />
            検索をクリア
          </Button>
        ),
      }
    }

    if (isFiltered) {
      return {
        icon: Filter,
        title: 'フィルター条件に一致するアイテムがありません',
        description: '別の条件で絞り込むか、フィルターをクリアしてください。',
        action: (
          <Button onClick={reset} variant="outline">
            <Filter className="mr-2 size-4" />
            フィルターをクリア
          </Button>
        ),
      }
    }

    return {
      icon: Inbox,
      title: 'まだチケットがありません',
      description: '新しいチケットを作成して、タスク管理を始めましょう。',
      action: (
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          新規作成
        </Button>
      ),
    }
  }

  const { icon: Icon, title, description, action } = getEmptyStateContent()

  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-[450px]">
        <div className="flex h-full items-center justify-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="bg-muted flex size-20 items-center justify-center rounded-full">
              <Icon className="text-muted-foreground size-10" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-2 mb-6 text-sm">{description}</p>
            {action}
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
