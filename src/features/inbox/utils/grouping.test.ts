import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { InboxItem } from '../hooks/useInboxData'

import { groupItems } from './grouping'

// テスト用のモックアイテム
const createMockItem = (overrides: Partial<InboxItem> = {}): InboxItem => ({
  id: 'test-id',
  type: 'plan',
  title: 'テストプラン',
  status: 'todo',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  ...overrides,
})

describe('grouping', () => {
  describe('groupItems', () => {
    describe('グループ化なし（null）', () => {
      it('nullの場合はすべてのアイテムを1グループにまとめる', () => {
        const items = [
          createMockItem({ id: '1', status: 'todo' }),
          createMockItem({ id: '2', status: 'doing' }),
          createMockItem({ id: '3', status: 'done' }),
        ]

        const result = groupItems(items, null)

        expect(result).toHaveLength(1)
        expect(result[0]?.groupKey).toBe('all')
        expect(result[0]?.groupLabel).toBe('すべて')
        expect(result[0]?.count).toBe(3)
        expect(result[0]?.items).toHaveLength(3)
      })

      it('空配列の場合も正しく処理される', () => {
        const result = groupItems([], null)

        expect(result).toHaveLength(1)
        expect(result[0]?.count).toBe(0)
        expect(result[0]?.items).toHaveLength(0)
      })
    })

    describe('ステータスでグループ化', () => {
      it('ステータスごとにグループ分けされる', () => {
        const items = [
          createMockItem({ id: '1', status: 'todo' }),
          createMockItem({ id: '2', status: 'doing' }),
          createMockItem({ id: '3', status: 'todo' }),
          createMockItem({ id: '4', status: 'done' }),
        ]

        const result = groupItems(items, 'status')

        // doing, todo, done の順序
        expect(result).toHaveLength(3)
        expect(result[0]?.groupKey).toBe('doing')
        expect(result[1]?.groupKey).toBe('todo')
        expect(result[2]?.groupKey).toBe('done')
      })

      it('ステータスラベルが正しく設定される', () => {
        const items = [
          createMockItem({ id: '1', status: 'todo' }),
          createMockItem({ id: '2', status: 'doing' }),
          createMockItem({ id: '3', status: 'done' }),
        ]

        const result = groupItems(items, 'status')

        const todoGroup = result.find((g) => g.groupKey === 'todo')
        const doingGroup = result.find((g) => g.groupKey === 'doing')
        const doneGroup = result.find((g) => g.groupKey === 'done')

        expect(todoGroup?.groupLabel).toBe('Todo')
        expect(doingGroup?.groupLabel).toBe('Doing')
        expect(doneGroup?.groupLabel).toBe('Done')
      })

      it('アイテム数が正しくカウントされる', () => {
        const items = [
          createMockItem({ id: '1', status: 'todo' }),
          createMockItem({ id: '2', status: 'todo' }),
          createMockItem({ id: '3', status: 'doing' }),
        ]

        const result = groupItems(items, 'status')

        const todoGroup = result.find((g) => g.groupKey === 'todo')
        const doingGroup = result.find((g) => g.groupKey === 'doing')

        expect(todoGroup?.count).toBe(2)
        expect(doingGroup?.count).toBe(1)
      })
    })

    describe('タグでグループ化', () => {
      it('最初のタグでグループ分けされる', () => {
        const items = [
          createMockItem({
            id: '1',
            tags: [{ id: 'tag-1', name: '仕事' }],
          }),
          createMockItem({
            id: '2',
            tags: [{ id: 'tag-2', name: 'プライベート' }],
          }),
          createMockItem({
            id: '3',
            tags: [{ id: 'tag-1', name: '仕事' }],
          }),
        ]

        const result = groupItems(items, 'tags')

        expect(result).toHaveLength(2)
        expect(result.some((g) => g.groupKey === '仕事')).toBe(true)
        expect(result.some((g) => g.groupKey === 'プライベート')).toBe(true)
      })

      it('タグがない場合は「タグなし」グループに分類される', () => {
        const items = [createMockItem({ id: '1', tags: undefined }), createMockItem({ id: '2', tags: [] })]

        const result = groupItems(items, 'tags')

        expect(result).toHaveLength(1)
        expect(result[0]?.groupKey).toBe('タグなし')
      })
    })

    describe('期限でグループ化', () => {
      beforeEach(() => {
        vi.useFakeTimers()
        // 2025年1月15日（水曜日）に固定
        vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('期限なしは「no-due-date」グループになる', () => {
        const items = [createMockItem({ id: '1', due_date: null }), createMockItem({ id: '2', due_date: undefined })]

        const result = groupItems(items, 'due_date')

        expect(result).toHaveLength(1)
        expect(result[0]?.groupKey).toBe('no-due-date')
        expect(result[0]?.groupLabel).toBe('期限なし')
      })

      it('今日の期限は「today」グループになる', () => {
        const items = [createMockItem({ id: '1', due_date: '2025-01-15' })]

        const result = groupItems(items, 'due_date')

        expect(result[0]?.groupKey).toBe('today')
        expect(result[0]?.groupLabel).toBe('今日')
      })

      it('明日の期限は「tomorrow」グループになる', () => {
        const items = [createMockItem({ id: '1', due_date: '2025-01-16' })]

        const result = groupItems(items, 'due_date')

        expect(result[0]?.groupKey).toBe('tomorrow')
        expect(result[0]?.groupLabel).toBe('明日')
      })

      it('過去の期限は「overdue」グループになる', () => {
        const items = [createMockItem({ id: '1', due_date: '2025-01-14' })]

        const result = groupItems(items, 'due_date')

        expect(result[0]?.groupKey).toBe('overdue')
        expect(result[0]?.groupLabel).toBe('期限超過')
      })

      it('今週の期限は「this-week」グループになる', () => {
        const items = [createMockItem({ id: '1', due_date: '2025-01-18' })] // 3日後

        const result = groupItems(items, 'due_date')

        expect(result[0]?.groupKey).toBe('this-week')
        expect(result[0]?.groupLabel).toBe('今週')
      })

      it('来週以降の期限は「later」グループになる', () => {
        const items = [createMockItem({ id: '1', due_date: '2025-02-01' })]

        const result = groupItems(items, 'due_date')

        expect(result[0]?.groupKey).toBe('later')
        expect(result[0]?.groupLabel).toBe('今週以降')
      })

      it('期限グループは正しい順序でソートされる', () => {
        const items = [
          createMockItem({ id: '1', due_date: '2025-02-01' }), // later
          createMockItem({ id: '2', due_date: '2025-01-15' }), // today
          createMockItem({ id: '3', due_date: '2025-01-14' }), // overdue
          createMockItem({ id: '4', due_date: null }), // no-due-date
          createMockItem({ id: '5', due_date: '2025-01-16' }), // tomorrow
          createMockItem({ id: '6', due_date: '2025-01-18' }), // this-week
        ]

        const result = groupItems(items, 'due_date')

        const order = result.map((g) => g.groupKey)
        expect(order).toEqual(['overdue', 'today', 'tomorrow', 'this-week', 'later', 'no-due-date'])
      })
    })

    describe('グループ結果の構造', () => {
      it('各グループにgroupKey, groupLabel, items, countが含まれる', () => {
        const items = [createMockItem({ id: '1', status: 'todo' })]

        const result = groupItems(items, 'status')

        expect(result[0]).toHaveProperty('groupKey')
        expect(result[0]).toHaveProperty('groupLabel')
        expect(result[0]).toHaveProperty('items')
        expect(result[0]).toHaveProperty('count')
      })

      it('itemsの中身が元のアイテムと一致する', () => {
        const originalItem = createMockItem({ id: 'unique-id', title: 'ユニークなタイトル' })
        const items = [originalItem]

        const result = groupItems(items, 'status')

        expect(result[0]?.items[0]).toEqual(originalItem)
      })
    })
  })
})
