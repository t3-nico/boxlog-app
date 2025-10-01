import { renderHook } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'

import type { CalendarEvent } from '@/features/events/types/events'

import { CacheManager, useMemoizedEvents } from './useMemoizedEvents'

describe('useMemoizedEvents', () => {
  beforeEach(() => {
    // 各テスト前にキャッシュをクリア
    CacheManager.clearAllCaches()
  })

  describe('基本的なフィルタリング', () => {
    it('日付範囲内のイベントのみ返す', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          type: 'event',
          status: 'confirmed',
          color: '#3b82f6',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          displayStartDate: new Date('2024-06-15T10:00:00'),
          displayEndDate: new Date('2024-06-15T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: 'イベント2',
          type: 'event',
          status: 'confirmed',
          color: '#3b82f6',
          startDate: new Date('2024-06-20T10:00:00'),
          endDate: new Date('2024-06-20T11:00:00'),
          displayStartDate: new Date('2024-06-20T10:00:00'),
          displayEndDate: new Date('2024-06-20T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-3',
          title: 'イベント3',
          type: 'event',
          status: 'confirmed',
          color: '#3b82f6',
          startDate: new Date('2024-06-25T10:00:00'),
          endDate: new Date('2024-06-25T11:00:00'),
          displayStartDate: new Date('2024-06-25T10:00:00'),
          displayEndDate: new Date('2024-06-25T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-21')

      const { result } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate)
      )

      expect(result.current.processedEvents).toHaveLength(2)
      expect(result.current.processedEvents[0].id).toBe('event-1')
      expect(result.current.processedEvents[1].id).toBe('event-2')
    })

    it('startDateがundefinedのイベントは除外される', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          type: 'event',
          status: 'confirmed',
          color: '#3b82f6',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          displayStartDate: new Date('2024-06-15T10:00:00'),
          displayEndDate: new Date('2024-06-15T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: 'イベント2',
          type: 'event',
          status: 'confirmed',
          color: '#3b82f6',
          startDate: undefined,
          endDate: new Date('2024-06-20T11:00:00'),
          displayStartDate: new Date('2024-06-20T11:00:00'),
          displayEndDate: new Date('2024-06-20T11:00:00'),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-21')

      const { result } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate)
      )

      expect(result.current.processedEvents).toHaveLength(1)
      expect(result.current.processedEvents[0].id).toBe('event-1')
    })
  })

  describe('イベントのグルーピング', () => {
    it('日付別にイベントをグルーピングする', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: 'イベント2',
          startDate: new Date('2024-06-15T14:00:00'),
          endDate: new Date('2024-06-15T15:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-3',
          title: 'イベント3',
          startDate: new Date('2024-06-16T10:00:00'),
          endDate: new Date('2024-06-16T11:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-17')

      const { result } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate)
      )

      expect(result.current.eventsByDate.size).toBe(2)
      expect(result.current.eventsByDate.get('2024-06-15')).toHaveLength(2)
      expect(result.current.eventsByDate.get('2024-06-16')).toHaveLength(1)
    })

    it('時間別にイベントをグルーピングする', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: 'イベント2',
          startDate: new Date('2024-06-15T10:30:00'),
          endDate: new Date('2024-06-15T11:30:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-3',
          title: 'イベント3',
          startDate: new Date('2024-06-15T14:00:00'),
          endDate: new Date('2024-06-15T15:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-16')

      const { result } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate)
      )

      expect(result.current.eventsByHour.size).toBe(2)
      expect(result.current.eventsByHour.get(10)).toHaveLength(2)
      expect(result.current.eventsByHour.get(14)).toHaveLength(1)
    })
  })

  describe('合計時間の計算', () => {
    it('イベントの合計時間を計算する', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'), // 1時間
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: 'イベント2',
          startDate: new Date('2024-06-15T14:00:00'),
          endDate: new Date('2024-06-15T15:30:00'), // 1.5時間
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-16')

      const { result } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate)
      )

      // 合計2.5時間 = 9000000ミリ秒
      expect(result.current.totalDuration).toBe(9000000)
    })
  })

  describe('重複イベントの検出', () => {
    it('重複するイベントを検出する', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: 'イベント2',
          startDate: new Date('2024-06-15T10:30:00'),
          endDate: new Date('2024-06-15T11:30:00'), // 重複
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-3',
          title: 'イベント3',
          startDate: new Date('2024-06-15T12:00:00'),
          endDate: new Date('2024-06-15T13:00:00'), // 重複なし
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-16')

      const { result } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate)
      )

      expect(result.current.overlappingEvents).toHaveLength(1)
      expect(result.current.overlappingEvents[0]).toHaveLength(2)
      expect(result.current.overlappingEvents[0][0].id).toBe('event-1')
      expect(result.current.overlappingEvents[0][1].id).toBe('event-2')
    })
  })

  describe('フィルター機能', () => {
    it('タグでフィルタリングできる', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          tags: ['tag1', 'tag2'],
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: 'イベント2',
          startDate: new Date('2024-06-15T14:00:00'),
          endDate: new Date('2024-06-15T15:00:00'),
          tags: ['tag3'],
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-16')
      const filters = { tags: ['tag1'] }

      const { result } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate, filters)
      )

      expect(result.current.processedEvents).toHaveLength(1)
      expect(result.current.processedEvents[0].id).toBe('event-1')
    })

    it('検索クエリでフィルタリングできる', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'ミーティング',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: 'ランチ',
          startDate: new Date('2024-06-15T14:00:00'),
          endDate: new Date('2024-06-15T15:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-16')
      const filters = { searchQuery: 'ミーティング' }

      const { result } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate, filters)
      )

      expect(result.current.processedEvents).toHaveLength(1)
      expect(result.current.processedEvents[0].id).toBe('event-1')
    })
  })

  describe('キャッシュ機能', () => {
    it('同じ入力で2回目はキャッシュから返す', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-16')

      // 1回目
      const { result: result1 } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate)
      )

      // 2回目（キャッシュから取得されるはず）
      const { result: result2 } = renderHook(() =>
        useMemoizedEvents(events, startDate, endDate)
      )

      expect(result1.current.processedEvents).toEqual(
        result2.current.processedEvents
      )
    })

    it('CacheManagerでキャッシュをクリアできる', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント1',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-15T11:00:00'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const startDate = new Date('2024-06-14')
      const endDate = new Date('2024-06-16')

      renderHook(() => useMemoizedEvents(events, startDate, endDate))

      const statsBefore = CacheManager.getCacheStats()
      expect(statsBefore.eventCacheSize).toBeGreaterThan(0)

      CacheManager.clearEventCache()

      const statsAfter = CacheManager.getCacheStats()
      expect(statsAfter.eventCacheSize).toBe(0)
    })
  })
})
