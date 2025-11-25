// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import { useCallback, useEffect, useState } from 'react'

import { CheckCircle, RotateCcw, X } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

interface DeletedEvent {
  id: string
  title: string
  startDate?: Date
  endDate?: Date
  color?: string
  location?: string
  description?: string
  [key: string]: unknown
}

interface DeleteToastProps {
  deletedEvent: DeletedEvent | null
  onUndo: (event: DeletedEvent) => void
  onDismiss: () => void
  autoHideDelay?: number
}

export const DeleteToast = ({
  deletedEvent,
  onUndo,
  onDismiss,
  autoHideDelay = 6000, // 6秒後に自動非表示
}: DeleteToastProps) => {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(autoHideDelay / 1000)

  useEffect(() => {
    if (deletedEvent) {
      setIsVisible(true)
      setTimeLeft(autoHideDelay / 1000)

      // カウントダウンタイマー
      const countdown = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdown)
            handleClose()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdown)
    } else {
      setIsVisible(false)
    }
  }, [deletedEvent, autoHideDelay, handleClose])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss()
    }, 300) // アニメーション完了後にクリア
  }, [onDismiss])

  const handleUndo = () => {
    if (deletedEvent) {
      onUndo(deletedEvent)
      handleClose()
    }
  }

  if (!deletedEvent) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
      )}
    >
      <div className="max-w-[450px] min-w-[320px] rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
        <div className="flex items-start gap-3">
          {/* 成功アイコン */}
          <div className="mt-0.5 flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>

          {/* メッセージ部分 */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-sm font-medium text-white">{t('common.toast.eventDeleted')}</p>
              {/* カウントダウン表示 */}
              <span className="text-xs text-gray-400">({timeLeft}s)</span>
            </div>

            {/* 削除された予定の情報 */}
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {deletedEvent.color != null && (
                <div className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ backgroundColor: deletedEvent.color }} />
              )}
              <span className="truncate">{deletedEvent.title}</span>
              {deletedEvent.startDate != null && (
                <span className="text-gray-400">
                  {deletedEvent.startDate.toLocaleString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* 元に戻すボタン */}
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-900/20 hover:text-blue-200"
            >
              <RotateCcw className="h-4 w-4" />
              {t('common.undo')}
            </button>

            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-300"
              title={t('common.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-linear"
            style={{
              width: `${(timeLeft / (autoHideDelay / 1000)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
