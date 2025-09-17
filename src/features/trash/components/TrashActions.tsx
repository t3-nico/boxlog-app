import React from 'react'

import { colors, icons, rounded, spacing, typography } from '@/config/theme'

interface TrashActionsProps {
  className?: string
}

export const TrashActions: React.FC<TrashActionsProps> = ({ className }) => {
  const {
    selectedIds,
    loading,
    restoreItems,
    permanentlyDeleteItems,
    emptyTrash,
    clearExpiredItems,
    deselectAll,
    getFilteredItems,
    getExpiredItems,
    getStats,
  } = useTrashStore()

  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    action: 'restore' | 'delete' | 'empty' | 'clearExpired' | null
    message: string
    onConfirm: () => void
  } | null>(null)

  const filteredItems = getFilteredItems()
  const expiredItems = getExpiredItems()
  const stats = getStats()
  const selectedCount = selectedIds.size

  const handleRestore = async () => {
    if (selectedCount === 0) return

    setShowConfirmDialog({
      action: 'restore',
      message: `選択した${selectedCount}件のアイテムを復元しますか？`,
      onConfirm: async () => {
        try {
          await restoreItems(Array.from(selectedIds))
          setShowConfirmDialog(null)
        } catch (error) {
          console.error('Restore failed:', error)
        }
      },
    })
  }

  const handlePermanentDelete = async () => {
    if (selectedCount === 0) return

    setShowConfirmDialog({
      action: 'delete',
      message: `選択した${selectedCount}件のアイテムを完全に削除しますか？この操作は元に戻せません。`,
      onConfirm: async () => {
        try {
          await permanentlyDeleteItems(Array.from(selectedIds))
          setShowConfirmDialog(null)
        } catch (error) {
          console.error('Delete failed:', error)
        }
      },
    })
  }

  const handleEmptyTrash = async () => {
    if (stats.totalItems === 0) return

    setShowConfirmDialog({
      action: 'empty',
      message: `ゴミ箱内の${stats.totalItems}件のアイテムをすべて削除しますか？この操作は元に戻せません。`,
      onConfirm: async () => {
        try {
          await emptyTrash()
          setShowConfirmDialog(null)
        } catch (error) {
          console.error('Empty trash failed:', error)
        }
      },
    })
  }

  const handleClearExpired = async () => {
    if (expiredItems.length === 0) return

    setShowConfirmDialog({
      action: 'clearExpired',
      message: `期限切れの${expiredItems.length}件のアイテムを自動削除しますか？`,
      onConfirm: async () => {
        try {
          await clearExpiredItems()
          setShowConfirmDialog(null)
        } catch (error) {
          console.error('Clear expired failed:', error)
        }
      },
    })
  }

  return (
    <>
      <div
        className={`${colors.background.surface} border border-neutral-200 dark:border-neutral-800 ${rounded.lg} ${spacing.cardVariants.default} ${className}`}
      >
        {/* 統計情報 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="${typography.body.small} ${colors.text.muted} flex items-center space-x-4">
            <span>
              総数: <span className="${colors.text.primary} font-medium">{stats.totalItems}件</span>
            </span>
            {selectedCount > 0 && (
              <span>
                選択: <span className="${colors.semantic.info.text} font-medium">{selectedCount}件</span>
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
              onClick={deselectAll}
              className={`${typography.body.small} ${colors.text.muted} ${colors.ghost.hover}`}
            >
              選択解除
            </button>
          )}
        </div>

        {/* アクションボタン */}
        <div className="${spacing.gridGap.tight} flex flex-wrap">
          {/* 復元ボタン */}
          <button
            type="button"
            onClick={handleRestore}
            disabled={selectedCount === 0 || loading}
            className={`px-4 py-2 ${colors.button.primary} ${typography.body.small} font-medium ${rounded.md} ${colors.state.disabled.opacity} transition-colors`}
          >
            復元 {selectedCount > 0 && `(${selectedCount})`}
          </button>

          {/* 完全削除ボタン */}
          <button
            type="button"
            onClick={handlePermanentDelete}
            disabled={selectedCount === 0 || loading}
            className={`px-4 py-2 ${colors.button.danger} ${typography.body.small} font-medium ${rounded.md} ${colors.state.disabled.opacity} transition-colors`}
          >
            完全削除 {selectedCount > 0 && `(${selectedCount})`}
          </button>

          {/* 期限切れ削除ボタン */}
          {expiredItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearExpired}
              disabled={loading}
              className={`px-4 py-2 ${colors.semantic.warning.DEFAULT} hover:brightness-90 disabled:brightness-50 ${colors.text.white} ${typography.body.small} font-medium ${rounded.md} transition-colors`}
            >
              期限切れを削除 ({expiredItems.length})
            </button>
          )}

          {/* ゴミ箱を空にする */}
          <button
            type="button"
            onClick={handleEmptyTrash}
            disabled={stats.totalItems === 0 || loading}
            className={`px-4 py-2 ${colors.button.secondary} ${typography.body.small} font-medium ${rounded.md} ${colors.state.disabled.opacity} transition-colors`}
          >
            ゴミ箱を空にする
          </button>
        </div>

        {/* 警告メッセージ */}
        {expiredItems.length > 0 && (
          <div className="${spacing.cardVariants.default} ${colors.semantic.warning.light} ${colors.semantic.warning.border} ${rounded.md} mt-3">
            <div className="flex items-start">
              <div className="mr-2 text-orange-400">⚠️</div>
              <div>
                <div className="${typography.body.small} ${colors.semantic.warning.text} font-medium">
                  {expiredItems.length}件のアイテムが保持期限を過ぎています
                </div>
                <div className="${typography.body.small} ${colors.semantic.warning.text} mt-1">
                  30日を過ぎたアイテムは自動的に削除対象となります。必要に応じて復元してください。
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="${colors.background.surface} ${rounded.lg} mx-4 w-full max-w-md p-6 shadow-xl">
            <div className="mb-4 flex items-start">
              <div className="mr-3 text-2xl">
                {showConfirmDialog.action === 'restore' && '🔄'}
                {showConfirmDialog.action === 'delete' && '🗑️'}
                {showConfirmDialog.action === 'empty' && '🗑️'}
                {showConfirmDialog.action === 'clearExpired' && '⏰'}
              </div>
              <div>
                <h3 className="${typography.heading.h4} ${colors.text.primary} font-semibold">
                  {showConfirmDialog.action === 'restore' && '復元の確認'}
                  {showConfirmDialog.action === 'delete' && '完全削除の確認'}
                  {showConfirmDialog.action === 'empty' && 'ゴミ箱を空にする'}
                  {showConfirmDialog.action === 'clearExpired' && '期限切れアイテムの削除'}
                </h3>
                <p className="${typography.body.small} ${colors.text.muted} mt-2">{showConfirmDialog.message}</p>
                {(showConfirmDialog.action === 'delete' ||
                  showConfirmDialog.action === 'empty' ||
                  showConfirmDialog.action === 'clearExpired') && (
                  <p className="${typography.body.small} ${colors.semantic.error.text} mt-2 font-medium">
                    この操作は元に戻せません。
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(null)}
                disabled={loading}
                className={`px-4 py-2 ${typography.body.small} font-medium ${colors.button.outline} transition-colors`}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={showConfirmDialog.onConfirm}
                disabled={loading}
                className={`px-4 py-2 ${typography.body.small} font-medium ${colors.text.white} ${rounded.md} transition-colors ${colors.state.disabled.opacity} ${
                  showConfirmDialog.action === 'restore' ? colors.button.primary : colors.button.danger
                }`}
              >
                {loading && (
                  <svg
                    className={`${icons.animation.spin} ${icons.size.sm} ${colors.text.white} inline`}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {showConfirmDialog.action === 'restore' && '復元する'}
                {showConfirmDialog.action === 'delete' && '完全削除する'}
                {showConfirmDialog.action === 'empty' && '空にする'}
                {showConfirmDialog.action === 'clearExpired' && '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
