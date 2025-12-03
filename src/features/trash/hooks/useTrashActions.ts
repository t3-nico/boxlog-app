'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { useTrashStore } from '../stores/useTrashStore'

export interface ConfirmDialog {
  action: 'restore' | 'delete' | 'empty' | 'clearExpired' | null
  message: string
  onConfirm: () => void
}

export const useTrashActions = () => {
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

  const [showConfirmDialog, setShowConfirmDialog] = useState<ConfirmDialog | null>(null)
  // INP改善: 削除操作をTransitionでラップしてUIをノンブロッキングに
  const [isPending, startTransition] = useTransition()

  const filteredItems = getFilteredItems()
  const expiredItems = getExpiredItems()
  const stats = getStats()
  const selectedCount = selectedIds.size

  // 復元処理（Transitionでラップ）
  const handleRestore = async () => {
    if (selectedCount === 0) return

    setShowConfirmDialog({
      action: 'restore',
      message: `選択した${selectedCount}件のアイテムを復元しますか？`,
      onConfirm: () => {
        startTransition(async () => {
          try {
            await restoreItems(Array.from(selectedIds))
            toast.success(`${selectedCount}件のアイテムを復元しました`)
            setShowConfirmDialog(null)
          } catch (error) {
            console.error('Restore failed:', error)
            toast.error('復元に失敗しました')
          }
        })
      },
    })
  }

  // 完全削除処理（Transitionでラップ）
  const handlePermanentDelete = async () => {
    if (selectedCount === 0) return

    setShowConfirmDialog({
      action: 'delete',
      message: `選択した${selectedCount}件のアイテムを完全に削除しますか？この操作は元に戻せません。`,
      onConfirm: () => {
        startTransition(async () => {
          try {
            await permanentlyDeleteItems(Array.from(selectedIds))
            toast.success(`${selectedCount}件のアイテムを完全に削除しました`)
            setShowConfirmDialog(null)
          } catch (error) {
            console.error('Delete failed:', error)
            toast.error('削除に失敗しました')
          }
        })
      },
    })
  }

  // ゴミ箱空にする処理（Transitionでラップ）
  const handleEmptyTrash = async () => {
    if (stats.totalItems === 0) return

    setShowConfirmDialog({
      action: 'empty',
      message: `ゴミ箱内の${stats.totalItems}件のアイテムをすべて削除しますか？この操作は元に戻せません。`,
      onConfirm: () => {
        const itemCount = stats.totalItems // キャプチャ
        startTransition(async () => {
          try {
            await emptyTrash()
            toast.success(`${itemCount}件のアイテムを削除しました`)
            setShowConfirmDialog(null)
          } catch (error) {
            console.error('Empty trash failed:', error)
            toast.error('ゴミ箱を空にできませんでした')
          }
        })
      },
    })
  }

  // 期限切れアイテム削除処理（Transitionでラップ）
  const handleClearExpired = async () => {
    if (expiredItems.length === 0) return

    setShowConfirmDialog({
      action: 'clearExpired',
      message: `期限切れの${expiredItems.length}件のアイテムを自動削除しますか？`,
      onConfirm: () => {
        const expiredCount = expiredItems.length // キャプチャ
        startTransition(async () => {
          try {
            await clearExpiredItems()
            toast.success(`期限切れの${expiredCount}件のアイテムを削除しました`)
            setShowConfirmDialog(null)
          } catch (error) {
            console.error('Clear expired failed:', error)
            toast.error('期限切れアイテムの削除に失敗しました')
          }
        })
      },
    })
  }

  // 確認ダイアログを閉じる
  const handleCloseDialog = () => {
    setShowConfirmDialog(null)
  }

  return {
    // State
    showConfirmDialog,
    loading,
    isPending, // INP改善: Transition中のペンディング状態
    selectedCount,
    stats,
    expiredItems,
    filteredItems,

    // Actions
    handleRestore,
    handlePermanentDelete,
    handleEmptyTrash,
    handleClearExpired,
    handleCloseDialog,
    deselectAll,
    setShowConfirmDialog,
  }
}
