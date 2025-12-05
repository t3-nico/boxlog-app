import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { NotificationEntity } from '../types'

import { getRelativeTime, transformNotificationEntities, transformNotificationEntity } from './transformers'

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
        related_event_id: 'event-1',
        related_tag_id: 'tag-1',
        action_url: '/calendar',
        icon: 'bell',
        data: { key: 'value' },
        is_read: false,
        read_at: null,
        expires_at: '2025-12-31T23:59:59Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const result = transformNotificationEntity(entity)

      expect(result.id).toBe('notif-1')
      expect(result.type).toBe('reminder')
      expect(result.priority).toBe('normal')
      expect(result.title).toBe('テスト通知')
      expect(result.message).toBe('これはテストです')
      expect(result.relatedEventId).toBe('event-1')
      expect(result.relatedTagId).toBe('tag-1')
      expect(result.actionUrl).toBe('/calendar')
      expect(result.icon).toBe('bell')
      expect(result.data).toEqual({ key: 'value' })
      expect(result.isRead).toBe(false)
      expect(result.readAt).toBeUndefined()
      expect(result.expiresAt).toBeInstanceOf(Date)
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('nullの値はundefinedに変換される', () => {
      const entity: NotificationEntity = {
        id: 'notif-1',
        user_id: 'user-1',
        type: 'system',
        priority: 'low',
        title: 'シンプル通知',
        message: null,
        related_event_id: null,
        related_tag_id: null,
        action_url: null,
        icon: null,
        data: {},
        is_read: true,
        read_at: '2025-01-02T00:00:00Z',
        expires_at: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const result = transformNotificationEntity(entity)

      expect(result.message).toBeUndefined()
      expect(result.relatedEventId).toBeUndefined()
      expect(result.relatedTagId).toBeUndefined()
      expect(result.actionUrl).toBeUndefined()
      expect(result.icon).toBeUndefined()
      expect(result.expiresAt).toBeUndefined()
      expect(result.readAt).toBeInstanceOf(Date)
    })
  })

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
          related_event_id: null,
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
          related_event_id: null,
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
      ]

      const result = transformNotificationEntities(entities)

      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('notif-1')
      expect(result[1]?.id).toBe('notif-2')
    })

    it('空配列を処理できる', () => {
      const result = transformNotificationEntities([])

      expect(result).toEqual([])
    })
  })

  describe('getRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('日本語ロケール', () => {
      it('1分未満は「たった今」を返す', () => {
        const date = new Date('2025-01-15T11:59:30Z')
        expect(getRelativeTime(date, 'ja')).toBe('たった今')
      })

      it('1分以上60分未満は「X分前」を返す', () => {
        const date = new Date('2025-01-15T11:30:00Z')
        expect(getRelativeTime(date, 'ja')).toBe('30分前')
      })

      it('1時間以上24時間未満は「X時間前」を返す', () => {
        const date = new Date('2025-01-15T09:00:00Z')
        expect(getRelativeTime(date, 'ja')).toBe('3時間前')
      })

      it('1日以上7日未満は「X日前」を返す', () => {
        const date = new Date('2025-01-10T12:00:00Z')
        expect(getRelativeTime(date, 'ja')).toBe('5日前')
      })

      it('7日以上28日未満は「X週間前」を返す', () => {
        const date = new Date('2025-01-01T12:00:00Z')
        expect(getRelativeTime(date, 'ja')).toBe('2週間前')
      })

      it('28日以上は「Xヶ月前」を返す', () => {
        const date = new Date('2024-11-15T12:00:00Z')
        expect(getRelativeTime(date, 'ja')).toBe('2ヶ月前')
      })
    })

    describe('英語ロケール', () => {
      it('1分未満は「just now」を返す', () => {
        const date = new Date('2025-01-15T11:59:30Z')
        expect(getRelativeTime(date, 'en')).toBe('just now')
      })

      it('1分以上60分未満は「Xm ago」を返す', () => {
        const date = new Date('2025-01-15T11:30:00Z')
        expect(getRelativeTime(date, 'en')).toBe('30m ago')
      })

      it('1時間以上24時間未満は「Xh ago」を返す', () => {
        const date = new Date('2025-01-15T09:00:00Z')
        expect(getRelativeTime(date, 'en')).toBe('3h ago')
      })

      it('1日以上7日未満は「Xd ago」を返す', () => {
        const date = new Date('2025-01-10T12:00:00Z')
        expect(getRelativeTime(date, 'en')).toBe('5d ago')
      })

      it('7日以上28日未満は「Xw ago」を返す', () => {
        const date = new Date('2025-01-01T12:00:00Z')
        expect(getRelativeTime(date, 'en')).toBe('2w ago')
      })

      it('28日以上は「Xmo ago」を返す', () => {
        const date = new Date('2024-11-15T12:00:00Z')
        expect(getRelativeTime(date, 'en')).toBe('2mo ago')
      })
    })

    it('デフォルトロケールは日本語', () => {
      const date = new Date('2025-01-15T11:30:00Z')
      expect(getRelativeTime(date)).toBe('30分前')
    })
  })
})
