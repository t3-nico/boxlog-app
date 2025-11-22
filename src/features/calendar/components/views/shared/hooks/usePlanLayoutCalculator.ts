// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
import { useMemo } from 'react'

import { useCalendarToast } from '@/features/calendar/hooks/use-calendar-toast'

import type { CalendarEvent } from '../types/plan.types'

// レイアウト情報の型定義
export interface EventLayout {
  event: CalendarEvent
  column: number // 左から何番目のカラム（0始まり）
  totalColumns: number // その時間帯の総カラム数
  width: number // 幅のパーセンテージ（例: 50, 33.33）
  left: number // 左位置のパーセンテージ（例: 0, 50）
}

// 重複グループの型定義
interface OverlapGroup {
  events: CalendarEvent[]
  startTime: Date
  endTime: Date
}

/**
 * イベントの重複レイアウト計算フック
 * Googleカレンダー風の横並び配置を実現
 */
export function useEventLayoutCalculator(
  events: CalendarEvent[],
  options?: { notifyConflicts?: boolean }
): EventLayout[] {
  const { conflictWarning } = useCalendarToast()
  return useMemo(() => {
    if (events.length === 0) return []

    // Step 1: イベントを開始時間でソート
    const sortedEvents = [...events].sort((a, b) => {
      const aStart = new Date(a.start)
      const bStart = new Date(b.start)
      return aStart.getTime() - bStart.getTime()
    })

    // Step 2: 重複グループを検出
    const overlapGroups = findOverlapGroups(sortedEvents)

    // Step 3: 各グループ内でレイアウトを計算
    const layouts: EventLayout[] = []

    overlapGroups.forEach((group) => {
      const groupLayouts = calculateGroupLayout(group.events)

      // 重複が発生している場合（2つ以上のイベント）にToast通知
      if (options?.notifyConflicts && group.events.length > 1) {
        // 最新のイベントが追加された場合のみ通知（レイアウト変更での重複検知）
        const hasRecentEvent = group.events.some((event) => {
          const eventTime = new Date(event.start)
          const now = new Date()
          return now.getTime() - eventTime.getTime() < 5000 // 5秒以内に作成されたイベント
        })

        if (hasRecentEvent) {
          conflictWarning(group.events.length)
        }
      }

      console.log('🔧 重複レイアウト計算:', {
        グループサイズ: group.events.length,
        イベントタイトル: group.events.map((e) => e.title),
        レイアウト結果: groupLayouts.map((l) => ({
          title: l.event.title,
          column: l.column,
          totalColumns: l.totalColumns,
          width: l.width,
          left: l.left,
        })),
        重複通知: options?.notifyConflicts && group.events.length > 1,
      })
      layouts.push(...groupLayouts)
    })

    return layouts
  }, [events, conflictWarning, options?.notifyConflicts])
}

/**
 * 重複するイベントグループを検出
 */
function findOverlapGroups(events: CalendarEvent[]): OverlapGroup[] {
  const groups: OverlapGroup[] = []
  let currentGroup: CalendarEvent[] = []
  let groupEndTime: Date | null = null

  events.forEach((event) => {
    // start, end を使用
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // 新しいグループを開始するか判定
    if (!groupEndTime || eventStart >= groupEndTime) {
      if (currentGroup.length > 0) {
        groups.push({
          events: currentGroup,
          startTime: new Date(currentGroup[0].start),
          endTime: groupEndTime,
        })
      }
      currentGroup = [event]
      groupEndTime = eventEnd
    } else {
      // 既存グループに追加
      currentGroup.push(event)
      // グループの終了時間を更新
      if (eventEnd > groupEndTime) {
        groupEndTime = eventEnd
      }
    }
  })

  // 最後のグループを追加
  if (currentGroup.length > 0 && groupEndTime) {
    groups.push({
      events: currentGroup,
      startTime: new Date(currentGroup[0].start),
      endTime: groupEndTime,
    })
  }

  return groups
}

/**
 * グループ内のレイアウトを計算（Googleカレンダー準拠）
 */
function calculateGroupLayout(events: CalendarEvent[]): EventLayout[] {
  const layouts: EventLayout[] = []

  // 各イベントの「競合リスト」を作成
  const conflicts = new Map<string, Set<string>>()

  events.forEach((event1) => {
    const conflictSet = new Set<string>()
    events.forEach((event2) => {
      if (event1.id !== event2.id && isOverlapping(event1, event2)) {
        conflictSet.add(event2.id)
      }
    })
    conflicts.set(event1.id, conflictSet)
  })

  // 最大同時重複数を計算
  const maxConcurrent = calculateMaxConcurrent(events)

  // 各イベントにカラムを割り当て
  const assignments = new Map<string, number>()

  events.forEach((event) => {
    const usedColumns = new Set<number>()

    // このイベントと競合するイベントが使用しているカラムを収集
    conflicts.get(event.id)?.forEach((conflictId) => {
      if (assignments.has(conflictId)) {
        usedColumns.add(assignments.get(conflictId)!)
      }
    })

    // 最小の利用可能なカラムを見つける
    let column = 0
    while (usedColumns.has(column)) {
      column++
    }

    assignments.set(event.id, column)
  })

  // レイアウト情報を生成
  events.forEach((event) => {
    const column = assignments.get(event.id)!
    const width = 100 / maxConcurrent
    const left = width * column

    layouts.push({
      event,
      column,
      totalColumns: maxConcurrent,
      width,
      left,
    })
  })

  return layouts
}

/**
 * 2つのイベントが重複しているかを判定
 */
function isOverlapping(event1: CalendarEvent, event2: CalendarEvent): boolean {
  // start, end を使用
  const start1 = new Date(event1.start)
  const end1 = new Date(event1.end)
  const start2 = new Date(event2.start)
  const end2 = new Date(event2.end)

  const isOverlap = start1 < end2 && start2 < end1

  return isOverlap
}

/**
 * 最大同時重複数を計算
 */
function calculateMaxConcurrent(events: CalendarEvent[]): number {
  const timePoints: { time: Date; type: 'start' | 'end'; eventId: string }[] = []

  events.forEach((event) => {
    // start, end を使用
    const start = new Date(event.start)
    const end = new Date(event.end)

    timePoints.push({ time: start, type: 'start', eventId: event.id })
    timePoints.push({ time: end, type: 'end', eventId: event.id })
  })

  timePoints.sort((a, b) => {
    const timeDiff = a.time.getTime() - b.time.getTime()
    if (timeDiff !== 0) return timeDiff
    // 同じ時刻の場合、endを先に処理
    return a.type === 'end' ? -1 : 1
  })

  let current = 0
  let max = 0

  timePoints.forEach((point, index) => {
    if (point.type === 'start') {
      current++
      max = Math.max(max, current)
      console.log(`${index}: START (${point.eventId}) - current=${current}, max=${max}`)
    } else {
      current--
      console.log(`${index}: END (${point.eventId}) - current=${current}, max=${max}`)
    }
  })

  console.log('🎯 最大同時重複数:', max)
  return max
}
