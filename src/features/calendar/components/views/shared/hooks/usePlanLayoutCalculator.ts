import { useMemo } from 'react'

import { useCalendarToast } from '@/features/calendar/hooks/use-calendar-toast'

import type { TimedPlan } from '../types/plan.types'

// レイアウト情報の型定義
export interface PlanLayout {
  plan: TimedPlan
  column: number // 左から何番目のカラム（0始まり）
  totalColumns: number // その時間帯の総カラム数
  width: number // 幅のパーセンテージ（例: 50, 33.33）
  left: number // 左位置のパーセンテージ（例: 0, 50）
}

// 重複グループの型定義
interface OverlapGroup {
  plans: TimedPlan[]
  startTime: Date
  endTime: Date
}

/**
 * プランの重複レイアウト計算フック
 * Googleカレンダー風の横並び配置を実現
 */
export function usePlanLayoutCalculator(plans: TimedPlan[], options?: { notifyConflicts?: boolean }): PlanLayout[] {
  const { eventConflict } = useCalendarToast()
  return useMemo(() => {
    if (plans.length === 0) return []

    // Step 1: プランを開始時間でソート
    const sortedPlans = [...plans].sort((a, b) => {
      const aStart = new Date(a.start)
      const bStart = new Date(b.start)
      return aStart.getTime() - bStart.getTime()
    })

    // Step 2: 重複グループを検出
    const overlapGroups = findOverlapGroups(sortedPlans)

    // Step 3: 各グループ内でレイアウトを計算
    const layouts: PlanLayout[] = []

    overlapGroups.forEach((group) => {
      const groupLayouts = calculateGroupLayout(group.plans)

      // 重複が発生している場合（2つ以上のプラン）にToast通知
      if (options?.notifyConflicts && group.plans.length > 1) {
        // 最新のプランが追加された場合のみ通知（レイアウト変更での重複検知）
        const hasRecentPlan = group.plans.some((plan) => {
          const planTime = new Date(plan.start)
          const now = new Date()
          return now.getTime() - planTime.getTime() < 5000 // 5秒以内に作成されたプラン
        })

        if (hasRecentPlan) {
          eventConflict()
        }
      }

      console.log('🔧 重複レイアウト計算:', {
        グループサイズ: group.plans.length,
        プランタイトル: group.plans.map((e) => e.title),
        レイアウト結果: groupLayouts.map((l) => ({
          title: l.plan.title,
          column: l.column,
          totalColumns: l.totalColumns,
          width: l.width,
          left: l.left,
        })),
        重複通知: options?.notifyConflicts && group.plans.length > 1,
      })
      layouts.push(...groupLayouts)
    })

    return layouts
  }, [plans, eventConflict, options?.notifyConflicts])
}

/**
 * 重複するプラングループを検出
 */
function findOverlapGroups(plans: TimedPlan[]): OverlapGroup[] {
  const groups: OverlapGroup[] = []
  let currentGroup: TimedPlan[] = []
  let groupEndTime: Date | null = null

  plans.forEach((plan) => {
    // start, end を使用
    const planStart = new Date(plan.start)
    const planEnd = new Date(plan.end)

    // 新しいグループを開始するか判定
    if (!groupEndTime || planStart >= groupEndTime) {
      if (currentGroup.length > 0) {
        groups.push({
          plans: currentGroup,
          startTime: new Date(currentGroup[0]!.start),
          endTime: groupEndTime!,
        })
      }
      currentGroup = [plan]
      groupEndTime = planEnd
    } else {
      // 既存グループに追加
      currentGroup.push(plan)
      // グループの終了時間を更新
      if (planEnd > groupEndTime) {
        groupEndTime = planEnd
      }
    }
  })

  // 最後のグループを追加
  if (currentGroup.length > 0 && groupEndTime) {
    groups.push({
      plans: currentGroup,
      startTime: new Date(currentGroup[0]!.start),
      endTime: groupEndTime,
    })
  }

  return groups
}

/**
 * グループ内のレイアウトを計算（Googleカレンダー準拠）
 */
function calculateGroupLayout(plans: TimedPlan[]): PlanLayout[] {
  const layouts: PlanLayout[] = []

  // 各プランの「競合リスト」を作成
  const conflicts = new Map<string, Set<string>>()

  plans.forEach((plan1) => {
    const conflictSet = new Set<string>()
    plans.forEach((plan2) => {
      if (plan1.id !== plan2.id && isOverlapping(plan1, plan2)) {
        conflictSet.add(plan2.id)
      }
    })
    conflicts.set(plan1.id, conflictSet)
  })

  // 最大同時重複数を計算
  const maxConcurrent = calculateMaxConcurrent(plans)

  // 各プランにカラムを割り当て
  const assignments = new Map<string, number>()

  plans.forEach((plan) => {
    const usedColumns = new Set<number>()

    // このプランと競合するプランが使用しているカラムを収集
    conflicts.get(plan.id)?.forEach((conflictId) => {
      if (assignments.has(conflictId)) {
        usedColumns.add(assignments.get(conflictId)!)
      }
    })

    // 最小の利用可能なカラムを見つける
    let column = 0
    while (usedColumns.has(column)) {
      column++
    }

    assignments.set(plan.id, column)
  })

  // レイアウト情報を生成
  plans.forEach((plan) => {
    const column = assignments.get(plan.id)!
    const width = 100 / maxConcurrent
    const left = width * column

    layouts.push({
      plan,
      column,
      totalColumns: maxConcurrent,
      width,
      left,
    })
  })

  return layouts
}

/**
 * 2つのプランが重複しているかを判定
 */
function isOverlapping(plan1: TimedPlan, plan2: TimedPlan): boolean {
  // start, end を使用
  const start1 = new Date(plan1.start)
  const end1 = new Date(plan1.end)
  const start2 = new Date(plan2.start)
  const end2 = new Date(plan2.end)

  const isOverlap = start1 < end2 && start2 < end1

  return isOverlap
}

/**
 * 最大同時重複数を計算
 */
function calculateMaxConcurrent(plans: TimedPlan[]): number {
  const timePoints: { time: Date; type: 'start' | 'end'; planId: string }[] = []

  plans.forEach((plan) => {
    // start, end を使用
    const start = new Date(plan.start)
    const end = new Date(plan.end)

    timePoints.push({ time: start, type: 'start', planId: plan.id })
    timePoints.push({ time: end, type: 'end', planId: plan.id })
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
      console.log(`${index}: START (${point.planId}) - current=${current}, max=${max}`)
    } else {
      current--
      console.log(`${index}: END (${point.planId}) - current=${current}, max=${max}`)
    }
  })

  console.log('🎯 最大同時重複数:', max)
  return max
}
