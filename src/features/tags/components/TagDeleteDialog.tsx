'use client'

import { useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/features/i18n/lib/hooks'
import type { TagUsage, TagWithChildren } from '@/types/tags'
import { AlertTriangle } from 'lucide-react'

interface TagDeleteDialogProps {
  tag: TagWithChildren | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function TagDeleteDialog({ tag, onClose, onConfirm }: TagDeleteDialogProps) {
  const { t } = useI18n()
  const [confirmText, setConfirmText] = useState('')
  const [usage, setUsage] = useState<TagUsage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // タグの使用状況を取得
  useEffect(() => {
    if (!tag) {
      setUsage(null)
      setConfirmText('')
      return
    }

    const fetchUsage = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/tags/${tag.id}?usage=true`)
        if (response.ok) {
          const data = await response.json()
          setUsage(data.usage || { planCount: 0, eventCount: 0, taskCount: 0, totalCount: 0 })
        } else {
          // エラー時はデフォルト値
          setUsage({ planCount: 0, eventCount: 0, taskCount: 0, totalCount: 0 })
        }
      } catch (error) {
        console.error('Failed to fetch tag usage:', error)
        setUsage({ planCount: 0, eventCount: 0, taskCount: 0, totalCount: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
  }, [tag])

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }

  const requiresConfirmation = (usage?.totalCount || 0) > 50
  const canDelete = !requiresConfirmation || confirmText === tag?.name

  return (
    <AlertDialog open={!!tag} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-3xl gap-0 p-6">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle>{t('tags.delete.confirmTitleWithName', { name: tag?.name || '' })}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-3">
          {/* 警告 */}
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-xl border p-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{t('tags.delete.warningIrreversible')}</p>
          </div>

          {/* 使用状況 */}
          {isLoading ? (
            <div className="bg-muted flex items-center justify-center rounded-xl p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : usage ? (
            <div className="bg-muted rounded-xl p-4">
              <p className="mb-2 text-sm font-medium">{t('tags.delete.affectedItems')}:</p>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  • {t('tags.delete.plans')}: {t('tags.delete.itemsCount', { count: usage.planCount })}
                </li>
                <li>
                  • {t('tags.delete.events')}: {t('tags.delete.itemsCount', { count: usage.eventCount })}
                </li>
                <li>
                  • {t('tags.delete.tasks')}: {t('tags.delete.itemsCount', { count: usage.taskCount })}
                </li>
              </ul>
              <p className="text-muted-foreground mt-2 text-sm font-medium">
                {t('tags.delete.total')}: {t('tags.delete.itemsCount', { count: usage.totalCount })}
              </p>
            </div>
          ) : null}

          {/* 削除後の処理 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('tags.delete.afterDeletion')}:</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>✓ {t('tags.delete.willBeDeleted', { number: tag?.tag_number || '' })}</li>
              <li>✓ {t('tags.delete.willBeRemovedFromItems')}</li>
              <li>✓ {t('tags.delete.willBeRemovedFromStats')}</li>
            </ul>
          </div>

          {/* 確認入力（使用件数が50件を超える場合） */}
          {requiresConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirm-input" className="text-sm font-medium">
                {t('tags.delete.confirmInputLabel', { name: tag?.name || '' })}
              </Label>
              <Input
                id="confirm-input"
                placeholder={tag?.name}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="font-mono"
              />
            </div>
          )}
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isDeleting}>{t('tags.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canDelete || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t('tags.delete.deleting') : t('tags.delete.permanentDelete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
