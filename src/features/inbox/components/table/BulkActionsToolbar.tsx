'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import type { PlanStatus } from '@/features/plans/types/plan'
import { Archive, Calendar, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { useInboxSelectionStore } from '../../stores/useInboxSelectionStore'
import { BulkDatePickerDialog } from './BulkDatePickerDialog'

/**
 * 一括操作ツールバーコンポーネント
 *
 * 選択されたアイテムに対する一括操作を提供
 * - ステータス一括変更
 * - タグ一括追加/削除
 * - 期限一括設定
 * - 一括アーカイブ
 * - 一括削除
 * - 選択クリア
 *
 * @example
 * ```tsx
 * <BulkActionsToolbar />
 * ```
 */
export function BulkActionsToolbar() {
  const t = useTranslations()
  const { getSelectedCount, getSelectedIds, clearSelection } = useInboxSelectionStore()
  const { bulkUpdatePlan, bulkDeletePlan } = usePlanMutations()
  const selectedCount = getSelectedCount()
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 選択がない場合は非表示
  if (selectedCount === 0) {
    return null
  }

  // ステータス変更ハンドラー
  const handleStatusChange = async (status: PlanStatus) => {
    setIsProcessing(true)
    try {
      const selectedIds = Array.from(getSelectedIds())
      await bulkUpdatePlan.mutateAsync({
        ids: selectedIds,
        data: { status },
      })

      toast.success(t('common.inbox.statusChangedCount', { count: selectedIds.length }))
      clearSelection()
    } catch (error) {
      toast.error(t('common.inbox.statusChangeFailed'))
      console.error('Bulk status change error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 期限設定ダイアログを開く
  const handleOpenDateDialog = () => {
    setShowDateDialog(true)
  }

  // アーカイブハンドラー
  const handleArchive = async () => {
    setIsProcessing(true)
    try {
      const selectedIds = Array.from(getSelectedIds())
      await bulkUpdatePlan.mutateAsync({
        ids: selectedIds,
        data: { status: 'done' }, // アーカイブ = 完了ステータスに変更
      })

      toast.success(t('common.inbox.archivedCount', { count: selectedIds.length }))
      clearSelection()
    } catch (error) {
      toast.error(t('common.inbox.archiveFailed'))
      console.error('Bulk archive error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 削除ハンドラー
  const handleDelete = async () => {
    // 確認ダイアログ
    if (!window.confirm(t('common.inbox.deleteConfirm', { count: selectedCount }))) {
      return
    }

    setIsProcessing(true)
    try {
      const selectedIds = Array.from(getSelectedIds())
      await bulkDeletePlan.mutateAsync({
        ids: selectedIds,
      })

      toast.success(t('common.inbox.deletedCount', { count: selectedIds.length }))
      clearSelection()
    } catch (error) {
      toast.error(t('common.inbox.deleteFailed'))
      console.error('Bulk delete error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-surface-container border-border flex items-center justify-between border-b px-4 py-3">
      {/* 左側: 選択数表示 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{t('common.inbox.selected', { count: selectedCount })}</span>
        <Button variant="ghost" size="sm" onClick={clearSelection} className="h-8">
          <X className="mr-1 size-4" />
          {t('common.inbox.clear')}
        </Button>
      </div>

      {/* 右側: 一括操作ボタン */}
      <div className="flex items-center gap-2">
        {/* ステータス変更 */}
        <Select onValueChange={(value) => handleStatusChange(value as PlanStatus)} disabled={isProcessing}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder={t('common.inbox.changeStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t('common.inbox.status')}</SelectLabel>
              <SelectItem value="backlog">{t('common.inbox.statusBacklog')}</SelectItem>
              <SelectItem value="ready">{t('common.inbox.statusReady')}</SelectItem>
              <SelectItem value="active">{t('common.inbox.statusActive')}</SelectItem>
              <SelectItem value="wait">{t('common.inbox.statusWait')}</SelectItem>
              <SelectItem value="done">{t('common.inbox.statusDone')}</SelectItem>
              <SelectItem value="cancel">{t('common.inbox.statusCancel')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* 期限設定 */}
        <Button variant="outline" size="sm" onClick={handleOpenDateDialog} disabled={isProcessing} className="h-8">
          <Calendar className="mr-1 size-4" />
          {t('common.inbox.dueDate')}
        </Button>

        {/* アーカイブ */}
        <Button variant="outline" size="sm" onClick={handleArchive} disabled={isProcessing} className="h-8">
          <Archive className="mr-1 size-4" />
          {t('common.inbox.archive')}
        </Button>

        {/* 削除 */}
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isProcessing} className="h-8">
          <Trash2 className="mr-1 size-4" />
          {t('common.inbox.delete')}
        </Button>
      </div>

      {/* 期限設定ダイアログ */}
      <BulkDatePickerDialog
        open={showDateDialog}
        onOpenChange={setShowDateDialog}
        selectedIds={Array.from(getSelectedIds())}
        onSuccess={() => {
          clearSelection()
          setShowDateDialog(false)
        }}
      />
    </div>
  )
}
