'use client'

import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { useDeleteConfirmStore } from '../stores/useDeleteConfirmStore'

/**
 * プラン削除確認ダイアログ
 *
 * AppLayoutレベルでレンダリングされる独立したダイアログ
 * PlanInspector（Sheet）の外で表示されるため、Portalの問題を回避
 */
export function PlanDeleteConfirmDialog() {
  const t = useTranslations()
  const [isDeleting, setIsDeleting] = useState(false)

  const isOpen = useDeleteConfirmStore((state) => state.isOpen)
  const planTitle = useDeleteConfirmStore((state) => state.planTitle)
  const onConfirm = useDeleteConfirmStore((state) => state.onConfirm)
  const closeDialog = useDeleteConfirmStore((state) => state.closeDialog)

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) return
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
      closeDialog()
    }
  }, [onConfirm, closeDialog])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog()
      }
    },
    [closeDialog]
  )

  return (
    <AlertDialogConfirm
      open={isOpen}
      onOpenChange={handleOpenChange}
      onConfirm={handleConfirm}
      title={
        planTitle
          ? t('common.plan.delete.confirmTitleWithName', { name: planTitle })
          : t('common.plan.delete.confirmTitle')
      }
      description={t('common.plan.delete.description')}
      confirmText={isDeleting ? t('common.plan.delete.deleting') : t('common.plan.delete.confirm')}
      cancelText={t('actions.cancel')}
      isLoading={isDeleting}
      variant="destructive"
    />
  )
}
