/**
 * タグ管理のツールバーコンポーネント
 */

import { Filter, Search } from 'lucide-react'

interface TagsToolbarProps {
  searchQuery: string
  showInactive: boolean
  onSearchChange: (value: string) => void
  onToggleInactive: () => void
  onCreateTag: () => void
}

export function TagsToolbar({
  searchQuery,
  showInactive,
  onSearchChange,
  onToggleInactive,
  onCreateTag,
}: TagsToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* 検索バー */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          data-slot="icon"
        />
        <input
          type="text"
          placeholder="タグを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleInactive}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
            showInactive
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          <Filter className="h-4 w-4" data-slot="icon" />
          <span className="hidden sm:inline">非アクティブも表示</span>
        </button>

        <button
          type="button"
          onClick={onCreateTag}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <span>新規タグ</span>
        </button>
      </div>
    </div>
  )
}
