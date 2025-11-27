import { describe, expect, it } from 'vitest'

import type { CalendarPlan as Plan } from '@/features/calendar/types/calendar.types'

import {
  eventToTimedEvent,
  eventsToTimedEvents,
  safeEventToTimedEvent,
  safeEventsToTimedEvents,
  timedEventToEventUpdate,
} from './planDataAdapter'

describe('planDataAdapter', () => {
  describe('eventToTimedEvent', () => {
    it('PlanStore形式をTimedPlan形式に変換する', () => {
      const event: Plan = {
        id: 'plan-1',
        title: 'ミーティング',
        description: '週次ミーティング',
        color: '#3b82f6',
        startDate: new Date('2024-06-15T10:00:00'),
        endDate: new Date('2024-06-15T11:00:00'),
        status: 'planned',
        displayStartDate: new Date('2024-06-15T10:00:00'),
        displayEndDate: new Date('2024-06-15T11:00:00'),
        duration: 60,
        isMultiDay: false,
        isRecurring: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = eventToTimedEvent(event)

      expect(result.id).toBe('plan-1')
      expect(result.title).toBe('ミーティング')
      expect(result.description).toBe('週次ミーティング')
      expect(result.color).toBe('#3b82f6')
      expect(result.start).toEqual(event.startDate)
      expect(result.end).toEqual(event.endDate)
      expect(result.isReadOnly).toBe(false)
    })

    it('完了済みプランは読み取り専用になる', () => {
      const event: Plan = {
        id: 'plan-1',
        title: 'ミーティング',
        startDate: new Date(),
        endDate: new Date(),
        status: 'completed',
        color: '#3b82f6',
        displayStartDate: new Date(),
        displayEndDate: new Date(),
        duration: 60,
        isMultiDay: false,
        isRecurring: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = eventToTimedEvent(event)

      expect(result.isReadOnly).toBe(true)
    })

    it('キャンセル済みイベントは読み取り専用になる', () => {
      const event: Plan = {
        id: 'plan-1',
        title: 'ミーティング',
        startDate: new Date(),
        endDate: new Date(),
        status: 'cancelled',
        color: '#3b82f6',
        displayStartDate: new Date(),
        displayEndDate: new Date(),
        duration: 60,
        isMultiDay: false,
        isRecurring: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = eventToTimedEvent(event)

      expect(result.isReadOnly).toBe(true)
    })

    it('startDateがnullの場合は現在日時を使用する', () => {
      const event: Plan = {
        id: 'plan-1',
        title: 'ミーティング',
        startDate: null,
        endDate: null,
        status: 'planned',
        color: '#3b82f6',
        displayStartDate: new Date(),
        displayEndDate: new Date(),
        duration: 60,
        isMultiDay: false,
        isRecurring: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = eventToTimedEvent(event)

      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
    })
  })

  describe('eventsToTimedEvents', () => {
    it('複数のイベントを変換する', () => {
      const events: Plan[] = [
        {
          id: 'plan-1',
          title: 'ミーティング1',
          startDate: new Date(),
          endDate: new Date(),
          status: 'planned',
          color: '#3b82f6',
          displayStartDate: new Date(),
          displayEndDate: new Date(),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'plan-2',
          title: 'ミーティング2',
          startDate: new Date(),
          endDate: new Date(),
          status: 'planned',
          color: '#3b82f6',
          displayStartDate: new Date(),
          displayEndDate: new Date(),
          duration: 60,
          isMultiDay: false,
          isRecurring: false,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const result = eventsToTimedEvents(events)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('plan-1')
      expect(result[1].id).toBe('plan-2')
    })

    it.skip('削除済みイベントは除外される（廃止予定の機能）', () => {
      // Note: isDeletedフィルタリングは現在の実装にはありません
      // 削除済みプランはデータベースクエリレベルでフィルタリングされます
    })
  })

  describe('timedEventToEventUpdate', () => {
    it('TimedEvent形式をEventUpdate形式に変換する', () => {
      const timedEvent = {
        id: 'plan-1',
        title: 'ミーティング',
        description: '週次ミーティング',
        color: '#3b82f6',
        start: new Date('2024-06-15T10:00:00'),
        end: new Date('2024-06-15T11:00:00'),
        isReadOnly: false,
      }

      const result = timedEventToEventUpdate(timedEvent as unknown as Parameters<typeof timedEventToEventUpdate>[0])

      expect(result.id).toBe('plan-1')
      expect(result.title).toBe('ミーティング')
      expect(result.description).toBe('週次ミーティング')
      expect(result.color).toBe('#3b82f6')
      expect(result.startDate).toEqual(timedEvent.start)
      expect(result.endDate).toEqual(timedEvent.end)
    })
  })

  describe('safeEventToTimedEvent', () => {
    it('有効なイベントを変換する', () => {
      const event: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
        description: '週次ミーティング',
        color: '#3b82f6',
        startDate: new Date('2024-06-15T10:00:00'),
        endDate: new Date('2024-06-15T11:00:00'),
      }

      const result = safeEventToTimedEvent(event)

      expect(result).not.toBeNull()
      expect(result?.id).toBe('plan-1')
      expect(result?.title).toBe('ミーティング')
    })

    it('idがない場合はnullを返す', () => {
      const event: Partial<Plan> = {
        title: 'ミーティング',
      }

      const result = safeEventToTimedEvent(event)

      expect(result).toBeNull()
    })

    it('titleがない場合はnullを返す', () => {
      const event: Partial<Plan> = {
        id: 'plan-1',
      }

      const result = safeEventToTimedEvent(event)

      expect(result).toBeNull()
    })

    it('descriptionがない場合は空文字をデフォルト値にする', () => {
      const event: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
      }

      const result = safeEventToTimedEvent(event)

      expect(result?.description).toBe('')
    })

    it('colorがない場合は青色をデフォルト値にする', () => {
      const event: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
      }

      const result = safeEventToTimedEvent(event)

      expect(result?.color).toBe('#3b82f6')
    })

    it('startDateがない場合は現在時刻を使用する', () => {
      const event: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
      }

      const result = safeEventToTimedEvent(event)

      expect(result?.start).toBeInstanceOf(Date)
    })

    it('endDateがない場合は開始時刻+1時間を使用する', () => {
      const event: Partial<Plan> = {
        id: 'plan-1',
        title: 'ミーティング',
      }

      const result = safeEventToTimedEvent(event)

      expect(result?.end).toBeInstanceOf(Date)
      if (result) {
        const diff = result.end.getTime() - result.start.getTime()
        expect(diff).toBe(60 * 60 * 1000) // 1時間
      }
    })
  })

  describe('safeEventsToTimedEvents', () => {
    it('有効なイベントのみ変換する', () => {
      const events: Partial<Plan>[] = [
        { id: 'plan-1', title: 'ミーティング1' },
        { id: 'plan-2' }, // titleなし
        { title: 'ミーティング3' }, // idなし
        { id: 'plan-4', title: 'ミーティング4' },
      ]

      const result = safeEventsToTimedEvents(events)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('plan-1')
      expect(result[1].id).toBe('plan-4')
    })

    it('空配列の場合は空配列を返す', () => {
      const result = safeEventsToTimedEvents([])

      expect(result).toEqual([])
    })

    it('すべて無効なイベントの場合は空配列を返す', () => {
      const events: Partial<Plan>[] = [
        { id: 'plan-1' }, // titleなし
        { title: 'ミーティング' }, // idなし
      ]

      const result = safeEventsToTimedEvents(events)

      expect(result).toEqual([])
    })
  })
})
