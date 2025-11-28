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
        className="disabled:bg-muted disabled:text-muted-foreground rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/92"
      >
        <span className="mr-2">↩️</span>
        復元 ({selectedCount})
      </button>

      {/* 完全削除ボタン */}
      <button
        type="button"
        onClick={onPermanentDelete}
        disabled={selectedCount === 0 || loading}
        className="disabled:bg-muted disabled:text-muted-foreground rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors duration-200 hover:bg-destructive/92"
      >
        <span className="mr-2">🗑️</span>
        完全削除 ({selectedCount})
      </button>

      {/* ゴミ箱を空にするボタン */}
      <button
        type="button"
        onClick={onEmptyTrash}
        disabled={stats.totalItems === 0 || loading}
        className="disabled:bg-muted disabled:text-muted-foreground rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-amber-600/92"
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
          className="disabled:bg-muted disabled:text-muted-foreground rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/20"
        >
          <span className="mr-2">⏰</span>
          期限切れ削除 ({expiredItems.length})
        </button>
      )}
    </div>
  )
}
