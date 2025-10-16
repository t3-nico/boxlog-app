'use client'

import type { TrashItem } from '../types/trash'

interface TrashActionButtonsProps {
  selectedCount: number
  stats: { totalItems: number }
  expiredItems: TrashItem[]
  loading: boolean
  onRestore: () => void
  onPermanentDelete: () => void
  onEmptyTrash: () => void
  onClearExpired: () => void
}

export function TrashActionButtons({
  selectedCount,
  stats,
  expiredItems,
  loading,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  onClearExpired,
}: TrashActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* 復元ボタン */}
      <button
        type="button"
        onClick={onRestore}
        disabled={selectedCount === 0 || loading}
        className="disabled:bg-muted disabled:text-muted-foreground rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
      >
        <span className="mr-2">↩️</span>
        復元 ({selectedCount})
      </button>

      {/* 完全削除ボタン */}
      <button
        type="button"
        onClick={onPermanentDelete}
        disabled={selectedCount === 0 || loading}
        className="disabled:bg-muted disabled:text-muted-foreground rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700"
      >
        <span className="mr-2">🗑️</span>
        完全削除 ({selectedCount})
      </button>

      {/* ゴミ箱を空にするボタン */}
      <button
        type="button"
        onClick={onEmptyTrash}
        disabled={stats.totalItems === 0 || loading}
        className="disabled:bg-muted disabled:text-muted-foreground rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-yellow-700"
      >
        <span className="mr-2">🧹</span>
        ゴミ箱を空にする
      </button>

      {/* 期限切れ削除ボタン */}
      {expiredItems.length > 0 && (
        <button
          type="button"
          onClick={onClearExpired}
          disabled={loading}
          className="disabled:bg-muted disabled:text-muted-foreground rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 transition-colors duration-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        >
          <span className="mr-2">⏰</span>
          期限切れ削除 ({expiredItems.length})
        </button>
      )}
    </div>
  )
}
