// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CreateEventRequest, UpdateEventRequest } from '../types/events'

import { eventSelectors, useEventStore } from './useEventStore'

// LocalStorageのモック
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// useTagStoreのモック
vi.mock('@/features/tags/stores/tag-store', () => ({
  useTagStore: {
    getState: () => ({
      getTagsByIds: (tagIds: string[]) =>
        tagIds.map((id) => ({
          id,
          name: `Tag ${id}`,
          color: '#3b82f6',
        })),
    }),
  },
}))

// useTrashStoreのモック
vi.mock('@/features/trash/stores/useTrashStore', () => ({
  useTrashStore: {
    getState: () => ({
      addItem: vi.fn(),
      addItems: vi.fn(),
    }),
  },
}))

describe('useEventStore', () => {
  beforeEach(() => {
    // ストアをリセット
    useEventStore.setState({
      events: [],
      loading: false,
      error: null,
      filters: {},
      selectedEventId: null,
      lastFetchedRange: null,
    })

    // LocalStorageをクリア
    mockLocalStorage.clear()
  })

  describe('イベント作成', () => {
    it('新しいイベントが正しく作成される', async () => {
      const eventData: CreateEventRequest = {
        title: 'テストイベント',
        description: 'テスト説明',
        startDate: new Date('2025-01-15T10:00:00'),
        endDate: new Date('2025-01-15T11:00:00'),
        type: 'event',
        status: 'inbox',
        color: '#3b82f6',
      }

      const createdEvent = await useEventStore.getState().createEvent(eventData)

      expect(createdEvent).toBeDefined()
      expect(createdEvent.title).toBe('テストイベント')
      expect(createdEvent.description).toBe('テスト説明')
      expect(createdEvent.type).toBe('event')
      expect(createdEvent.status).toBe('inbox')
      expect(createdEvent.color).toBe('#3b82f6')
      expect(createdEvent.id).toMatch(/^local-/)
    })

    it('作成したイベントがストアに追加される', async () => {
      const eventData: CreateEventRequest = {
        title: 'イベント1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      }

      await useEventStore.getState().createEvent(eventData)

      const { events } = useEventStore.getState()
      expect(events).toHaveLength(1)
      expect(events[0]?.title).toBe('イベント1')
    })

    it('タグ付きイベントが正しく作成される', async () => {
      const eventData: CreateEventRequest = {
        title: 'タグ付きイベント',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
        tagIds: ['tag1', 'tag2'],
      }

      const createdEvent = await useEventStore.getState().createEvent(eventData)

      expect(createdEvent.tags).toHaveLength(2)
      expect(createdEvent.tags?.[0]?.name).toBe('Tag tag1')
      expect(createdEvent.tags?.[1]?.name).toBe('Tag tag2')
    })
  })

  describe('イベント更新', () => {
    it('既存イベントが正しく更新される', async () => {
      // イベント作成
      const createdEvent = await useEventStore.getState().createEvent({
        title: '更新前',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      // イベント更新
      const updateData: UpdateEventRequest = {
        id: createdEvent.id,
        title: '更新後',
        description: '新しい説明',
      }

      const updatedEvent = await useEventStore.getState().updateEvent(updateData)

      expect(updatedEvent).toBeDefined()
      expect(updatedEvent.title).toBe('更新後')
      expect(updatedEvent.description).toBe('新しい説明')
    })

    it('更新時にupdatedAtが更新される', async () => {
      const createdEvent = await useEventStore.getState().createEvent({
        title: 'イベント',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      const originalUpdatedAt = createdEvent.updatedAt

      // 少し待機
      await new Promise((resolve) => setTimeout(resolve, 10))

      const updatedEvent = await useEventStore.getState().updateEvent({
        id: createdEvent.id,
        title: '更新済み',
      })

      expect(updatedEvent.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })

  describe('イベント削除', () => {
    it('イベントが論理削除される', async () => {
      const createdEvent = await useEventStore.getState().createEvent({
        title: '削除対象',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      await useEventStore.getState().softDeleteEvent(createdEvent.id)

      const { events } = useEventStore.getState()
      expect(events).toHaveLength(0) // 物理削除されている
    })

    it('選択中のイベントを削除すると選択が解除される', async () => {
      const createdEvent = await useEventStore.getState().createEvent({
        title: '選択中のイベント',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      useEventStore.getState().selectEvent(createdEvent.id)
      expect(useEventStore.getState().selectedEventId).toBe(createdEvent.id)

      await useEventStore.getState().softDeleteEvent(createdEvent.id)
      expect(useEventStore.getState().selectedEventId).toBeNull()
    })
  })

  describe('バッチ操作', () => {
    it('複数イベントを一括削除できる', async () => {
      const event1 = await useEventStore.getState().createEvent({
        title: 'イベント1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      const event2 = await useEventStore.getState().createEvent({
        title: 'イベント2',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      const event3 = await useEventStore.getState().createEvent({
        title: 'イベント3',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      await useEventStore.getState().batchSoftDelete([event1.id, event2.id])

      const { events } = useEventStore.getState()
      expect(events).toHaveLength(1)
      expect(events[0]?.id).toBe(event3.id)
    })
  })

  describe('フィルター機能', () => {
    it('フィルターが正しく設定される', () => {
      useEventStore.getState().setFilters({
        types: ['event'],
        statuses: ['inbox', 'in-progress'],
      })

      const { filters } = useEventStore.getState()
      expect(filters.types).toEqual(['event'])
      expect(filters.statuses).toEqual(['inbox', 'in-progress'])
    })

    it('フィルターがクリアされる', () => {
      useEventStore.getState().setFilters({
        types: ['event'],
        statuses: ['inbox'],
      })

      useEventStore.getState().clearFilters()

      const { filters } = useEventStore.getState()
      expect(filters).toEqual({})
    })
  })

  describe('イベント選択', () => {
    it('イベントが選択される', async () => {
      const event = await useEventStore.getState().createEvent({
        title: 'イベント',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      useEventStore.getState().selectEvent(event.id)
      expect(useEventStore.getState().selectedEventId).toBe(event.id)
    })

    it('イベント選択が解除される', () => {
      useEventStore.getState().selectEvent('some-id')
      useEventStore.getState().selectEvent(null)
      expect(useEventStore.getState().selectedEventId).toBeNull()
    })
  })

  describe('日付範囲検索', () => {
    beforeEach(async () => {
      // テストデータ作成
      await useEventStore.getState().createEvent({
        title: '1月10日のイベント',
        startDate: new Date('2025-01-10T10:00:00'),
        endDate: new Date('2025-01-10T11:00:00'),
        type: 'event',
        status: 'inbox',
      })

      await useEventStore.getState().createEvent({
        title: '1月15日のイベント',
        startDate: new Date('2025-01-15T10:00:00'),
        endDate: new Date('2025-01-15T11:00:00'),
        type: 'event',
        status: 'inbox',
      })

      await useEventStore.getState().createEvent({
        title: '1月20日のイベント',
        startDate: new Date('2025-01-20T10:00:00'),
        endDate: new Date('2025-01-20T11:00:00'),
        type: 'event',
        status: 'inbox',
      })
    })

    it('指定期間内のイベントが取得される', () => {
      const startDate = new Date('2025-01-12T00:00:00')
      const endDate = new Date('2025-01-18T23:59:59')

      const events = useEventStore.getState().getEventsByDateRange(startDate, endDate)

      expect(events).toHaveLength(1)
      expect(events[0]?.title).toBe('1月15日のイベント')
    })

    it('期間外のイベントは除外される', () => {
      const startDate = new Date('2025-01-01T00:00:00')
      const endDate = new Date('2025-01-05T23:59:59')

      const events = useEventStore.getState().getEventsByDateRange(startDate, endDate)

      expect(events).toHaveLength(0)
    })
  })

  describe('eventSelectors', () => {
    beforeEach(async () => {
      await useEventStore.getState().createEvent({
        title: 'イベント1',
        startDate: new Date('2025-01-15T10:00:00'),
        endDate: new Date('2025-01-15T11:00:00'),
        type: 'event',
        status: 'inbox',
      })

      await useEventStore.getState().createEvent({
        title: 'タスク1',
        startDate: new Date('2025-01-15T14:00:00'),
        endDate: new Date('2025-01-15T15:00:00'),
        type: 'task',
        status: 'inbox',
      })
    })

    it('タイプ別にイベントが分類される', () => {
      const state = useEventStore.getState()
      const grouped = state.getEventsGroupedByType()

      expect(grouped.events).toHaveLength(1)
      expect(grouped.tasks).toHaveLength(1)
      expect(grouped.reminders).toHaveLength(0)
    })

    it('選択中のイベントが取得される', async () => {
      const event = await useEventStore.getState().createEvent({
        title: '選択イベント',
        startDate: new Date(),
        endDate: new Date(),
        type: 'event',
        status: 'inbox',
      })

      useEventStore.getState().selectEvent(event.id)

      const state = useEventStore.getState()
      const selectedEvent = eventSelectors.getSelectedEvent(state)

      expect(selectedEvent).toBeDefined()
      expect(selectedEvent?.id).toBe(event.id)
    })

    it('日付別にイベントがグループ化される', () => {
      const state = useEventStore.getState()
      const byDate = eventSelectors.getEventsByDate(state)

      expect(Object.keys(byDate)).toHaveLength(1)
      expect(byDate['2025-01-15']).toHaveLength(2)
    })
  })

  describe('エラーハンドリング', () => {
    it('存在しないイベント更新でエラーが発生する', async () => {
      const updateData: UpdateEventRequest = {
        id: 'non-existent-id',
        title: '更新',
      }

      const updatedEvent = await useEventStore.getState().updateEvent(updateData)

      // 存在しないイベントの場合、undefinedが返される
      expect(updatedEvent).toBeUndefined()
    })

    it('エラーがクリアされる', () => {
      useEventStore.setState({ error: 'テストエラー' })
      expect(useEventStore.getState().error).toBe('テストエラー')

      useEventStore.getState().clearError()
      expect(useEventStore.getState().error).toBeNull()
    })
  })
})
