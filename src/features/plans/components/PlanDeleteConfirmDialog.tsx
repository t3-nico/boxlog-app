'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDeleteConfirmStore } from '../stores/useDeleteConfirmStore'

/**
 * プラン削除確認ダイアログ
 *
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 * shadcn/uiのAlertDialogの代わりにシンプルなdiv実装
 *
 * スタイルガイド準拠:
 * - 8pxグリッドシステム（p-6, gap-4, mb-4等）
 * - 角丸: rounded-xl（16px）for ダイアログ
 * - Surface: bg-surface（カード、ダイアログ用）
 * - セマンティックカラー: destructive系トークン使用
 */
export function PlanDeleteConfirmDialog() {
  const t = useTranslations()
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isOpen = useDeleteConfirmStore((state) => state.isOpen)
  const planTitle = useDeleteConfirmStore((state) => state.planTitle)
  const onConfirm = useDeleteConfirmStore((state) => state.onConfirm)
  const closeDialog = useDeleteConfirmStore((state) => state.closeDialog)

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true)
  }, [])

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        closeDialog()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDeleting, closeDialog])

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

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isDeleting) {
        closeDialog()
      }
    },
    [isDeleting, closeDialog]
  )

  if (!mounted || !isOpen) return null

  const title = planTitle
    ? t('common.plan.delete.confirmTitleWithName', { name: planTitle })
    : t('common.plan.delete.confirmTitle')

  const dialog = (
    <div
      className="animate-in fade-in bg-overlay-heavy fixed inset-0 z-[250] flex items-center justify-center duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      {/* ダイアログコンテンツ: bg-surface, rounded-xl, p-6 */}
      <div
        className="animate-in zoom-in-95 fade-in bg-surface text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 448px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: gap-4準拠 */}
        <div className="mb-6 flex items-start gap-4">
          {/* 警告アイコン: destructive系カラー */}
          <div className="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive size-5" />
          </div>
          <div className="flex-1">
            <h2 id="delete-dialog-title" className="text-lg leading-tight font-semibold">
              {title}
            </h2>
            <p id="delete-dialog-description" className="text-muted-foreground mt-2 text-sm">
              {t('common.plan.delete.description')}
            </p>
          </div>
        </div>

        {/* Footer: gap-2, justify-end */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeDialog} disabled={isDeleting} className="hover:bg-state-hover">
            {t('actions.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="hover:bg-destructive-hover"
          >
            {isDeleting ? t('common.plan.delete.deleting') : t('common.plan.delete.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
