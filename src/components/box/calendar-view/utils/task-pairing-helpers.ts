import { CalendarTask } from './time-grid-helpers'
import { isSameDay, differenceInMinutes, addMinutes } from 'date-fns'

export interface TaskPair {
  id: string
  planTask?: CalendarTask
  recordTask?: CalendarTask
  startTime: Date
  endTime: Date
  hasOverlap: boolean
}

/**
 * 計画と実績のタスクをペアリングする
 * 同じ時間帯や関連するタスクを組み合わせて表示用のペアを作成
 */
export function pairPlanAndRecordTasks(
  planTasks: CalendarTask[],
  recordTasks: CalendarTask[],
  date: Date
): TaskPair[] {
  const pairs: TaskPair[] = []
  const usedRecordTasks = new Set<string>()
  const usedPlanTasks = new Set<string>()

  // 同じ日のタスクのみを対象とする
  const dayPlanTasks = planTasks.filter(task => isSameDay(task.startTime, date))
  const dayRecordTasks = recordTasks.filter(task => isSameDay(task.startTime, date))

  // Step 1: 同じタスクIDまたはタイトルでマッチング
  for (const planTask of dayPlanTasks) {
    const matchingRecord = dayRecordTasks.find(recordTask => 
      !usedRecordTasks.has(recordTask.id) && (
        recordTask.title === planTask.title ||
        (recordTask.id.includes('plan') && recordTask.id.includes(planTask.id)) ||
        (planTask.id.includes('record') && planTask.id.includes(recordTask.id))
      )
    )

    if (matchingRecord) {
      usedPlanTasks.add(planTask.id)
      usedRecordTasks.add(matchingRecord.id)
      
      // 開始・終了時間の範囲を計算
      const startTime = new Date(Math.min(planTask.startTime.getTime(), matchingRecord.startTime.getTime()))
      const endTime = new Date(Math.max(planTask.endTime.getTime(), matchingRecord.endTime.getTime()))
      
      pairs.push({
        id: `pair-${planTask.id}-${matchingRecord.id}`,
        planTask,
        recordTask: matchingRecord,
        startTime,
        endTime,
        hasOverlap: doTimeRangesOverlap(planTask.startTime, planTask.endTime, matchingRecord.startTime, matchingRecord.endTime)
      })
    }
  }

  // Step 2: 時間帯が重複するタスクでマッチング
  for (const planTask of dayPlanTasks) {
    if (usedPlanTasks.has(planTask.id)) continue

    const overlappingRecord = dayRecordTasks.find(recordTask => 
      !usedRecordTasks.has(recordTask.id) && 
      doTimeRangesOverlap(planTask.startTime, planTask.endTime, recordTask.startTime, recordTask.endTime)
    )

    if (overlappingRecord) {
      usedPlanTasks.add(planTask.id)
      usedRecordTasks.add(overlappingRecord.id)
      
      const startTime = new Date(Math.min(planTask.startTime.getTime(), overlappingRecord.startTime.getTime()))
      const endTime = new Date(Math.max(planTask.endTime.getTime(), overlappingRecord.endTime.getTime()))
      
      pairs.push({
        id: `pair-${planTask.id}-${overlappingRecord.id}`,
        planTask,
        recordTask: overlappingRecord,
        startTime,
        endTime,
        hasOverlap: true
      })
    }
  }

  // Step 3: 残った計画タスクを単独で追加
  for (const planTask of dayPlanTasks) {
    if (!usedPlanTasks.has(planTask.id)) {
      pairs.push({
        id: `plan-only-${planTask.id}`,
        planTask,
        startTime: planTask.startTime,
        endTime: planTask.endTime,
        hasOverlap: false
      })
    }
  }

  // Step 4: 残った実績タスクを単独で追加
  for (const recordTask of dayRecordTasks) {
    if (!usedRecordTasks.has(recordTask.id)) {
      pairs.push({
        id: `record-only-${recordTask.id}`,
        recordTask,
        startTime: recordTask.startTime,
        endTime: recordTask.endTime,
        hasOverlap: false
      })
    }
  }

  // 時間順でソート
  return pairs.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}

/**
 * 2つの時間範囲が重複するかチェック
 */
function doTimeRangesOverlap(
  start1: Date, 
  end1: Date, 
  start2: Date, 
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1
}

/**
 * 近接する時間のタスクをマッチング（30分以内）
 */
export function findNearbyTasks(
  planTasks: CalendarTask[],
  recordTasks: CalendarTask[],
  toleranceMinutes: number = 30
): TaskPair[] {
  const pairs: TaskPair[] = []
  const usedRecordTasks = new Set<string>()
  const usedPlanTasks = new Set<string>()

  for (const planTask of planTasks) {
    const nearbyRecord = recordTasks.find(recordTask => {
      if (usedRecordTasks.has(recordTask.id)) return false
      
      const timeDifference = Math.abs(differenceInMinutes(planTask.startTime, recordTask.startTime))
      return timeDifference <= toleranceMinutes
    })

    if (nearbyRecord) {
      usedPlanTasks.add(planTask.id)
      usedRecordTasks.add(nearbyRecord.id)
      
      const startTime = new Date(Math.min(planTask.startTime.getTime(), nearbyRecord.startTime.getTime()))
      const endTime = new Date(Math.max(planTask.endTime.getTime(), nearbyRecord.endTime.getTime()))
      
      pairs.push({
        id: `nearby-${planTask.id}-${nearbyRecord.id}`,
        planTask,
        recordTask: nearbyRecord,
        startTime,
        endTime,
        hasOverlap: doTimeRangesOverlap(planTask.startTime, planTask.endTime, nearbyRecord.startTime, nearbyRecord.endTime)
      })
    }
  }

  return pairs
}

/**
 * タスクペアの重複を解決し、レイアウト用の配置情報を計算
 */
export function calculateTaskPairLayout(pairs: TaskPair[]): Array<TaskPair & { 
  left: number
  width: number
  conflicts: number
  totalConflicts: number
}> {
  // 時間順でソート
  const sortedPairs = [...pairs].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  
  // 重複グループを見つける
  const groups: TaskPair[][] = []
  
  for (const pair of sortedPairs) {
    let addedToGroup = false
    
    for (const group of groups) {
      // このペアが既存のグループの何かと重複するかチェック
      const hasConflict = group.some(existingPair => 
        doTimeRangesOverlap(pair.startTime, pair.endTime, existingPair.startTime, existingPair.endTime)
      )
      
      if (hasConflict) {
        group.push(pair)
        addedToGroup = true
        break
      }
    }
    
    if (!addedToGroup) {
      groups.push([pair])
    }
  }
  
  // 各グループ内でレイアウトを計算
  const result: Array<TaskPair & { 
    left: number
    width: number
    conflicts: number
    totalConflicts: number
  }> = []
  
  for (const group of groups) {
    const totalInGroup = group.length
    const widthPercentage = 100 / totalInGroup
    
    group.forEach((pair, index) => {
      result.push({
        ...pair,
        left: index * widthPercentage,
        width: widthPercentage - 1, // 1%のマージン
        conflicts: index,
        totalConflicts: totalInGroup
      })
    })
  }
  
  return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}