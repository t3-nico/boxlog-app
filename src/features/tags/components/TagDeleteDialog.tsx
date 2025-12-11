'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTagUsage } from '@/features/tags/hooks'
import type { Tag } from '@/features/tags/types'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TagDeleteDialogProps {
  tag: Tag | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

/**
 * タグ削除確認ダイアログ
 *
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 *
 * スタイルガイド準拠:
 * - 8pxグリッドシステム（p-6, gap-4, mb-6等）
 * - 角丸: rounded-xl（16px）for ダイアログ
 * - Surface: bg-surface（カード、ダイアログ用）
 * - セマンティックカラー: destructive系トークン使用
 */
export function TagDeleteDialog({ tag, onClose, onConfirm }: TagDeleteDialogProps) {
  const t = useTranslations()
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // TanStack Queryでタグ使用状況を取得
  const { data: usage, isLoading } = useTagUsage(tag?.id)

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true)
  }, [])

  // タグが変更されたら確認テキストをリセット
  useEffect(() => {
    if (!tag) {
      setConfirmText('')
    }
  }, [tag])

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }, [onConfirm])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isDeleting) {
        setConfirmText('')
        onClose()
      }
    },
    [isDeleting, onClose]
  )

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    if (!tag) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        setConfirmText('')
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [tag, isDeleting, onClose])

  if (!mounted || !tag) return null

  const requiresConfirmation = (usage?.totalCount || 0) > 50
  const canDelete = !requiresConfirmation || confirmText === tag.name

  const dialog = (
    <div
      className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-delete-dialog-title"
    >
      <div
        className="animate-in zoom-in-95 fade-in bg-surface text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 512px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive size-5" />
          </div>
          <div className="flex-1">
            <h2 id="tag-delete-dialog-title" className="text-lg leading-tight font-semibold">
              {t('tag.delete.confirmTitleWithName', { name: tag.name })}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* 警告 */}
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-xl border p-4">
            <AlertTriangle className="size-4 shrink-0" />
            <p className="text-sm font-medium">{t('tag.delete.warningIrreversible')}</p>
          </div>

          {/* 使用状況 */}
          {isLoading ? (
            <div className="bg-surface-container flex items-center justify-center rounded-xl p-4">
              <div className="border-primary size-5 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : usage ? (
            <div className="bg-surface-container rounded-xl p-4">
              <p className="mb-2 text-sm font-medium">{t('tag.delete.affectedItems')}:</p>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  • {t('tag.delete.plans')}: {t('tag.delete.itemsCount', { count: usage.planCount })}
                </li>
                <li>
                  • {t('tag.delete.events')}: {t('tag.delete.itemsCount', { count: usage.eventCount })}
                </li>
                <li>
                  • {t('tag.delete.tasks')}: {t('tag.delete.itemsCount', { count: usage.taskCount })}
                </li>
              </ul>
              <p className="text-muted-foreground mt-2 text-sm font-medium">
                {t('tag.delete.total')}: {t('tag.delete.itemsCount', { count: usage.totalCount })}
              </p>
            </div>
          ) : null}

          {/* 削除後の処理 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('tag.delete.afterDeletion')}:</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• {t('tag.delete.willBeDeleted', { number: tag.tag_number || '' })}</li>
              <li>• {t('tag.delete.willBeRemovedFromItems')}</li>
              <li>• {t('tag.delete.willBeRemovedFromStats')}</li>
            </ul>
          </div>

          {/* 確認入力（使用件数が50件を超える場合） */}
          {requiresConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirm-input" className="text-sm font-medium">
                {t('tag.delete.confirmInputLabel', { name: tag.name })}
              </Label>
              <Input
                id="confirm-input"
                placeholder={tag.name}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="font-mono"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setConfirmText('')
              onClose()
            }}
            disabled={isDeleting}
            className="hover:bg-state-hover"
          >
            {t('tag.actions.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canDelete || isDeleting}
            className="hover:bg-destructive-hover"
          >
            {isDeleting ? t('tag.delete.deleting') : t('tag.delete.permanentDelete')}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
