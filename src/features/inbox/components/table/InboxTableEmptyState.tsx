'use client'

import { FileSearch, Filter, Inbox, Plus } from 'lucide-react'

import { EmptyState } from '@/components/common'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'

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
export function InboxTableEmptyState({ columnCount, totalItems: _totalItems }: InboxTableEmptyStateProps) {
  const { search, status, reset } = useInboxFilterStore()
  const { openInspector } = usePlanInspectorStore()

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
        description: `"${search}" に一致するプランがありません。別のキーワードで検索してください。`,
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
      title: 'まだプランがありません',
      description: '新しいプランを作成して、タスク管理を始めましょう。',
      action: (
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          新規作成
        </Button>
      ),
    }
  }

  const { icon, title, description, action } = getEmptyStateContent()

  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-[28rem]">
        <EmptyState icon={icon} title={title} description={description} actions={action} />
      </TableCell>
    </TableRow>
  )
}
