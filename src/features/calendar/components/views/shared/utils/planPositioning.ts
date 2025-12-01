/**
 * プラン配置計算ユーティリティ
 */

import { MAX_EVENT_COLUMNS } from '../constants/grid.constants'
import type { PlanColumn, TimedPlan } from '../types/plan.types'

// 後方互換性のためのエイリアス
type TimedEvent = TimedPlan

/**
 * プランが時間的に重複しているか判定
 */
export function plansOverlap(plan1: TimedPlan, plan2: TimedPlan): boolean {
  // plan1がplan2より前に終わる、またはplan2がplan1より前に終わる場合は重複しない
  return !(plan1.end <= plan2.start || plan2.end <= plan1.start)
}

// 後方互換性のためのエイリアス
/** @deprecated Use plansOverlap instead */
export function eventsOverlap(event1: TimedEvent, event2: TimedEvent): boolean {
  return plansOverlap(event1, event2)
}

/**
 * プラングループを検出（重複するプランをグループ化）
 */
export function detectOverlapGroups(plans: TimedPlan[]): TimedPlan[][] {
  if (plans.length === 0) return []

  // 開始時刻でソート
  const sortedPlans = [...plans].sort((a, b) => a.start.getTime() - b.start.getTime())
  const groups: TimedPlan[][] = []

  for (const plan of sortedPlans) {
    // 既存のグループで重複するものを探す
    let added = false

    for (const group of groups) {
      // グループ内のいずれかのプランと重複する場合、そのグループに追加
      if (group.some((p) => plansOverlap(p, plan))) {
        group.push(plan)
        added = true
        break
      }
    }

    // どのグループとも重複しない場合、新しいグループを作成
    if (!added) {
      groups.push([plan])
    }
  }

  return groups
}

/**
 * 重複するプランの列配置を計算
 */
export function calculateViewPlanColumns(plans: TimedPlan[]): Map<string, PlanColumn> {
  const columnMap = new Map<string, PlanColumn>()

  if (plans.length === 0) return columnMap

  // 重複グループを検出
  const groups = detectOverlapGroups(plans)

  for (const group of groups) {
    if (group.length === 1) {
      // 重複なしの場合
      columnMap.set(group[0]!.id, {
        plans: group,
        columnIndex: 0,
        totalColumns: 1,
      })
    } else {
      // 重複ありの場合、列を割り当て
      const columns = assignColumns(group)
      columns.forEach((col, plan) => {
        columnMap.set(plan.id, col)
      })
    }
  }

  return columnMap
}

// 後方互換性のためのエイリアス
/** @deprecated Use calculateViewPlanColumns instead */
export function calculateViewEventColumns(events: TimedEvent[]): Map<string, PlanColumn> {
  return calculateViewPlanColumns(events)
}

/**
 * 重複プランに列を割り当て
 */
function assignColumns(plans: TimedPlan[]): Map<TimedPlan, PlanColumn> {
  const result = new Map<TimedPlan, PlanColumn>()

  // 開始時刻でソート
  const sortedPlans = [...plans].sort((a, b) => a.start.getTime() - b.start.getTime())

  // 各プランに列を割り当て
  const columns: TimedPlan[][] = []

  for (const plan of sortedPlans) {
    // 利用可能な最初の列を探す
    let placed = false

    for (let i = 0; i < Math.min(columns.length, MAX_EVENT_COLUMNS); i++) {
      const column = columns[i]
      if (!column || column.length === 0) continue

      const lastInColumn = column[column.length - 1]
      if (!lastInColumn) continue

      // この列の最後のプランと重複しない場合、この列に配置
      if (!plansOverlap(lastInColumn, plan)) {
        column.push(plan)
        placed = true
        break
      }
    }

    // どの列にも配置できない場合、新しい列を作成（最大数まで）
    if (!placed && columns.length < MAX_EVENT_COLUMNS) {
      columns.push([plan])
    } else if (!placed) {
      // 最大列数を超える場合、最も早く終わるプランの列に配置
      let earliestEndCol = 0
      const firstColumn = columns[0]
      if (!firstColumn || firstColumn.length === 0) {
        columns.push([plan])
      } else {
        const firstLastPlan = firstColumn[firstColumn.length - 1]
        let earliestEnd = firstLastPlan ? firstLastPlan.end : new Date()

        for (let i = 1; i < columns.length; i++) {
          const column = columns[i]
          if (!column || column.length === 0) continue

          const lastPlan = column[column.length - 1]
          if (lastPlan && lastPlan.end < earliestEnd) {
            earliestEnd = lastPlan.end
            earliestEndCol = i
          }
        }

        const targetColumn = columns[earliestEndCol]
        if (targetColumn) {
          targetColumn.push(plan)
        }
      }
    }
  }

  // 結果をマップに変換
  const totalColumns = columns.length

  columns.forEach((column, columnIndex) => {
    column.forEach((plan) => {
      result.set(plan, {
        plans: sortedPlans,
        columnIndex,
        totalColumns,
      })
    })
  })

  return result
}

/**
 * プランの表示位置を計算
 */
export function calculatePlanPosition(
  plan: TimedPlan,
  column: PlanColumn,
  hourHeight: number = 60
): { top: number; height: number; left: number; width: number } {
  // 時刻から位置を計算
  const startMinutes = plan.start.getHours() * 60 + plan.start.getMinutes()
  const endMinutes = plan.end.getHours() * 60 + plan.end.getMinutes()

  const top = (startMinutes * hourHeight) / 60
  const height = Math.max(((endMinutes - startMinutes) * hourHeight) / 60, 20) // 最小高さ20px

  // 列配置から横位置を計算（幅は100%、マージンで間隔調整）
  const width = 100 / column.totalColumns
  const left = width * column.columnIndex

  return { top, height, left, width }
}

// 後方互換性のためのエイリアス
/** @deprecated Use calculatePlanPosition instead */
export function calculateEventPosition(
  event: TimedEvent,
  column: PlanColumn,
  hourHeight: number = 60
): { top: number; height: number; left: number; width: number } {
  return calculatePlanPosition(event, column, hourHeight)
}

/**
 * 時間指定プランをソート（開始時刻順）
 */
export function sortTimedPlans(plans: TimedPlan[]): TimedPlan[] {
  return [...plans].sort((a, b) => {
    const timeDiff = a.start.getTime() - b.start.getTime()
    if (timeDiff !== 0) return timeDiff

    // 開始時刻が同じ場合は終了時刻で比較
    return a.end.getTime() - b.end.getTime()
  })
}

// 後方互換性のためのエイリアス
/** @deprecated Use sortTimedPlans instead */
export function sortTimedEvents(events: TimedEvent[]): TimedEvent[] {
  return sortTimedPlans(events)
}

/**
 * 特定の日のプランをフィルタリング
 */
export function filterPlansByDate(plans: TimedPlan[], date: Date): TimedPlan[] {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  return plans.filter((plan) => {
    // 時間指定プランは時間範囲で比較
    return plan.start < dayEnd && plan.end > dayStart
  })
}

// 後方互換性のためのエイリアス
/** @deprecated Use filterPlansByDate instead */
export function filterEventsByDate(events: TimedPlan[], date: Date): TimedPlan[] {
  return filterPlansByDate(events, date)
}
