import type { Notification, NotificationEntity } from '../types';

/**
 * NotificationEntity (DB) → Notification (Client) 変換
 */
export function transformNotificationEntity(entity: NotificationEntity): Notification {
  return {
    id: entity.id,
    type: entity.type,
    planId: entity.plan_id ?? undefined,
    planTitle: entity.plans?.title ?? undefined,
    isRead: entity.is_read,
    readAt: entity.read_at ? new Date(entity.read_at) : undefined,
    createdAt: new Date(entity.created_at),
  };
}

/**
 * NotificationEntity配列 → Notification配列 変換
 */
export function transformNotificationEntities(entities: NotificationEntity[]): Notification[] {
  return entities.map(transformNotificationEntity);
}
