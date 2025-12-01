'use client'

import { Button } from '@/components/ui/button'
import type { NotificationType } from '@/schemas/notifications'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ja } from 'date-fns/locale'
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Edit,
  Info,
  PlusCircle,
  Trash2,
} from 'lucide-react'

interface NotificationItemProps {
  id: string
  type: NotificationType
  title: string
  message: string | null
  isRead: boolean
  createdAt: string
  actionUrl?: string | null
  locale: 'ja' | 'en'
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onNavigate?: (url: string) => void
  isDeleting?: boolean
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  reminder: <Bell className="h-4 w-4" />,
  plan_created: <PlusCircle className="h-4 w-4" />,
  plan_updated: <Edit className="h-4 w-4" />,
  plan_deleted: <Trash2 className="h-4 w-4" />,
  plan_completed: <CheckCircle className="h-4 w-4" />,
  trash_warning: <AlertTriangle className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />,
}

const typeColors: Record<NotificationType, string> = {
  reminder: 'text-primary',
  plan_created: 'text-green-600 dark:text-green-400',
  plan_updated: 'text-blue-600 dark:text-blue-400',
  plan_deleted: 'text-destructive',
  plan_completed: 'text-green-600 dark:text-green-400',
  trash_warning: 'text-amber-600 dark:text-amber-400',
  system: 'text-muted-foreground',
}

export function NotificationItem({
  id,
  type,
  title,
  message,
  isRead,
  createdAt,
  actionUrl,
  locale,
  onMarkAsRead,
  onDelete,
  onNavigate,
  isDeleting,
}: NotificationItemProps) {
  const dateLocale = locale === 'ja' ? ja : enUS

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: dateLocale })
    } catch {
      return timestamp
    }
  }

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(id)
    }
    if (actionUrl && onNavigate) {
      onNavigate(actionUrl)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`border-border rounded-xl border p-4 transition-colors ${
        !isRead ? 'bg-muted' : 'bg-card hover:bg-muted/50'
      } ${actionUrl ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={actionUrl || !isRead ? 'button' : undefined}
      tabIndex={actionUrl || !isRead ? 0 : undefined}
    >
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className={`mt-0.5 shrink-0 ${typeColors[type]}`}>
          {typeIcons[type]}
        </div>

        {/* コンテンツ */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold">{title}</h4>
            {!isRead && (
              <span className="bg-primary h-2 w-2 shrink-0 rounded-full" aria-label="未読" />
            )}
          </div>
          {message && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{message}</p>
          )}
          <span className="text-muted-foreground mt-2 block text-xs">
            {formatTime(createdAt)}
          </span>
        </div>

        {/* 削除ボタン */}
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(id)
          }}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
