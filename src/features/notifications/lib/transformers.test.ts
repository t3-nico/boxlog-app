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
        priority: 'medium',
        title: 'テスト通知',
        message: 'これはテストです',
        related_plan_id: 'plan-1',
        related_tag_id: 'tag-1',
        action_url: '/calendar',
        icon: 'bell',
        data: { key: 'value' },
        is_read: false,
        read_at: null,
        expires_at: '2025-12-31T23:59:59Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const result = transformNotificationEntity(entity);

      expect(result.id).toBe('notif-1');
      expect(result.type).toBe('reminder');
      expect(result.priority).toBe('medium');
      expect(result.title).toBe('テスト通知');
      expect(result.message).toBe('これはテストです');
      expect(result.relatedPlanId).toBe('plan-1');
      expect(result.relatedTagId).toBe('tag-1');
      expect(result.actionUrl).toBe('/calendar');
      expect(result.icon).toBe('bell');
      expect(result.data).toEqual({ key: 'value' });
      expect(result.isRead).toBe(false);
      expect(result.readAt).toBeUndefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('nullの値はundefinedに変換される', () => {
      const entity: NotificationEntity = {
        id: 'notif-1',
        user_id: 'user-1',
        type: 'system',
        priority: 'low',
        title: 'シンプル通知',
        message: null,
        related_plan_id: null,
        related_tag_id: null,
        action_url: null,
        icon: null,
        data: {},
        is_read: true,
        read_at: '2025-01-02T00:00:00Z',
        expires_at: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const result = transformNotificationEntity(entity);

      expect(result.message).toBeUndefined();
      expect(result.relatedPlanId).toBeUndefined();
      expect(result.relatedTagId).toBeUndefined();
      expect(result.actionUrl).toBeUndefined();
      expect(result.icon).toBeUndefined();
      expect(result.expiresAt).toBeUndefined();
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
          priority: 'high',
          title: '通知1',
          message: null,
          related_plan_id: null,
          related_tag_id: null,
          action_url: null,
          icon: null,
          data: {},
          is_read: false,
          read_at: null,
          expires_at: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'notif-2',
          user_id: 'user-1',
          type: 'system',
          priority: 'medium',
          title: '通知2',
          message: null,
          related_plan_id: null,
          related_tag_id: null,
          action_url: null,
          icon: null,
          data: {},
          is_read: true,
          read_at: null,
          expires_at: null,
          created_at: '2025-01-02T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
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
