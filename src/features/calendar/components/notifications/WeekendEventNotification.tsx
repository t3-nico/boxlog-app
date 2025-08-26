'use client'

import React, { useEffect, useState } from 'react'
import { CalendarDays, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { secondary, background, border, text } from '@/config/theme/colors'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'

interface WeekendEventNotificationProps {
  hiddenEventCount: number
  onDismiss?: () => void
  className?: string
}

/**
 * 週末のイベント非表示通知コンポーネント
 * 週末表示がOFFの時に隠されたイベント数を通知
 */
export function WeekendEventNotification({
  hiddenEventCount,
  onDismiss,
  className
}: WeekendEventNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const { showWeekends } = useCalendarSettingsStore()

  useEffect(() => {
    // 週末非表示 && 隠されたイベントがある場合に表示
    if (!showWeekends && hiddenEventCount > 0) {
      setShouldShow(true)
      setIsVisible(true)
      
      // 5秒後に自動で非表示
      const timer = setTimeout(() => {
        handleDismiss()
      }, 5000)
      
      return () => clearTimeout(timer)
    } else {
      setShouldShow(false)
      setIsVisible(false)
    }
  }, [showWeekends, hiddenEventCount])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      setShouldShow(false)
      onDismiss?.()
    }, 300) // アニメーション完了を待つ
  }

  if (!shouldShow) return null

  return (
    <div 
      className={cn(
        'fixed top-20 right-4 z-50 max-w-sm',
        'transform transition-all duration-300 ease-in-out',
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0',
        className
      )}
    >
      <div className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg',
        background.surface,
        border.DEFAULT,
        'border'
      )}>
        <div className="flex-shrink-0">
          <CalendarDays className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', text.primary)}>
            週末のイベントが非表示になりました
          </p>
          <p className={cn('text-xs mt-1', text.secondary)}>
            {hiddenEventCount}件のイベントが週末表示OFF時に非表示になっています
          </p>
        </div>
        
        <button
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded-md',
            'transition-colors',
            secondary.hover,
            text.secondary,
            'hover:' + text.primary
          )}
          aria-label="通知を閉じる"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}