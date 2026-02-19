import type { Notification, NotificationEntity } from '../types';

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
    relatedPlanId: entity.related_plan_id ?? undefined,
    relatedTagId: entity.related_tag_id ?? undefined,
    actionUrl: entity.action_url ?? undefined,
    icon: entity.icon ?? undefined,
    data: entity.data,
    isRead: entity.is_read,
    readAt: entity.read_at ? new Date(entity.read_at) : undefined,
    expiresAt: entity.expires_at ? new Date(entity.expires_at) : undefined,
    createdAt: new Date(entity.created_at),
    updatedAt: new Date(entity.updated_at),
  };
}

/**
 * NotificationEntity配列 → Notification配列 変換
 */
export function transformNotificationEntities(entities: NotificationEntity[]): Notification[] {
  return entities.map(transformNotificationEntity);
}
