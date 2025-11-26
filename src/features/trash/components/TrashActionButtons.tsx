'use client'

import { Button } from '@/components/ui/button'

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
      <Button onClick={onRestore} disabled={selectedCount === 0 || loading}>
        <span className="mr-2">↩️</span>
        復元 ({selectedCount})
      </Button>

      {/* 完全削除ボタン */}
      <Button variant="destructive" onClick={onPermanentDelete} disabled={selectedCount === 0 || loading}>
        <span className="mr-2">🗑️</span>
        完全削除 ({selectedCount})
      </Button>

      {/* ゴミ箱を空にするボタン */}
      <Button variant="secondary" onClick={onEmptyTrash} disabled={stats.totalItems === 0 || loading}>
        <span className="mr-2">🧹</span>
        ゴミ箱を空にする
      </Button>

      {/* 期限切れ削除ボタン */}
      {expiredItems.length > 0 && (
        <Button variant="outline" onClick={onClearExpired} disabled={loading}>
          <span className="mr-2">⏰</span>
          期限切れ削除 ({expiredItems.length})
        </Button>
      )}
    </div>
  )
}
