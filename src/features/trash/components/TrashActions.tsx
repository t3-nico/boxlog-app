import React from 'react'

import { colors, rounded, spacing } from '@/config/theme'

import { useTrashActions } from '../hooks/useTrashActions'

import { TrashActionButtons } from './TrashActionButtons'
import { TrashConfirmDialog } from './TrashConfirmDialog'
import { TrashStatsDisplay } from './TrashStatsDisplay'

interface TrashActionsProps {
  className?: string
}

export const TrashActions: React.FC<TrashActionsProps> = ({ className }) => {
  // カスタムフックで状態管理とロジックを抽出
  const {
    showConfirmDialog,
    loading,
    selectedCount,
    stats,
    expiredItems,
    handleRestore,
    handlePermanentDelete,
    handleEmptyTrash,
    handleClearExpired,
    handleCloseDialog,
    deselectAll
  } = useTrashActions()

  return (
    <>
      <div
        className={`${colors.background.surface} border border-neutral-200 dark:border-neutral-800 ${rounded.lg} ${spacing.cardVariants.default} ${className}`}
      >
        {/* 統計情報 */}
        <TrashStatsDisplay
          stats={stats}
          selectedCount={selectedCount}
          expiredItems={expiredItems}
          onDeselectAll={deselectAll}
        />

        {/* アクションボタン */}
        <TrashActionButtons
          selectedCount={selectedCount}
          stats={stats}
          expiredItems={expiredItems}
          loading={loading}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
          onClearExpired={handleClearExpired}
        />
      </div>

      {/* 確認ダイアログ */}
      <TrashConfirmDialog
        dialog={showConfirmDialog}
        onClose={handleCloseDialog}
      />
    </>
  )
}
