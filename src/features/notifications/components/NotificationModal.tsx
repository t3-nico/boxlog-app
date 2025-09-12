'use client'

import React, { useState } from 'react'

import { X, Bell, BellOff, Settings, Check, Clock, Calendar } from 'lucide-react'

import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { componentRadius, animations, spacing, icon, typography } from '@/config/theme'
import { border, text } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

// import { formatDistanceToNow } from 'date-fns'
// import { ja } from 'date-fns/locale'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  
  // Mock data - 実際のデータは useNotifications から取得
  const mockNotifications = [
    {
      id: '1',
      title: 'ミーティングリマインダー',
      message: '15分後に開始します',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分前
      read: false,
      type: 'reminder'
    },
    {
      id: '2',
      title: 'タスク完了',
      message: 'プロジェクトレポートが完了しました',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分前
      read: true,
      type: 'task'
    },
    {
      id: '3',
      title: 'イベント通知',
      message: '明日の予定が追加されました',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
      read: false,
      type: 'event'
    }
  ]

  const filteredNotifications = activeTab === 'unread' 
    ? mockNotifications.filter(n => !n.read)
    : mockNotifications

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-md mx-4',
        colors.background.surface,
        border.subtle,
        'ring-1 shadow-lg',
        componentRadius.modal.container,
        animations.transition.fast
      )}>
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between',
          'border-b',
          border.subtle,
          spacing.space[4] // p-4
        )}>
          <div className="flex items-center gap-2">
            <Bell className={cn(icon.size.md, text.primary)} />
            <h2 className={cn(typography.heading.h5, text.primary)}>
              通知
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className={cn(
                'w-8 h-8 flex items-center justify-center',
                colors.background.hover,
                componentRadius.button.sm,
                animations.transition.fast
              )}
            >
              <Settings className={cn(icon.size.sm, text.muted)} />
            </button>
            
            <button
              onClick={onClose}
              className={cn(
                'w-8 h-8 flex items-center justify-center',
                colors.background.hover,
                componentRadius.button.sm,
                animations.transition.fast
              )}
            >
              <X className={cn(icon.size.sm, text.muted)} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={cn(
          'flex border-b',
          border.subtle
        )}>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 py-2 text-center',
              typography.body.sm,
              activeTab === 'all' 
                ? cn(text.primary, 'border-b-2 border-blue-500')
                : text.muted,
              animations.transition.fast
            )}
          >
            すべて
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={cn(
              'flex-1 py-2 text-center relative',
              typography.body.sm,
              activeTab === 'unread'
                ? cn(text.primary, 'border-b-2 border-blue-500')
                : text.muted,
              animations.transition.fast
            )}
          >
            未読
            {mockNotifications.filter(n => !n.read).length > 0 && (
              <span className={cn(
                'absolute -top-1 -right-1 w-5 h-5',
                'bg-red-500 text-white text-xs',
                'flex items-center justify-center',
                componentRadius.badge.pill
              )}>
                {mockNotifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Notification List */}
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className={cn(
              'flex flex-col items-center justify-center py-16',
              text.muted
            )}>
              <BellOff className={cn(icon.size.lg, 'mb-3')} />
              <p className={typography.body.sm}>
                {activeTab === 'unread' ? '未読の通知はありません' : '通知はありません'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 flex gap-3',
                    !notification.read && 'bg-blue-50/5',
                    'hover:bg-accent/50',
                    animations.transition.fast,
                    'cursor-pointer'
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    'w-10 h-10 flex items-center justify-center',
                    'rounded-full',
                    notification.type === 'reminder' && 'bg-orange-100 text-orange-600',
                    notification.type === 'task' && 'bg-green-100 text-green-600',
                    notification.type === 'event' && 'bg-blue-100 text-blue-600'
                  )}>
                    {notification.type === 'reminder' && <Clock className={icon.size.sm} />}
                    {notification.type === 'task' && <Check className={icon.size.sm} />}
                    {notification.type === 'event' && <Calendar className={icon.size.sm} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={cn(
                          typography.body.sm,
                          'font-medium',
                          text.primary
                        )}>
                          {notification.title}
                        </p>
                        <p className={cn(
                          typography.body.xs,
                          text.muted,
                          'mt-0.5'
                        )}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          'bg-blue-500',
                          'flex-shrink-0 mt-2'
                        )} />
                      )}
                    </div>
                    <p className={cn(
                      typography.body.xs,
                      text.muted,
                      'mt-1'
                    )}>
                      {/* 一時的に簡単な時間表示 */}
                      {new Date(notification.timestamp).toLocaleTimeString('ja-JP')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className={cn(
            'border-t px-4 py-3',
            border.subtle
          )}>
            <button className={cn(
              'w-full py-2',
              typography.body.sm,
              text.primary,
              colors.background.hover,
              componentRadius.button.md,
              animations.transition.fast
            )}>
              すべて既読にする
            </button>
          </div>
        )}
      </div>
    </div>
  )
}