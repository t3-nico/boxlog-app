'use client'

import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { useInboxFilterStore } from '../../stores/useInboxFilterStore'
import { ColumnSettings } from './ColumnSettings'
import { TableFilters } from './TableFilters'
import { TagFilterButton } from './TagFilterButton'

interface TableToolbarProps {
  /** 新規作成ボタンクリック時のコールバック */
  onCreateClick?: () => void
}

/**
 * Tableビュー用ツールバー
 *
 * 検索、フィルター機能を提供
 * - 検索ボックス
 * - TableFilters（期限・ステータスフィルター）
 * - TagFilterButton（タグフィルター専用）
 * - ColumnSettings（列設定）
 * - 新規作成ボタン（Notionスタイル：テーブルに新規行を追加）
 * - リセットボタン
 */
export function TableToolbar({ onCreateClick }: TableToolbarProps) {
  const { search, status, tags, dueDate, setSearch, reset } = useInboxFilterStore()

  const isFiltered = search !== '' || status.length > 0 || tags.length > 0 || dueDate !== 'all'

  return (
    <div className="flex w-full items-center justify-between gap-2">
      {/* 左側: フィルター・列設定 */}
      <div className="flex items-center gap-2">
        {/* 期限・ステータスフィルター */}
        <TableFilters />

        {/* タグフィルター専用ボタン */}
        <TagFilterButton />

        {/* フィルターリセット */}
        {isFiltered && (
          <Button variant="ghost" onClick={reset} className="h-9 px-2 lg:px-3">
            リセット
            <X className="ml-2 size-4" />
          </Button>
        )}

        {/* 列設定 */}
        <ColumnSettings />
      </div>

      {/* 右側: 新規作成 */}
      <Button onClick={onCreateClick} size="sm" className="h-9">
        <Plus className="mr-2 size-4" />
        新規作成
      </Button>
    </div>
  )
}
