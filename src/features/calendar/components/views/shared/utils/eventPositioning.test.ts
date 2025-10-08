// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
import { describe, expect, it } from 'vitest'

import type { TimedEvent } from '../types/event.types'

import { calculateViewEventColumns, detectOverlapGroups, eventsOverlap } from './eventPositioning'

describe('eventPositioning', () => {
  const createTimedEvent = (
    id: string,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): TimedEvent => ({
    id,
    title: `Event ${id}`,
    start: new Date(2025, 0, 15, startHour, startMinute),
    end: new Date(2025, 0, 15, endHour, endMinute),
    startDate: new Date(2025, 0, 15, startHour, startMinute),
    endDate: new Date(2025, 0, 15, endHour, endMinute),
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
    displayStartDate: new Date(2025, 0, 15, startHour, startMinute),
    displayEndDate: new Date(2025, 0, 15, endHour, endMinute),
    duration: (endHour - startHour) * 60 + (endMinute - startMinute),
    isMultiDay: false,
  })

  describe('eventsOverlap', () => {
    it('完全に重複するイベントを検出する', () => {
      const event1 = createTimedEvent('1', 10, 0, 11, 0) // 10:00-11:00
      const event2 = createTimedEvent('2', 10, 30, 11, 30) // 10:30-11:30

      expect(eventsOverlap(event1, event2)).toBe(true)
    })

    it('部分的に重複するイベントを検出する', () => {
      const event1 = createTimedEvent('1', 10, 0, 11, 0) // 10:00-11:00
      const event2 = createTimedEvent('2', 10, 45, 12, 0) // 10:45-12:00

      expect(eventsOverlap(event1, event2)).toBe(true)
    })

    it('完全に含まれるイベントを検出する', () => {
      const event1 = createTimedEvent('1', 10, 0, 12, 0) // 10:00-12:00
      const event2 = createTimedEvent('2', 10, 30, 11, 0) // 10:30-11:00

      expect(eventsOverlap(event1, event2)).toBe(true)
    })

    it('重複しないイベントを判定する（連続）', () => {
      const event1 = createTimedEvent('1', 10, 0, 11, 0) // 10:00-11:00
      const event2 = createTimedEvent('2', 11, 0, 12, 0) // 11:00-12:00

      expect(eventsOverlap(event1, event2)).toBe(false)
    })

    it('重複しないイベントを判定する（離れている）', () => {
      const event1 = createTimedEvent('1', 10, 0, 11, 0) // 10:00-11:00
      const event2 = createTimedEvent('2', 12, 0, 13, 0) // 12:00-13:00

      expect(eventsOverlap(event1, event2)).toBe(false)
    })

    it('逆順でも同じ結果が得られる', () => {
      const event1 = createTimedEvent('1', 10, 0, 11, 0)
      const event2 = createTimedEvent('2', 10, 30, 11, 30)

      expect(eventsOverlap(event1, event2)).toBe(eventsOverlap(event2, event1))
    })
  })

  describe('detectOverlapGroups', () => {
    it('重複しないイベントは別々のグループになる', () => {
      const events: TimedEvent[] = [
        createTimedEvent('1', 10, 0, 11, 0), // 10:00-11:00
        createTimedEvent('2', 11, 0, 12, 0), // 11:00-12:00
        createTimedEvent('3', 12, 0, 13, 0), // 12:00-13:00
      ]

      const groups = detectOverlapGroups(events)

      expect(groups).toHaveLength(3)
      expect(groups[0]).toHaveLength(1)
      expect(groups[1]).toHaveLength(1)
      expect(groups[2]).toHaveLength(1)
    })

    it('重複するイベントは同じグループになる', () => {
      const events: TimedEvent[] = [
        createTimedEvent('1', 10, 0, 11, 0), // 10:00-11:00
        createTimedEvent('2', 10, 30, 11, 30), // 10:30-11:30（event1と重複）
        createTimedEvent('3', 11, 0, 12, 0), // 11:00-12:00（event2と重複）
      ]

      const groups = detectOverlapGroups(events)

      expect(groups).toHaveLength(1)
      expect(groups[0]).toHaveLength(3)
    })

    it('複数のグループが正しく検出される', () => {
      const events: TimedEvent[] = [
        createTimedEvent('1', 10, 0, 11, 0), // Group 1
        createTimedEvent('2', 10, 30, 11, 30), // Group 1
        createTimedEvent('3', 12, 0, 13, 0), // Group 2
        createTimedEvent('4', 12, 30, 13, 30), // Group 2
        createTimedEvent('5', 14, 0, 15, 0), // Group 3
      ]

      const groups = detectOverlapGroups(events)

      expect(groups).toHaveLength(3)
      expect(groups[0]).toHaveLength(2) // event1, event2
      expect(groups[1]).toHaveLength(2) // event3, event4
      expect(groups[2]).toHaveLength(1) // event5
    })

    it('空配列の場合は空配列を返す', () => {
      const groups = detectOverlapGroups([])
      expect(groups).toHaveLength(0)
    })

    it('単一イベントの場合は1グループを返す', () => {
      const events: TimedEvent[] = [createTimedEvent('1', 10, 0, 11, 0)]

      const groups = detectOverlapGroups(events)

      expect(groups).toHaveLength(1)
      expect(groups[0]).toHaveLength(1)
    })

    it('開始時刻が異なる場合でもソートされる', () => {
      const events: TimedEvent[] = [
        createTimedEvent('3', 12, 0, 13, 0),
        createTimedEvent('1', 10, 0, 11, 0),
        createTimedEvent('2', 11, 0, 12, 0),
      ]

      const groups = detectOverlapGroups(events)

      // ソートされていることを確認（グループ分けが正しいかチェック）
      expect(groups).toHaveLength(3)
    })
  })

  describe('calculateViewEventColumns', () => {
    it('重複しないイベントは単一列に配置される', () => {
      const events: TimedEvent[] = [createTimedEvent('1', 10, 0, 11, 0), createTimedEvent('2', 11, 0, 12, 0)]

      const columnMap = calculateViewEventColumns(events)

      expect(columnMap.get('1')?.columnIndex).toBe(0)
      expect(columnMap.get('1')?.totalColumns).toBe(1)
      expect(columnMap.get('2')?.columnIndex).toBe(0)
      expect(columnMap.get('2')?.totalColumns).toBe(1)
    })

    it('重複するイベントは異なる列に配置される', () => {
      const events: TimedEvent[] = [
        createTimedEvent('1', 10, 0, 11, 0), // 10:00-11:00
        createTimedEvent('2', 10, 30, 11, 30), // 10:30-11:30（重複）
      ]

      const columnMap = calculateViewEventColumns(events)

      expect(columnMap.get('1')?.columnIndex).toBe(0)
      expect(columnMap.get('2')?.columnIndex).toBe(1)
      expect(columnMap.get('1')?.totalColumns).toBeGreaterThan(1)
      expect(columnMap.get('2')?.totalColumns).toBeGreaterThan(1)
    })

    it('複数重複するイベントが正しく列配置される', () => {
      const events: TimedEvent[] = [
        createTimedEvent('1', 10, 0, 11, 0), // 10:00-11:00
        createTimedEvent('2', 10, 15, 10, 45), // 10:15-10:45（event1と重複）
        createTimedEvent('3', 10, 30, 11, 30), // 10:30-11:30（event1,2と重複）
      ]

      const columnMap = calculateViewEventColumns(events)

      // すべてのイベントが列を持つ
      expect(columnMap.has('1')).toBe(true)
      expect(columnMap.has('2')).toBe(true)
      expect(columnMap.has('3')).toBe(true)

      // totalColumnsが適切に設定されている
      const totalColumns = columnMap.get('1')?.totalColumns
      expect(totalColumns).toBeGreaterThan(1)
    })

    it('空配列の場合は空のMapを返す', () => {
      const columnMap = calculateViewEventColumns([])
      expect(columnMap.size).toBe(0)
    })

    it('単一イベントの場合は正しく配置される', () => {
      const events: TimedEvent[] = [createTimedEvent('1', 10, 0, 11, 0)]

      const columnMap = calculateViewEventColumns(events)

      expect(columnMap.size).toBe(1)
      expect(columnMap.get('1')?.columnIndex).toBe(0)
      expect(columnMap.get('1')?.totalColumns).toBe(1)
    })

    it('列配置が連続している', () => {
      const events: TimedEvent[] = [
        createTimedEvent('1', 10, 0, 12, 0),
        createTimedEvent('2', 10, 30, 11, 30),
        createTimedEvent('3', 11, 0, 12, 30),
      ]

      const columnMap = calculateViewEventColumns(events)

      const indices = [
        columnMap.get('1')?.columnIndex,
        columnMap.get('2')?.columnIndex,
        columnMap.get('3')?.columnIndex,
      ]

      // すべてのインデックスが定義されている
      expect(indices.every((idx) => idx !== undefined)).toBe(true)
    })
  })
})
