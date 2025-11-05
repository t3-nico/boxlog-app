'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import { Plus, X } from 'lucide-react'
import type { RefObject } from 'react'
import { useInboxFilterStore } from '../../stores/useInboxFilterStore'
import { ColumnSettings } from './ColumnSettings'
import { TableFilters } from './TableFilters'

interface TableToolbarProps {
  /** 検索フィールドのref（キーボードショートカット用） */
  searchInputRef?: RefObject<HTMLInputElement>
}

/**
 * Tableビュー用ツールバー
 *
 * 検索、フィルター機能を提供
 * - 検索ボックス
 * - TableFilters（Popover版フィルター）
 * - ColumnSettings（列設定）
 * - 新規作成ボタン
 * - リセットボタン
 */
export function TableToolbar({ searchInputRef }: TableToolbarProps) {
  const { search, status, setSearch, reset } = useInboxFilterStore()
  const { openInspector } = useTicketInspectorStore()

  const isFiltered = search !== '' || status.length > 0

  // 新規作成ハンドラー
  const handleCreate = () => {
    openInspector('new')
  }

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
        {/* 検索 */}
        <Input
          ref={searchInputRef}
          placeholder="チケットを検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-[150px] lg:w-[250px]"
        />

        {/* フィルター（Popover版） */}
        <TableFilters />

        {/* フィルターリセット */}
        {isFiltered && (
          <Button variant="ghost" onClick={reset} className="h-9 px-2 lg:px-3">
            リセット
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>

      {/* 右側: 列設定・新規作成 */}
      <div className="flex items-center gap-2">
        <ColumnSettings />
        <Button onClick={handleCreate} size="sm" className="h-9">
          <Plus className="mr-2 size-4" />
          新規作成
        </Button>
      </div>
    </div>
  )
}
