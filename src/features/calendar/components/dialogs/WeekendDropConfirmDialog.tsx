'use client'

import React from 'react'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { AlertTriangle, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

interface WeekendDropConfirmDialogProps {
  isOpen: boolean
  eventTitle: string
  originalDate: Date
  suggestedDate: Date
  onConfirm: () => void
  onCancel: () => void
  onClose: () => void
}

/**
 * 週末へのドラッグ&ドロップ時の確認ダイアログ
 * 週末表示がOFFの時に、イベントを平日に移動するか確認
 */
export const WeekendDropConfirmDialog = ({
  isOpen,
  eventTitle,
  originalDate,
  suggestedDate,
  onConfirm,
  onCancel,
  onClose,
}: WeekendDropConfirmDialogProps) => {
  const { t } = useI18n()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                'bg-orange-100 dark:bg-orange-900/20'
              )}
            >
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-left">{t('calendar.weekendDropDialog.title')}</DialogTitle>
              <DialogDescription className="mt-1 text-left">
                {t('calendar.weekendDropDialog.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* イベント情報 */}
          <div
            className={cn(
              'rounded-lg border p-4',
              'bg-neutral-100 dark:bg-neutral-800',
              'border-border'
            )}
          >
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
              <div className="min-w-0 flex-1">
                <h3 className={cn('font-medium', 'text-neutral-900 dark:text-neutral-50')}>{eventTitle}</h3>
                <div className="mt-2 space-y-1">
                  <p className={cn('text-sm', 'text-neutral-600 dark:text-neutral-400')}>
                    <span className="font-medium">{t('calendar.weekendDropDialog.sourceLabel')}</span>{' '}
                    {format(originalDate, 'M月d日(E) HH:mm', { locale: ja })}
                  </p>
                  <p className={cn('text-sm', 'text-neutral-600 dark:text-neutral-400')}>
                    <span className="font-medium">{t('calendar.weekendDropDialog.targetLabel')}</span>{' '}
                    {format(suggestedDate, 'M月d日(E) HH:mm', { locale: ja })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 説明テキスト */}
          <div className={cn('text-sm', 'text-neutral-600 dark:text-neutral-400')}>
            <p>{t('calendar.weekendDropDialog.explanation')}</p>
            <p className="mt-2">{t('calendar.weekendDropDialog.hint')}</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            className={cn('flex-1 sm:flex-none', 'bg-blue-500 hover:bg-blue-600', 'text-white')}
          >
            {t('calendar.weekendDropDialog.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * 週末ドロップ確認ダイアログの管理フック
 */
export function useWeekendDropConfirm() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [dialogData, setDialogData] = React.useState<{
    eventTitle: string
    originalDate: Date
    suggestedDate: Date
    onConfirm: () => void
    onCancel: () => void
  } | null>(null)

  const showDialog = React.useCallback(
    (data: {
      eventTitle: string
      originalDate: Date
      suggestedDate: Date
      onConfirm: () => void
      onCancel?: () => void
    }) => {
      setDialogData({
        ...data,
        onCancel: data.onCancel || (() => setIsOpen(false)),
      })
      setIsOpen(true)
    },
    []
  )

  const closeDialog = React.useCallback(() => {
    setIsOpen(false)
    setTimeout(() => setDialogData(null), 150) // アニメーション完了を待つ
  }, [])

  const handleConfirm = React.useCallback(() => {
    dialogData?.onConfirm()
    closeDialog()
  }, [dialogData, closeDialog])

  const handleCancel = React.useCallback(() => {
    dialogData?.onCancel()
    closeDialog()
  }, [dialogData, closeDialog])

  const DialogComponent = React.useCallback(() => {
    if (!dialogData) return null

    return (
      <WeekendDropConfirmDialog
        isOpen={isOpen}
        eventTitle={dialogData.eventTitle}
        originalDate={dialogData.originalDate}
        suggestedDate={dialogData.suggestedDate}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={closeDialog}
      />
    )
  }, [isOpen, dialogData, handleConfirm, handleCancel, closeDialog])

  return {
    showDialog,
    DialogComponent,
  }
}
