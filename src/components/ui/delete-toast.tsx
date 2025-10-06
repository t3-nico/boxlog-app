// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { CheckCircle, RotateCcw, X } from 'lucide-react'

import { useI18n } from '@/lib/i18n/hooks'
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
  autoHideDelay = 6000 // 6秒後に自動非表示
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
        setTimeLeft(prev => {
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
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out",
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95"
      )}
    >
      <div className="bg-gray-800 dark:bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 p-4 min-w-[320px] max-w-[450px]">
        <div className="flex items-start gap-3">
          {/* 成功アイコン */}
          <div className="flex-shrink-0 mt-0.5">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>

          {/* メッセージ部分 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-white">
                {t('common.toast.eventDeleted')}
              </p>
              {/* カウントダウン表示 */}
              <span className="text-xs text-gray-400">
                ({timeLeft}s)
              </span>
            </div>
            
            {/* 削除された予定の情報 */}
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {deletedEvent.color != null && (
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: deletedEvent.color }}
                />
              )}
              <span className="truncate">{deletedEvent.title}</span>
              {deletedEvent.startDate != null && (
                <span className="text-gray-400">
                  {deletedEvent.startDate.toLocaleString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 元に戻すボタン */}
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t('common.undo')}
            </button>

            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
              title={t('common.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${(timeLeft / (autoHideDelay / 1000)) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}