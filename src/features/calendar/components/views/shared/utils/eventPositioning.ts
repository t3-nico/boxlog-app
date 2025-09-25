/**
 * イベント配置計算ユーティリティ
 */

import { MAX_EVENT_COLUMNS } from '../constants/grid.constants'
import type { CalendarEvent, TimedEvent, EventColumn } from '../types/event.types'

/**
 * イベントが時間的に重複しているか判定
 */
export function eventsOverlap(event1: TimedEvent, event2: TimedEvent): boolean {
  // event1がevent2より前に終わる、またはevent2がevent1より前に終わる場合は重複しない
  return !(event1.end <= event2.start || event2.end <= event1.start)
}

/**
 * イベントグループを検出（重複するイベントをグループ化）
 */
export function detectOverlapGroups(events: TimedEvent[]): TimedEvent[][] {
  if (events.length === 0) return []
  
  // 開始時刻でソート
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
  const groups: TimedEvent[][] = []
  
  for (const event of sortedEvents) {
    // 既存のグループで重複するものを探す
    let added = false
    
    for (const group of groups) {
      // グループ内のいずれかのイベントと重複する場合、そのグループに追加
      if (group.some(e => eventsOverlap(e, event))) {
        group.push(event)
        added = true
        break
      }
    }
    
    // どのグループとも重複しない場合、新しいグループを作成
    if (!added) {
      groups.push([event])
    }
  }
  
  return groups
}

/**
 * 重複するイベントの列配置を計算
 */
export function calculateViewEventColumns(events: TimedEvent[]): Map<string, EventColumn> {
  const columnMap = new Map<string, EventColumn>()
  
  if (events.length === 0) return columnMap
  
  // 重複グループを検出
  const groups = detectOverlapGroups(events)
  
  for (const group of groups) {
    if (group.length === 1) {
      // 重複なしの場合
      columnMap.set(group[0].id, {
        events: group,
        columnIndex: 0,
        totalColumns: 1
      })
    } else {
      // 重複ありの場合、列を割り当て
      const columns = assignColumns(group)
      columns.forEach((col, event) => {
        columnMap.set(event.id, col)
      })
    }
  }
  
  return columnMap
}

/**
 * 重複イベントに列を割り当て
 */
function assignColumns(events: TimedEvent[]): Map<TimedEvent, EventColumn> {
  const result = new Map<TimedEvent, EventColumn>()
  
  // 開始時刻でソート
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
  
  // 各イベントに列を割り当て
  const columns: TimedEvent[][] = []
  
  for (const event of sortedEvents) {
    // 利用可能な最初の列を探す
    let placed = false
    
    for (let i = 0; i < Math.min(columns.length, MAX_EVENT_COLUMNS); i++) {
      const column = columns[i]
      if (!column || column.length === 0) continue

      const lastInColumn = column[column.length - 1]
      if (!lastInColumn) continue

      // この列の最後のイベントと重複しない場合、この列に配置
      if (!eventsOverlap(lastInColumn, event)) {
        column.push(event)
        placed = true
        break
      }
    }
    
    // どの列にも配置できない場合、新しい列を作成（最大数まで）
    if (!placed && columns.length < MAX_EVENT_COLUMNS) {
      columns.push([event])
    } else if (!placed) {
      // 最大列数を超える場合、最も早く終わるイベントの列に配置
      let earliestEndCol = 0
      const firstColumn = columns[0]
      if (!firstColumn || firstColumn.length === 0) {
        columns.push([event])
      } else {
        const firstLastEvent = firstColumn[firstColumn.length - 1]
        let earliestEnd = firstLastEvent ? firstLastEvent.end : new Date()

        for (let i = 1; i < columns.length; i++) {
          const column = columns[i]
          if (!column || column.length === 0) continue

          const lastEvent = column[column.length - 1]
          if (lastEvent && lastEvent.end < earliestEnd) {
            earliestEnd = lastEvent.end
            earliestEndCol = i
          }
        }

        const targetColumn = columns[earliestEndCol]
        if (targetColumn) {
          targetColumn.push(event)
        }
      }
    }
  }
  
  // 結果をマップに変換
  const totalColumns = columns.length
  
  columns.forEach((column, columnIndex) => {
    column.forEach(event => {
      result.set(event, {
        events: sortedEvents,
        columnIndex,
        totalColumns
      })
    })
  })
  
  return result
}

/**
 * イベントの表示位置を計算
 */
export function calculateEventPosition(
  event: TimedEvent,
  column: EventColumn,
  hourHeight: number = 60
): { top: number; height: number; left: number; width: number } {
  // 時刻から位置を計算
  const startMinutes = event.start.getHours() * 60 + event.start.getMinutes()
  const endMinutes = event.end.getHours() * 60 + event.end.getMinutes()
  
  const top = (startMinutes * hourHeight) / 60
  const height = Math.max(((endMinutes - startMinutes) * hourHeight) / 60, 20) // 最小高さ20px
  
  // 列配置から横位置を計算（幅は100%、マージンで間隔調整）
  const width = 100 / column.totalColumns
  const left = width * column.columnIndex
  
  return { top, height, left, width }
}


/**
 * 時間指定イベントをソート（開始時刻順）
 */
export function sortTimedEvents(events: TimedEvent[]): TimedEvent[] {
  return [...events].sort((a, b) => {
    const timeDiff = a.start.getTime() - b.start.getTime()
    if (timeDiff !== 0) return timeDiff
    
    // 開始時刻が同じ場合は終了時刻で比較
    return a.end.getTime() - b.end.getTime()
  })
}

/**
 * 特定の日のイベントをフィルタリング
 */
export function filterEventsByDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)
  
  return events.filter(event => {
    // 時間指定イベントは時間範囲で比較
    return event.start < dayEnd && event.end > dayStart
  })
}