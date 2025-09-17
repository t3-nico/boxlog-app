'use client'

import React from 'react'

import { colors, icons, spacing, typography } from '@/config/theme'

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

export const TrashActionButtons: React.FC<TrashActionButtonsProps> = ({
  selectedCount,
  stats,
  expiredItems,
  loading,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  onClearExpired,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* 復元ボタン */}
      <button
        type="button"
        onClick={onRestore}
        disabled={selectedCount === 0 || loading}
        className={` ${colors.primary.surface} ${colors.primary.text} disabled:${colors.muted.surface} disabled:${colors.muted.text} ${spacing.button.variants.default} ${typography.body.small} font-medium transition-colors duration-200`}
      >
        <span className={`${icons.size.sm} mr-2`}>↩️</span>
        復元 ({selectedCount})
      </button>

      {/* 完全削除ボタン */}
      <button
        type="button"
        onClick={onPermanentDelete}
        disabled={selectedCount === 0 || loading}
        className={` ${colors.semantic.error.surface} ${colors.semantic.error.text} disabled:${colors.muted.surface} disabled:${colors.muted.text} ${spacing.button.variants.default} ${typography.body.small} font-medium transition-colors duration-200`}
      >
        <span className={`${icons.size.sm} mr-2`}>🗑️</span>
        完全削除 ({selectedCount})
      </button>

      {/* ゴミ箱を空にするボタン */}
      <button
        type="button"
        onClick={onEmptyTrash}
        disabled={stats.totalItems === 0 || loading}
        className={` ${colors.semantic.warning.surface} ${colors.semantic.warning.text} disabled:${colors.muted.surface} disabled:${colors.muted.text} ${spacing.button.variants.default} ${typography.body.small} font-medium transition-colors duration-200`}
      >
        <span className={`${icons.size.sm} mr-2`}>🧹</span>
        ゴミ箱を空にする
      </button>

      {/* 期限切れ削除ボタン */}
      {expiredItems.length > 0 && (
        <button
          type="button"
          onClick={onClearExpired}
          disabled={loading}
          className={` ${colors.semantic.info.surface} ${colors.semantic.info.text} disabled:${colors.muted.surface} disabled:${colors.muted.text} ${spacing.button.variants.default} ${typography.body.small} font-medium transition-colors duration-200`}
        >
          <span className={`${icons.size.sm} mr-2`}>⏰</span>
          期限切れ削除 ({expiredItems.length})
        </button>
      )}
    </div>
  )
}
