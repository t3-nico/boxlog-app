import { describe, expect, it } from 'vitest'

import type { CalendarEvent } from '@/features/events/types/events'

import {
  detectFridayToMondayEvents,
  filterWeekendEvents,
  splitCrossWeekEvents,
} from './crossWeekEventHelpers'

describe('crossWeekEventHelpers', () => {
  describe('splitCrossWeekEvents', () => {
    it('単日イベントはそのまま返す', () => {
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
      ]

      const weekStart = new Date('2024-06-10')
      const segments = splitCrossWeekEvents(events, true, weekStart)

      expect(segments).toHaveLength(1)
      expect(segments[0].segmentType).toBe('full')
      expect(segments[0].isPartialSegment).toBe(false)
    })

    it('複数日イベントを分割する', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: '長期イベント',
          startDate: new Date('2024-06-15T10:00:00'),
          endDate: new Date('2024-06-17T18:00:00'),
          duration: 60,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const weekStart = new Date('2024-06-10')
      const segments = splitCrossWeekEvents(events, true, weekStart)

      expect(segments.length).toBeGreaterThan(1)
      expect(segments[0].segmentType).toBe('start')
      expect(segments[segments.length - 1].segmentType).toBe('end')
    })

    it('週末表示OFF時は土日をスキップする', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: '金曜から月曜',
          startDate: new Date('2024-06-14T10:00:00'), // 金曜
          endDate: new Date('2024-06-17T18:00:00'), // 月曜
          duration: 60,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const weekStart = new Date('2024-06-10')
      const segments = splitCrossWeekEvents(events, false, weekStart) // showWeekends: false

      // 土日がスキップされるため、金曜と月曜のみ
      const segmentDays = segments.map((s) => s.segmentStart.getDay())
      expect(segmentDays).not.toContain(0) // 日曜
      expect(segmentDays).not.toContain(6) // 土曜
    })

    it('startDate/endDateがnullの場合はフルイベントとして扱う', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント',
          startDate: null,
          endDate: null,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const weekStart = new Date('2024-06-10')
      const segments = splitCrossWeekEvents(events, true, weekStart)

      expect(segments).toHaveLength(1)
      expect(segments[0].segmentType).toBe('full')
    })
  })

  describe('filterWeekendEvents', () => {
    it('週末（土日）のイベントのみ返す', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: '金曜イベント',
          startDate: new Date('2024-06-14T10:00:00'), // 金曜
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: '土曜イベント',
          startDate: new Date('2024-06-15T10:00:00'), // 土曜（2024-06-15は土曜日）
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-3',
          title: '日曜イベント',
          startDate: new Date('2024-06-16T10:00:00'), // 日曜
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const dateRange = {
        start: new Date('2024-06-10'),
        end: new Date('2024-06-17'),
      }

      const weekendEvents = filterWeekendEvents(events, dateRange)

      // 2024-06-15は土曜、2024-06-16は日曜
      expect(weekendEvents.length).toBeGreaterThanOrEqual(1)
      const weekendIds = weekendEvents.map((e) => e.id)
      expect(weekendIds).toContain('event-2')
    })

    it('startDateがnullの場合は除外する', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント',
          startDate: null,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const dateRange = {
        start: new Date('2024-06-10'),
        end: new Date('2024-06-16'),
      }

      const weekendEvents = filterWeekendEvents(events, dateRange)

      expect(weekendEvents).toHaveLength(0)
    })
  })

  describe('detectFridayToMondayEvents', () => {
    it('金曜から月曜にまたがるイベントを検出する', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: '金→月イベント',
          startDate: new Date('2024-06-14T10:00:00'), // 金曜（day=5）
          endDate: new Date('2024-06-17T18:00:00'), // 月曜（day=1）
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          title: '土→日イベント',
          startDate: new Date('2024-06-15T10:00:00'), // 土曜（day=6）
          endDate: new Date('2024-06-16T18:00:00'), // 日曜（day=0）
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const fridayToMonday = detectFridayToMondayEvents(events)

      expect(fridayToMonday).toHaveLength(1)
      expect(fridayToMonday[0].id).toBe('event-1')
    })

    it('startDate/endDateがnullの場合は除外する', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          title: 'イベント',
          startDate: null,
          endDate: null,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const fridayToMonday = detectFridayToMondayEvents(events)

      expect(fridayToMonday).toHaveLength(0)
    })
  })
})
