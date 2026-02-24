import { describe, expect, it } from 'vitest';

import type { NotificationEntity } from '../types';

import { transformNotificationEntities, transformNotificationEntity } from './transformers';

describe('transformers', () => {
  describe('transformNotificationEntity', () => {
    it('NotificationEntityをNotificationに変換できる', () => {
      const entity: NotificationEntity = {
        id: 'notif-1',
        user_id: 'user-1',
        type: 'reminder',
        plan_id: 'plan-1',
        is_read: false,
        read_at: null,
        created_at: '2025-01-01T00:00:00Z',
        plans: { title: 'ミーティング' },
      };

      const result = transformNotificationEntity(entity);

      expect(result.id).toBe('notif-1');
      expect(result.type).toBe('reminder');
      expect(result.planId).toBe('plan-1');
      expect(result.planTitle).toBe('ミーティング');
      expect(result.isRead).toBe(false);
      expect(result.readAt).toBeUndefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('nullの値はundefinedに変換される', () => {
      const entity: NotificationEntity = {
        id: 'notif-1',
        user_id: 'user-1',
        type: 'reminder',
        plan_id: null,
        is_read: true,
        read_at: '2025-01-02T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        plans: null,
      };

      const result = transformNotificationEntity(entity);

      expect(result.planId).toBeUndefined();
      expect(result.planTitle).toBeUndefined();
      expect(result.readAt).toBeInstanceOf(Date);
    });
  });

  describe('transformNotificationEntities', () => {
    it('複数のエンティティを変換できる', () => {
      const entities: NotificationEntity[] = [
        {
          id: 'notif-1',
          user_id: 'user-1',
          type: 'reminder',
          plan_id: 'plan-1',
          is_read: false,
          read_at: null,
          created_at: '2025-01-01T00:00:00Z',
          plans: { title: 'タスクA' },
        },
        {
          id: 'notif-2',
          user_id: 'user-1',
          type: 'overdue',
          plan_id: 'plan-2',
          is_read: true,
          read_at: null,
          created_at: '2025-01-02T00:00:00Z',
          plans: { title: 'タスクB' },
        },
      ];

      const result = transformNotificationEntities(entities);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('notif-1');
      expect(result[1]?.id).toBe('notif-2');
    });

    it('空配列を処理できる', () => {
      const result = transformNotificationEntities([]);

      expect(result).toEqual([]);
    });
  });
});
