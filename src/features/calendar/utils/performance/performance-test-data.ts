import type { CalendarEvent } from '@/features/events'

// パフォーマンステスト用のモックデータ生成
export function generateTestEvents(count: number, dateRange: Date[] = []): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const baseDate = dateRange.length > 0 ? dateRange[0] : new Date()
  
  // テストカテゴリ
  const categories = [
    { name: 'ミーティング', color: '#3B82F6', icon: '👥' },
    { name: '作業', color: '#8B5CF6', icon: '💻' },
    { name: '休憩', color: '#10B981', icon: '☕' },
    { name: '外出', color: '#F59E0B', icon: '🚗' },
    { name: '学習', color: '#EF4444', icon: '📚' },
    { name: '運動', color: '#F97316', icon: '💪' },
    { name: '食事', color: '#84CC16', icon: '🍽️' },
    { name: '電話', color: '#06B6D4', icon: '📞' }
  ]

  const priorities = ['urgent', 'important', 'necessary', 'delegate', 'optional'] as const
  const statuses = ['inbox', 'planned', 'in_progress', 'completed', 'cancelled'] as const

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length]
    const dayOffset = Math.floor(i / 20) // 20個ずつ異なる日に配置
    const eventDate = new Date(baseDate)
    
    if (dateRange.length > 0) {
      // 指定された日付範囲内でランダムに配置
      const randomDateIndex = Math.floor(Math.random() * dateRange.length)
      eventDate.setTime(dateRange[randomDateIndex].getTime())
    } else {
      eventDate.setDate(baseDate.getDate() + dayOffset)
    }

    // ランダムな開始時刻（6:00-22:00）
    const startHour = 6 + Math.floor(Math.random() * 16)
    const startMinute = Math.floor(Math.random() * 4) * 15 // 15分刻み
    
    // ランダムな継続時間（15分-4時間）
    const durations = [15, 30, 45, 60, 90, 120, 180, 240]
    const duration = durations[Math.floor(Math.random() * durations.length)]
    
    const startDate = new Date(eventDate)
    startDate.setHours(startHour, startMinute, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + duration)

    // 重複を意図的に作成（パフォーマンステスト用）
    if (i % 5 === 0 && i > 0) {
      // 前のイベントと同じ時間帯に配置
      const prevEvent = events[i - 1]
      startDate.setTime(prevEvent.startDate.getTime())
      endDate.setTime(prevEvent.endDate?.getTime() || startDate.getTime() + 60 * 60 * 1000)
    }

    const event: CalendarEvent = {
      id: `test-event-${i}`,
      title: `${category.name} ${i + 1}`,
      description: `テストイベント ${i + 1} の詳細説明。パフォーマンステスト用のモックデータです。`,
      startDate,
      endDate,
      displayStartDate: startDate,
      displayEndDate: endDate,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      color: category.color,
      location: i % 3 === 0 ? `会議室${(i % 5) + 1}` : undefined,
      url: i % 10 === 0 ? `https://example.com/event/${i}` : undefined,
      tags: [{
        id: `tag-${category.name}`,
        name: category.name,
        color: category.color,
        icon: category.icon
      }],
      duration,
      isMultiDay: duration > 240, // 4時間以上はマルチデイとして扱う
      isRecurring: i % 15 === 0, // 15個に1つは繰り返し
      createdAt: new Date(),
      updatedAt: new Date()
    }

    events.push(event)
  }

  return events
}

// 特定のパターンでイベントを生成（重なりテスト用）
export function generateOverlappingEvents(baseDate: Date, overlappingCount: number): CalendarEvent[] {
  const events: CalendarEvent[] = []
  
  // 基準時刻（10:00）
  const baseTime = new Date(baseDate)
  baseTime.setHours(10, 0, 0, 0)

  for (let i = 0; i < overlappingCount; i++) {
    const startDate = new Date(baseTime)
    // 各イベントを5分ずつずらして重複を作成
    startDate.setMinutes(startDate.getMinutes() + i * 5)
    
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 2) // 2時間のイベント

    const event: CalendarEvent = {
      id: `overlap-event-${i}`,
      title: `重複イベント ${i + 1}`,
      description: '重なりテスト用',
      startDate,
      endDate,
      displayStartDate: startDate,
      displayEndDate: endDate,
      status: 'planned',
      priority: 'necessary',
      color: `hsl(${(i * 137) % 360}, 70%, 60%)`, // 色相を分散
      duration: 120,
      isMultiDay: false,
      isRecurring: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    events.push(event)
  }

  return events
}

// メモリリークテスト用のイベント生成
export function generateMemoryTestEvents(count: number): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const baseDate = new Date()

  for (let i = 0; i < count; i++) {
    const startDate = new Date(baseDate)
    startDate.setHours(9 + (i % 8), (i % 4) * 15, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 1)

    // 意図的に大きなデータを含む
    const largeDescription = 'A'.repeat(1000) // 1KB のテキスト
    
    const event: CalendarEvent = {
      id: `memory-test-${i}`,
      title: `メモリテスト ${i}`,
      description: largeDescription,
      startDate,
      endDate,
      displayStartDate: startDate,
      displayEndDate: endDate,
      status: 'planned',
      priority: 'necessary',
      color: '#3B82F6',
      duration: 60,
      isMultiDay: false,
      isRecurring: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // 大きなタグ配列
      tags: Array.from({ length: 20 }, (_, j) => ({
        id: `tag-${i}-${j}`,
        name: `タグ${j}`,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        icon: '🏷️'
      }))
    }

    events.push(event)
  }

  return events
}

// パフォーマンス測定ユーティリティ
export class PerformanceBenchmark {
  private startTime: number = 0
  private endTime: number = 0
  private memoryStart: number = 0
  private memoryEnd: number = 0

  start() {
    this.startTime = performance.now()
    if (performance.memory) {
      this.memoryStart = performance.memory.usedJSHeapSize
    }
  }

  end() {
    this.endTime = performance.now()
    if (performance.memory) {
      this.memoryEnd = performance.memory.usedJSHeapSize
    }
  }

  getResults() {
    const renderTime = this.endTime - this.startTime
    const memoryDelta = this.memoryEnd - this.memoryStart

    return {
      renderTime: Math.round(renderTime * 100) / 100,
      memoryDelta: Math.round(memoryDelta / 1024), // KB単位
      fps: renderTime > 0 ? Math.round(1000 / renderTime) : 0
    }
  }

  logResults(eventCount: number) {
    const results = this.getResults()
    
    console.group(`🚀 パフォーマンス測定結果 (${eventCount}イベント)`)
    console.log(`レンダリング時間: ${results.renderTime}ms`)
    console.log(`メモリ使用量変化: ${results.memoryDelta}KB`)
    console.log(`推定FPS: ${results.fps}`)
    
    // 目標との比較
    if (eventCount <= 100 && results.renderTime > 50) {
      console.warn('⚠️ 100イベントで50ms以下の目標未達成')
    } else if (eventCount <= 1000 && results.renderTime > 1000) {
      console.warn('⚠️ 1000イベントで1秒以下の目標未達成')
    } else {
      console.log('✅ パフォーマンス目標達成!')
    }
    
    console.groupEnd()

    return results
  }
}

// 使用例とテストケース
export const performanceTestCases = [
  {
    name: '軽量テスト',
    eventCount: 50,
    description: '基本的なパフォーマンステスト',
    generate: () => generateTestEvents(50)
  },
  {
    name: '中程度テスト',
    eventCount: 200,
    description: '実用的なイベント数でのテスト',
    generate: () => generateTestEvents(200)
  },
  {
    name: '重量テスト',
    eventCount: 1000,
    description: '大量イベントでのパフォーマンステスト',
    generate: () => generateTestEvents(1000)
  },
  {
    name: '重複テスト',
    eventCount: 20,
    description: '重複イベントのレイアウトテスト',
    generate: () => generateOverlappingEvents(new Date(), 20)
  },
  {
    name: 'メモリテスト',
    eventCount: 500,
    description: 'メモリリークテスト',
    generate: () => generateMemoryTestEvents(500)
  }
]