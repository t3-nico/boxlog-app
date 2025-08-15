import { describe, it, expect } from 'vitest'
import {
  detectOverlappingEvents,
  calculateEventColumns,
  applyEventLayout,
  applyResponsiveEventLayout,
  type EventGroup,
  type ColumnAssignment,
  type LayoutedEvent
} from './event-layout'
import type { CalendarEvent } from '../types/calendar.types'

// テスト用のイベント作成ヘルパー
function createTestEvent(
  id: string,
  title: string,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  date: Date = new Date('2024-01-15')
): CalendarEvent {
  const startDate = new Date(date)
  startDate.setHours(startHour, startMinute, 0, 0)
  
  const endDate = new Date(date)
  endDate.setHours(endHour, endMinute, 0, 0)
  
  return {
    id,
    title,
    startDate,
    endDate,
    displayStartDate: startDate,
    displayEndDate: endDate,
    status: 'planned',
    color: '#3B82F6',
    duration: (endDate.getTime() - startDate.getTime()) / (1000 * 60),
    isMultiDay: false,
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

describe('detectOverlappingEvents', () => {
  it('空の配列を処理できる', () => {
    const result = detectOverlappingEvents([])
    expect(result).toEqual([])
  })

  it('重ならない2つのイベントを別グループに分ける', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 11, 0, 12, 0)
    ]
    
    const groups = detectOverlappingEvents(events)
    expect(groups).toHaveLength(2)
    expect(groups[0].events).toHaveLength(1)
    expect(groups[1].events).toHaveLength(1)
  })

  it('完全に重なる2つのイベントを同じグループに入れる', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 9, 0, 10, 0)
    ]
    
    const groups = detectOverlappingEvents(events)
    expect(groups).toHaveLength(1)
    expect(groups[0].events).toHaveLength(2)
  })

  it('部分的に重なる3つのイベントを同じグループに入れる', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 30),
      createTestEvent('2', 'Event 2', 10, 0, 11, 30),
      createTestEvent('3', 'Event 3', 11, 0, 12, 0)
    ]
    
    const groups = detectOverlappingEvents(events)
    expect(groups).toHaveLength(1)
    expect(groups[0].events).toHaveLength(3)
  })

  it('チェーン状に重なるイベントを正しくグループ化', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 9, 30, 10, 30),
      createTestEvent('3', 'Event 3', 10, 0, 11, 0),
      createTestEvent('4', 'Event 4', 12, 0, 13, 0) // 離れている
    ]
    
    const groups = detectOverlappingEvents(events)
    expect(groups).toHaveLength(2)
    expect(groups[0].events).toHaveLength(3)
    expect(groups[1].events).toHaveLength(1)
  })

  it('異なる日のイベントを別グループに分ける', () => {
    const date1 = new Date('2024-01-15')
    const date2 = new Date('2024-01-16')
    
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0, date1),
      createTestEvent('2', 'Event 2', 9, 0, 10, 0, date2)
    ]
    
    const groups = detectOverlappingEvents(events)
    expect(groups).toHaveLength(2)
  })
})

describe('calculateEventColumns', () => {
  it('単一イベントは列0に配置', () => {
    const event = createTestEvent('1', 'Event 1', 9, 0, 10, 0)
    const group: EventGroup = {
      id: 'group-1',
      events: [event],
      startTime: event.startDate,
      endTime: event.endDate!,
      maxColumns: 0
    }
    
    const assignments = calculateEventColumns(group)
    expect(assignments).toHaveLength(1)
    expect(assignments[0].column).toBe(0)
    expect(assignments[0].totalColumns).toBe(1)
    expect(assignments[0].width).toBeGreaterThan(90)
  })

  it('完全に重なる2つのイベントを異なる列に配置', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 9, 0, 10, 0)
    ]
    
    const group: EventGroup = {
      id: 'group-1',
      events,
      startTime: events[0].startDate,
      endTime: events[0].endDate!,
      maxColumns: 0
    }
    
    const assignments = calculateEventColumns(group)
    expect(assignments).toHaveLength(2)
    
    const assign1 = assignments.find(a => a.eventId === '1')!
    const assign2 = assignments.find(a => a.eventId === '2')!
    
    expect(assign1.column).toBe(0)
    expect(assign2.column).toBe(1)
    expect(assign1.totalColumns).toBe(2)
    expect(assign2.totalColumns).toBe(2)
  })

  it('3つの重なるイベントは2列に制限される', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 30),
      createTestEvent('2', 'Event 2', 9, 30, 11, 0),
      createTestEvent('3', 'Event 3', 10, 0, 11, 30)
    ]
    
    const group: EventGroup = {
      id: 'group-1',
      events,
      startTime: events[0].startDate,
      endTime: events[2].endDate!,
      maxColumns: 0
    }
    
    const assignments = calculateEventColumns(group)
    expect(assignments).toHaveLength(3)
    
    // 最大2列までしか使用されない
    const maxColumn = Math.max(...assignments.map(a => a.column))
    expect(maxColumn).toBeLessThanOrEqual(1)
    expect(assignments[0].totalColumns).toBeLessThanOrEqual(2)
  })

  it('列の再利用: 連続するが重ならないイベント', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 9, 30, 10, 30),
      createTestEvent('3', 'Event 3', 10, 0, 11, 0), // Event 1の後なので列0を再利用可能
      createTestEvent('4', 'Event 4', 10, 30, 11, 30) // Event 2の後なので列1を再利用可能
    ]
    
    const group: EventGroup = {
      id: 'group-1',
      events,
      startTime: events[0].startDate,
      endTime: events[3].endDate!,
      maxColumns: 0
    }
    
    const assignments = calculateEventColumns(group)
    
    const assign1 = assignments.find(a => a.eventId === '1')!
    const assign2 = assignments.find(a => a.eventId === '2')!
    const assign3 = assignments.find(a => a.eventId === '3')!
    const assign4 = assignments.find(a => a.eventId === '4')!
    
    expect(assign1.column).toBe(0)
    expect(assign2.column).toBe(1)
    expect(assign3.column).toBe(0) // 列0を再利用
    expect(assign4.column).toBe(1) // 列1を再利用
  })

  it('10個のイベントが重なっても2列に制限される', () => {
    const events = Array.from({ length: 10 }, (_, i) => 
      createTestEvent(`${i + 1}`, `Event ${i + 1}`, 9, i * 5, 10, 30 + i * 5)
    )
    
    const group: EventGroup = {
      id: 'group-1',
      events,
      startTime: events[0].startDate,
      endTime: events[9].endDate!,
      maxColumns: 0
    }
    
    const assignments = calculateEventColumns(group)
    expect(assignments).toHaveLength(10)
    
    // すべてのイベントに列が割り当てられている（最大2列）
    assignments.forEach(assignment => {
      expect(assignment.column).toBeGreaterThanOrEqual(0)
      expect(assignment.column).toBeLessThanOrEqual(1) // 最大2列
      expect(assignment.totalColumns).toBeLessThanOrEqual(2)
      expect(assignment.width).toBeGreaterThan(0)
      expect(assignment.left).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('applyEventLayout', () => {
  it('レイアウト情報を正しく適用', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 11, 0, 12, 0)
    ]
    
    const layouted = applyEventLayout(events, 0, 24, 60)
    
    expect(layouted).toHaveLength(2)
    expect(layouted[0].layout).toBeDefined()
    expect(layouted[1].layout).toBeDefined()
    
    // 位置計算の確認
    expect(layouted[0].layout.top).toBe(9 * 60) // 9時は540分後
    expect(layouted[0].layout.height).toBe(60) // 1時間 = 60px
    expect(layouted[1].layout.top).toBe(11 * 60) // 11時は660分後
  })

  it('重なるイベントの幅を適切に設定（2列制限）', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 9, 0, 10, 0),
      createTestEvent('3', 'Event 3', 9, 0, 10, 0)
    ]
    
    const layouted = applyEventLayout(events)
    
    // 最大2列に制限される
    const maxColumns = Math.max(...layouted.map(e => e.layout.totalColumns))
    expect(maxColumns).toBeLessThanOrEqual(2)
    
    // 各イベントが適切な幅を確保
    layouted.forEach(event => {
      expect(event.layout.width).toBeGreaterThan(30) // 2列の場合の最小幅
      expect(event.layout.width).toBeLessThanOrEqual(100)
    })
  })

  it('zIndexが正しく設定される', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 9, 0, 10, 0)
    ]
    
    const layouted = applyEventLayout(events)
    
    // 後の列ほどzIndexが大きい
    const event1 = layouted.find(e => e.id === '1')!
    const event2 = layouted.find(e => e.id === '2')!
    
    if (event1.layout.column < event2.layout.column) {
      expect(event1.layout.zIndex).toBeLessThan(event2.layout.zIndex)
    }
  })

  it('カスタム時間範囲での位置計算', () => {
    const events = [
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 15, 0, 16, 0)
    ]
    
    const layouted = applyEventLayout(events, 8, 18, 50) // 8時〜18時、1時間50px
    
    // 9時のイベントは1時間後（8時開始から）
    expect(layouted[0].layout.top).toBe(50) // 1時間 * 50px
    
    // 15時のイベントは7時間後
    expect(layouted[1].layout.top).toBe(350) // 7時間 * 50px
  })
})

describe('applyResponsiveEventLayout', () => {
  it('狭い画面幅でも2列制限', () => {
    const events = Array.from({ length: 5 }, (_, i) => 
      createTestEvent(`${i + 1}`, `Event ${i + 1}`, 9, 0, 10, 0)
    )
    
    // 350px幅 -> 最大2列（元々の制限）
    const layouted = applyResponsiveEventLayout(events, 350)
    
    const maxColumns = Math.max(...layouted.map(e => e.layout.totalColumns))
    expect(maxColumns).toBeLessThanOrEqual(2)
  })

  it('中程度の画面幅でも2列制限', () => {
    const events = Array.from({ length: 5 }, (_, i) => 
      createTestEvent(`${i + 1}`, `Event ${i + 1}`, 9, 0, 10, 0)
    )
    
    // 500px幅 -> 最大2列（元々の制限）
    const layouted = applyResponsiveEventLayout(events, 500)
    
    const maxColumns = Math.max(...layouted.map(e => e.layout.totalColumns))
    expect(maxColumns).toBeLessThanOrEqual(2)
  })

  it('広い画面幅でも2列制限', () => {
    const events = Array.from({ length: 6 }, (_, i) => 
      createTestEvent(`${i + 1}`, `Event ${i + 1}`, 9, 0, 10, 0)
    )
    
    // 1000px幅 -> 最大2列（元々の制限）
    const layouted = applyResponsiveEventLayout(events, 1000)
    
    // 2列制限があるので最大2列
    const maxColumns = Math.max(...layouted.map(e => e.layout.totalColumns))
    expect(maxColumns).toBeLessThanOrEqual(2)
  })

  it('レスポンシブ調整後も適切な幅を確保', () => {
    const events = Array.from({ length: 10 }, (_, i) => 
      createTestEvent(`${i + 1}`, `Event ${i + 1}`, 9, 0, 10, 0)
    )
    
    // 非常に狭い画面
    const layouted = applyResponsiveEventLayout(events, 300)
    
    layouted.forEach(event => {
      expect(event.layout.width).toBeGreaterThan(30) // 2列制限での最小幅
      expect(event.layout.totalColumns).toBeLessThanOrEqual(2)
    })
  })
})

describe('エッジケース', () => {
  it('非常に短いイベント（5分）でも最小高さを確保', () => {
    const events = [
      createTestEvent('1', 'Short Event', 9, 0, 9, 5) // 5分のイベント
    ]
    
    const layouted = applyEventLayout(events)
    expect(layouted[0].layout.height).toBeGreaterThanOrEqual(20) // 最小高さ
  })

  it('1日を超えるイベントでも処理できる', () => {
    const startDate = new Date('2024-01-15')
    startDate.setHours(22, 0, 0, 0)
    
    const endDate = new Date('2024-01-15')
    endDate.setHours(25, 0, 0, 0) // 翌日の1時として扱われる
    
    const event: CalendarEvent = {
      id: '1',
      title: 'Long Event',
      startDate,
      endDate,
      displayStartDate: startDate,
      displayEndDate: endDate,
      status: 'planned',
      color: '#3B82F6',
      duration: 180,
      isMultiDay: false,
      isRecurring: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const layouted = applyEventLayout([event])
    expect(layouted).toHaveLength(1)
    expect(layouted[0].layout).toBeDefined()
  })

  it('同時刻に15個のイベントがあっても2列に制限される', () => {
    const events = Array.from({ length: 15 }, (_, i) => 
      createTestEvent(`${i + 1}`, `Event ${i + 1}`, 10, 0, 11, 0)
    )
    
    const layouted = applyEventLayout(events)
    
    expect(layouted).toHaveLength(15)
    
    // すべてのイベントが2列に制限される
    layouted.forEach(event => {
      expect(event.layout.width).toBeGreaterThan(0)
      expect(event.layout.left).toBeGreaterThanOrEqual(0)
      expect(event.layout.column).toBeLessThanOrEqual(1) // 最大2列（0,1）
      expect(event.layout.totalColumns).toBeLessThanOrEqual(2)
      // 2列制限での適切な幅
      expect(event.layout.width).toBeGreaterThan(30)
    })
  })

  it('イベントの順序が保持される', () => {
    const events = [
      createTestEvent('3', 'Event 3', 11, 0, 12, 0),
      createTestEvent('1', 'Event 1', 9, 0, 10, 0),
      createTestEvent('2', 'Event 2', 10, 0, 11, 0)
    ]
    
    const layouted = applyEventLayout(events)
    
    // 元の配列の順序が保持される
    expect(layouted[0].id).toBe('3')
    expect(layouted[1].id).toBe('1')
    expect(layouted[2].id).toBe('2')
  })
})