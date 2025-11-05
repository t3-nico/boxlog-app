'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { useInboxFilterStore } from '../../stores/useInboxFilterStore'
import { ColumnSettings } from './ColumnSettings'
import { TableFilters } from './TableFilters'

/**
 * Tableビュー用ツールバー
 *
 * 検索、フィルター機能を提供
 * - 検索ボックス
 * - TableFilters（Popover版フィルター）
 * - ColumnSettings（列設定）
 * - リセットボタン
 */
export function TableToolbar() {
  const { search, status, setSearch, reset } = useInboxFilterStore()

  const isFiltered = search !== '' || status.length > 0

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
        {/* 検索 */}
        <Input
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

      {/* 右側: 列設定 */}
      <div className="flex items-center gap-2">
        <ColumnSettings />
      </div>
    </div>
  )
}
