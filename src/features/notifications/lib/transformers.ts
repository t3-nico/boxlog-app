import type { Notification, NotificationEntity } from '../types'

/**
 * NotificationEntity (DB) → Notification (Client) 変換
 */
export function transformNotificationEntity(entity: NotificationEntity): Notification {
  return {
    id: entity.id,
    type: entity.type,
    priority: entity.priority,
    title: entity.title,
    message: entity.message ?? undefined,
    relatedEventId: entity.related_event_id ?? undefined,
    relatedTagId: entity.related_tag_id ?? undefined,
    actionUrl: entity.action_url ?? undefined,
    icon: entity.icon ?? undefined,
    data: entity.data,
    isRead: entity.is_read,
    readAt: entity.read_at ? new Date(entity.read_at) : undefined,
    expiresAt: entity.expires_at ? new Date(entity.expires_at) : undefined,
    createdAt: new Date(entity.created_at),
    updatedAt: new Date(entity.updated_at),
  }
}

/**
 * NotificationEntity配列 → Notification配列 変換
 */
export function transformNotificationEntities(entities: NotificationEntity[]): Notification[] {
  return entities.map(transformNotificationEntity)
}

/**
 * 相対時間表示（例: "5分前", "1時間前"）
 */
export function getRelativeTime(date: Date, locale: 'ja' | 'en' = 'ja'): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return locale === 'ja' ? 'たった今' : 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return locale === 'ja' ? `${diffInMinutes}分前` : `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return locale === 'ja' ? `${diffInHours}時間前` : `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return locale === 'ja' ? `${diffInDays}日前` : `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return locale === 'ja' ? `${diffInWeeks}週間前` : `${diffInWeeks}w ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  return locale === 'ja' ? `${diffInMonths}ヶ月前` : `${diffInMonths}mo ago`
}
