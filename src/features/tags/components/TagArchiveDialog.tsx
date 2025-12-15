'use client'

import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTagUsage } from '@/features/tags/hooks'
import type { Tag } from '@/features/tags/types'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TagArchiveDialogProps {
  tag: Tag | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function TagArchiveDialog({ tag, onClose, onConfirm }: TagArchiveDialogProps) {
  const t = useTranslations()
  const [isArchiving, setIsArchiving] = useState(false)

  // TanStack Queryでタグ使用状況を取得
  const { data: usage, isPending } = useTagUsage(tag?.id)

  const handleConfirm = async () => {
    setIsArchiving(true)
    try {
      await onConfirm()
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <AlertDialog open={!!tag} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-2xl gap-0 p-6">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle>{t('tag.archive.confirmTitle', { name: tag?.name || '' })}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-3">
          {/* 警告 */}
          <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl border p-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{t('tag.archive.warning')}</p>
          </div>

          {/* 使用状況 */}
          {isPending ? (
            <div className="bg-surface-container flex items-center justify-center rounded-xl p-4">
              <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2"></div>
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
              <li>✓ {t('tag.archive.noNewTagging')}</li>
              <li>✓ {t('tag.archive.existingItemsStillShown')}</li>
              <li>✓ {t('tag.archive.statsStillIncluded')}</li>
              <li>✓ {t('tag.archive.canRestoreAnytime')}</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isArchiving}>{t('tag.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isArchiving}
            className="bg-warning text-warning-foreground hover:bg-warning/92"
          >
            {isArchiving ? t('tag.archive.archiving') : t('tag.archive.archiveButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
