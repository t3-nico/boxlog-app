'use client'

import React from 'react'

import { colors, typography } from '@/config/theme'

import type { TrashItem } from '../types/trash'

interface TrashStatsDisplayProps {
  stats: { totalItems: number }
  selectedCount: number
  expiredItems: TrashItem[]
  onDeselectAll: () => void
}

export const TrashStatsDisplay: React.FC<TrashStatsDisplayProps> = ({
  stats,
  selectedCount,
  expiredItems,
  onDeselectAll,
}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className={`${typography.body.small} ${colors.text.muted} flex items-center space-x-4`}>
        <span>
          総数: <span className={`${colors.text.primary} font-medium`}>{stats.totalItems}件</span>
        </span>
        {selectedCount > 0 && (
          <span>
            選択: <span className={`${colors.semantic.info.text} font-medium`}>{selectedCount}件</span>
          </span>
        )}
        {expiredItems.length > 0 && (
          <span className={colors.semantic.warning.text}>
            期限切れ: <span className="font-medium">{expiredItems.length}件</span>
          </span>
        )}
      </div>

      {/* 選択解除 */}
      {selectedCount > 0 && (
        <button
          type="button"
          onClick={onDeselectAll}
          className={`${typography.body.small} ${colors.text.muted} ${colors.ghost.hover}`}
        >
          選択解除
        </button>
      )}
    </div>
  )
}
