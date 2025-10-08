// @ts-nocheck TODO(#389): 型エラー5件を段階的に修正する
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Event } from '../types/events'

import { useEventFilters } from './useEventFilters'

describe('useEventFilters', () => {
  const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
    id: `event-${Math.random()}`,
    title: 'テストイベント',
    description: 'テスト説明',
    startDate: new Date('2025-01-15T10:00:00'),
    endDate: new Date('2025-01-15T11:00:00'),
    type: 'event',
    status: 'inbox',
    color: '#3b82f6',
    priority: 'medium',
    isRecurring: false,
    items: [],
    reminders: [],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    deletedAt: null,
    ...overrides,
  })

  describe('初期化', () => {
    it('初期フィルターが設定される', () => {
      const { result } = renderHook(() =>
        useEventFilters({
          types: ['event'],
          statuses: ['inbox'],
        })
      )

      expect(result.current.filters.types).toEqual(['event'])
      expect(result.current.filters.statuses).toEqual(['inbox'])
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('初期フィルターなしで作成できる', () => {
      const { result } = renderHook(() => useEventFilters())

      expect(result.current.filters.types).toBeUndefined()
      expect(result.current.filters.statuses).toBeUndefined()
      expect(result.current.hasActiveFilters).toBe(false)
    })
  })

  describe('日付範囲フィルター', () => {
    it('開始日より前のイベントが除外される', () => {
      const events: Event[] = [
        createMockEvent({ startDate: new Date('2025-01-10T10:00:00') }),
        createMockEvent({ startDate: new Date('2025-01-20T10:00:00') }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setDateRange(new Date('2025-01-15T00:00:00'), undefined)
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.startDate?.getDate()).toBe(20)
    })

    it('終了日より後のイベントが除外される', () => {
      const events: Event[] = [
        createMockEvent({ endDate: new Date('2025-01-10T11:00:00') }),
        createMockEvent({ endDate: new Date('2025-01-20T11:00:00') }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setDateRange(undefined, new Date('2025-01-15T23:59:59'))
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.endDate?.getDate()).toBe(10)
    })

    it('日付範囲内のイベントのみが返される', () => {
      const events: Event[] = [
        createMockEvent({
          startDate: new Date('2025-01-10T10:00:00'),
          endDate: new Date('2025-01-10T11:00:00'),
        }),
        createMockEvent({
          startDate: new Date('2025-01-15T10:00:00'),
          endDate: new Date('2025-01-15T11:00:00'),
        }),
        createMockEvent({
          startDate: new Date('2025-01-20T10:00:00'),
          endDate: new Date('2025-01-20T11:00:00'),
        }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setDateRange(new Date('2025-01-12T00:00:00'), new Date('2025-01-18T23:59:59'))
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.startDate?.getDate()).toBe(15)
    })
  })

  describe('タイプフィルター', () => {
    it('指定タイプのイベントのみ返される', () => {
      const events: Event[] = [
        createMockEvent({ type: 'event' }),
        createMockEvent({ type: 'task' }),
        createMockEvent({ type: 'reminder' }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setTypes(['event', 'task'])
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(2)
      expect(filtered.every((e) => e.type === 'event' || e.type === 'task')).toBe(true)
    })

    it('タイプフィルター未指定時はすべて返される', () => {
      const events: Event[] = [
        createMockEvent({ type: 'event' }),
        createMockEvent({ type: 'task' }),
        createMockEvent({ type: 'reminder' }),
      ]

      const { result } = renderHook(() => useEventFilters())

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(3)
    })
  })

  describe('ステータスフィルター', () => {
    it('指定ステータスのイベントのみ返される', () => {
      const events: Event[] = [
        createMockEvent({ status: 'inbox' }),
        createMockEvent({ status: 'in-progress' }),
        createMockEvent({ status: 'completed' }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setStatuses(['inbox', 'in-progress'])
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(2)
      expect(filtered.every((e) => e.status === 'inbox' || e.status === 'in-progress')).toBe(true)
    })

    it('ステータスフィルター未指定時はすべて返される', () => {
      const events: Event[] = [createMockEvent({ status: 'inbox' }), createMockEvent({ status: 'completed' })]

      const { result } = renderHook(() => useEventFilters())

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(2)
    })
  })

  describe('タグフィルター', () => {
    it('指定タグを持つイベントが返される', () => {
      const events: Event[] = [
        createMockEvent({ tags: [{ id: 'tag1', name: 'タグ1', color: '#ff0000' }] }),
        createMockEvent({ tags: [{ id: 'tag2', name: 'タグ2', color: '#00ff00' }] }),
        createMockEvent({
          tags: [
            { id: 'tag1', name: 'タグ1', color: '#ff0000' },
            { id: 'tag3', name: 'タグ3', color: '#0000ff' },
          ],
        }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setTagIds(['tag1'])
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(2) // tag1を持つイベントが2つ
    })

    it('複数タグのいずれかを持つイベントが返される（OR条件）', () => {
      const events: Event[] = [
        createMockEvent({ tags: [{ id: 'tag1', name: 'タグ1', color: '#ff0000' }] }),
        createMockEvent({ tags: [{ id: 'tag2', name: 'タグ2', color: '#00ff00' }] }),
        createMockEvent({ tags: [{ id: 'tag3', name: 'タグ3', color: '#0000ff' }] }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setTagIds(['tag1', 'tag2'])
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(2)
    })

    it('タグなしイベントは除外される', () => {
      const events: Event[] = [
        createMockEvent({ tags: [] }),
        createMockEvent({ tags: [{ id: 'tag1', name: 'タグ1', color: '#ff0000' }] }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setTagIds(['tag1'])
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(1)
    })
  })

  describe('検索クエリフィルター', () => {
    it('タイトルに検索語が含まれるイベントが返される', () => {
      const events: Event[] = [
        createMockEvent({ title: '重要な会議' }),
        createMockEvent({ title: 'プロジェクト進捗確認' }),
        createMockEvent({ title: 'ランチ' }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setSearchQuery('会議')
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.title).toBe('重要な会議')
    })

    it('説明に検索語が含まれるイベントが返される', () => {
      const events: Event[] = [
        createMockEvent({ title: 'イベント1', description: '重要な議題を議論' }),
        createMockEvent({ title: 'イベント2', description: '通常の定例会' }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setSearchQuery('議論')
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.title).toBe('イベント1')
    })

    it('大文字小文字を区別しない', () => {
      const events: Event[] = [createMockEvent({ title: 'Important Meeting' })]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setSearchQuery('important')
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(1)
    })

    it('検索クエリが空の場合はすべて返される', () => {
      const events: Event[] = [createMockEvent({ title: 'イベント1' }), createMockEvent({ title: 'イベント2' })]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.setSearchQuery('')
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(2)
    })
  })

  describe('複合フィルター', () => {
    it('複数フィルターが同時に適用される', () => {
      const events: Event[] = [
        createMockEvent({
          title: '会議A',
          type: 'event',
          status: 'inbox',
          tags: [{ id: 'tag1', name: 'タグ1', color: '#ff0000' }],
        }),
        createMockEvent({
          title: '会議B',
          type: 'task',
          status: 'inbox',
          tags: [{ id: 'tag1', name: 'タグ1', color: '#ff0000' }],
        }),
        createMockEvent({
          title: '会議C',
          type: 'event',
          status: 'completed',
          tags: [{ id: 'tag1', name: 'タグ1', color: '#ff0000' }],
        }),
      ]

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.updateFilters({
          types: ['event'],
          statuses: ['inbox'],
          tagIds: ['tag1'],
          searchQuery: '会議',
        })
      })

      const filtered = result.current.applyFilters(events)
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.title).toBe('会議A')
    })
  })

  describe('フィルター管理', () => {
    it('フィルターがクリアされる', () => {
      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.updateFilters({
          types: ['event'],
          statuses: ['inbox'],
          searchQuery: 'test',
        })
      })

      expect(result.current.hasActiveFilters).toBe(true)

      act(() => {
        result.current.clearFilters()
      })

      expect(result.current.filters.types).toBeUndefined()
      expect(result.current.filters.statuses).toBeUndefined()
      expect(result.current.filters.searchQuery).toBeUndefined()
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('hasActiveFiltersが正しく機能する', () => {
      const { result } = renderHook(() => useEventFilters())

      expect(result.current.hasActiveFilters).toBe(false)

      act(() => {
        result.current.setSearchQuery('test')
      })

      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('部分的なフィルター更新が可能', () => {
      const { result } = renderHook(() =>
        useEventFilters({
          types: ['event'],
          statuses: ['inbox'],
        })
      )

      act(() => {
        result.current.updateFilters({
          searchQuery: 'test',
        })
      })

      expect(result.current.filters.types).toEqual(['event'])
      expect(result.current.filters.statuses).toEqual(['inbox'])
      expect(result.current.filters.searchQuery).toBe('test')
    })
  })

  describe('パフォーマンス', () => {
    it('大量のイベントを効率的にフィルタリングできる', () => {
      const events: Event[] = Array.from({ length: 1000 }, (_, i) =>
        createMockEvent({
          title: `イベント${i}`,
          type: i % 2 === 0 ? 'event' : 'task',
          status: i % 3 === 0 ? 'inbox' : 'in-progress',
        })
      )

      const { result } = renderHook(() => useEventFilters())

      act(() => {
        result.current.updateFilters({
          types: ['event'],
          statuses: ['inbox'],
        })
      })

      const startTime = performance.now()
      const filtered = result.current.applyFilters(events)
      const endTime = performance.now()

      expect(filtered.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(100) // 100ms以内
    })
  })
})
