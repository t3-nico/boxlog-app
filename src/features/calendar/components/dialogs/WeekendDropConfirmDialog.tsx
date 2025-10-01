'use client'

import React from 'react'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/shadcn-ui/dialog'
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
  onClose
}: WeekendDropConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full',
              'bg-orange-100 dark:bg-orange-900/20'
            )}>
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-left">
                週末への移動を検出しました
              </DialogTitle>
              <DialogDescription className="text-left mt-1">
                現在週末表示がOFFになっています
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* イベント情報 */}
          <div className={cn(
            'p-4 rounded-lg border',
            'bg-neutral-100 dark:bg-neutral-800',
            'border-neutral-200 dark:border-neutral-700'
          )}>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className={cn('font-medium', 'text-neutral-900 dark:text-neutral-50')}>
                  {eventTitle}
                </h3>
                <div className="space-y-1 mt-2">
                  <p className={cn('text-sm', 'text-neutral-600 dark:text-neutral-400')}>
                    <span className="font-medium">移動元:</span> {' '}
                    {format(originalDate, 'M月d日(E) HH:mm', { locale: ja })}
                  </p>
                  <p className={cn('text-sm', 'text-neutral-600 dark:text-neutral-400')}>
                    <span className="font-medium">移動先:</span> {' '}
                    {format(suggestedDate, 'M月d日(E) HH:mm', { locale: ja })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 説明テキスト */}
          <div className={cn('text-sm', 'text-neutral-600 dark:text-neutral-400')}>
            <p>
              週末表示がOFFのため、このイベントを次の平日（月曜日）に自動的に移動します。
            </p>
            <p className="mt-2">
              週末に移動したい場合は、設定で「週末表示」をONにしてからもう一度お試しください。
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            キャンセル
          </Button>
          <Button
            onClick={onConfirm}
            className={cn(
              'flex-1 sm:flex-none',
              'bg-blue-500 hover:bg-blue-600',
              'text-white'
            )}
          >
            月曜日に移動
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

  const showDialog = React.useCallback((data: {
    eventTitle: string
    originalDate: Date
    suggestedDate: Date
    onConfirm: () => void
    onCancel?: () => void
  }) => {
    setDialogData({
      ...data,
      onCancel: data.onCancel || (() => setIsOpen(false))
    })
    setIsOpen(true)
  }, [])

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
    DialogComponent
  }
}