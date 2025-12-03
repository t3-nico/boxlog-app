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
        className="disabled:bg-muted disabled:text-muted-foreground bg-primary text-primary-foreground hover:bg-primary/92 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
      >
        <span className="mr-2">↩️</span>
        復元 ({selectedCount})
      </button>

      {/* 完全削除ボタン */}
      <button
        type="button"
        onClick={onPermanentDelete}
        disabled={selectedCount === 0 || loading}
        className="disabled:bg-muted disabled:text-muted-foreground bg-destructive text-destructive-foreground hover:bg-destructive/92 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
      >
        <span className="mr-2">🗑️</span>
        完全削除 ({selectedCount})
      </button>

      {/* ゴミ箱を空にするボタン */}
      <button
        type="button"
        onClick={onEmptyTrash}
        disabled={stats.totalItems === 0 || loading}
        className="disabled:bg-muted disabled:text-muted-foreground bg-warning text-warning-foreground hover:bg-warning/92 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
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
          className="disabled:bg-muted disabled:text-muted-foreground bg-primary/10 text-primary hover:bg-primary/20 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
        >
          <span className="mr-2">⏰</span>
          期限切れ削除 ({expiredItems.length})
        </button>
      )}
    </div>
  )
}
