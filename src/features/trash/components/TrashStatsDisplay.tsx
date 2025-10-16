'use client'

import type { TrashItem } from '../types/trash'

interface TrashStatsDisplayProps {
  stats: { totalItems: number }
  selectedCount: number
  expiredItems: TrashItem[]
  onDeselectAll: () => void
}

export function TrashStatsDisplay({ stats, selectedCount, expiredItems, onDeselectAll }: TrashStatsDisplayProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
        <span>
          総数: <span className="font-medium text-neutral-900 dark:text-neutral-100">{stats.totalItems}件</span>
        </span>
        {selectedCount > 0 && (
          <span>
            選択: <span className="font-medium text-blue-700 dark:text-blue-400">{selectedCount}件</span>
          </span>
        )}
        {expiredItems.length > 0 && (
          <span className="text-yellow-700 dark:text-yellow-400">
            期限切れ: <span className="font-medium">{expiredItems.length}件</span>
          </span>
        )}
      </div>

      {/* 選択解除 */}
      {selectedCount > 0 && (
        <button
          type="button"
          onClick={onDeselectAll}
          className="text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          選択解除
        </button>
      )}
    </div>
  )
}
