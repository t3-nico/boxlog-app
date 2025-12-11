'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import { useTagUsage } from '@/features/tags/hooks'
import type { Tag } from '@/features/tags/types'
import { Archive } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TagArchiveDialogProps {
  tag: Tag | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

/**
 * タグアーカイブ確認ダイアログ
 *
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 *
 * スタイルガイド準拠:
 * - 8pxグリッドシステム（p-6, gap-4, mb-6等）
 * - 角丸: rounded-xl（16px）for ダイアログ
 * - Surface: bg-surface（カード、ダイアログ用）
 * - セマンティックカラー: warning系トークン使用
 */
export function TagArchiveDialog({ tag, onClose, onConfirm }: TagArchiveDialogProps) {
  const t = useTranslations()
  const [isArchiving, setIsArchiving] = useState(false)
  const [mounted, setMounted] = useState(false)

  // TanStack Queryでタグ使用状況を取得
  const { data: usage, isLoading } = useTagUsage(tag?.id)

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConfirm = useCallback(async () => {
    setIsArchiving(true)
    try {
      await onConfirm()
    } finally {
      setIsArchiving(false)
    }
  }, [onConfirm])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isArchiving) {
        onClose()
      }
    },
    [isArchiving, onClose]
  )

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    if (!tag) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isArchiving) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [tag, isArchiving, onClose])

  if (!mounted || !tag) return null

  const dialog = (
    <div
      className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-archive-dialog-title"
    >
      <div
        className="animate-in zoom-in-95 fade-in bg-surface text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 512px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="bg-warning/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <Archive className="text-warning size-5" />
          </div>
          <div className="flex-1">
            <h2 id="tag-archive-dialog-title" className="text-lg leading-tight font-semibold">
              {t('tag.archive.confirmTitle', { name: tag.name })}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* 警告 */}
          <div className="bg-warning/10 text-warning border-warning/20 flex items-center gap-2 rounded-xl border p-4">
            <Archive className="size-4 shrink-0" />
            <p className="text-sm font-medium">{t('tag.archive.warning')}</p>
          </div>

          {/* 使用状況 */}
          {isLoading ? (
            <div className="bg-surface-container flex items-center justify-center rounded-xl p-4">
              <div className="border-primary size-5 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : usage ? (
            <div className="bg-surface-container rounded-xl p-4">
              <p className="mb-2 text-sm font-medium">{t('tag.archive.currentUsage')}</p>
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

          {/* アーカイブ後の処理 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('tag.archive.afterArchive')}</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• {t('tag.archive.noNewTagging')}</li>
              <li>• {t('tag.archive.existingItemsStillShown')}</li>
              <li>• {t('tag.archive.statsStillIncluded')}</li>
              <li>• {t('tag.archive.canRestoreAnytime')}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isArchiving} className="hover:bg-state-hover">
            {t('tag.actions.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isArchiving}
            className="bg-warning text-warning-foreground hover:bg-warning-hover"
          >
            {isArchiving ? t('tag.archive.archiving') : t('tag.archive.archiveButton')}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
