// @ts-nocheck TODO(#621): Plans削除後の一時的な型エラー回避
/**
 * Plan Processing Web Worker
 * 重い計算処理をメインスレッドから分離してUIをブロックしない
 */

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

// ワーカーメッセージの型定義
interface ProcessPlansPayload {
  plans: CalendarPlan[]
  options?: Record<string, unknown>
}

interface CalculateOverlapsPayload {
  plans: CalendarPlan[]
  dateRange: { start: Date; end: Date }
}

interface GenerateRecurringPayload {
  plan: CalendarPlan
  pattern: RecurrencePattern
  dateRange: { start: Date; end: Date }
}

interface SearchPlansPayload {
  plans: CalendarPlan[]
  query: string
  options?: Record<string, unknown>
}

interface OptimizeLayoutPayload {
  plans: CalendarPlan[]
  containerWidth: number
}

type WorkerMessagePayload =
  | ProcessPlansPayload
  | CalculateOverlapsPayload
  | GenerateRecurringPayload
  | SearchPlansPayload
  | OptimizeLayoutPayload

interface WorkerMessage {
  id: string
  type: 'PROCESS_PLANS' | 'CALCULATE_OVERLAPS' | 'GENERATE_RECURRING' | 'SEARCH_PLANS' | 'OPTIMIZE_LAYOUT'
  payload: WorkerMessagePayload
}

interface WorkerResponse {
  id: string
  type: string
  result?: unknown
  error?: string
  performance?: {
    duration: number
    memoryUsed: number
  }
}

// 繰り返しイベントのパターン
interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: Date
  count?: number
  byWeekDay?: number[]
  byMonthDay?: number[]
}

// プラン重複計算の結果
interface OverlapResult {
  planId: string
  overlaps: {
    planId: string
    overlapDuration: number
    overlapPercentage: number
  }[]
}

// レイアウト最適化の結果
interface LayoutOptimization {
  planId: string
  column: number
  width: number
  left: number
}

// メインスレッドからのメッセージ処理
self.onmessage = function (e: MessageEvent<WorkerMessage>) {
  const { id, type, payload } = e.data
  const startTime = performance.now()

  try {
    let result: unknown

    switch (type) {
      case 'PROCESS_PLANS': {
        const p = payload as ProcessPlansPayload
        result = processPlans(p.plans, p.options)
        break
      }

      case 'CALCULATE_OVERLAPS': {
        const p = payload as CalculateOverlapsPayload
        result = calculatePlanOverlaps(p.plans, p.dateRange)
        break
      }

      case 'GENERATE_RECURRING': {
        const p = payload as GenerateRecurringPayload
        result = generateRecurringPlans(p.plan, p.pattern, p.dateRange)
        break
      }

      case 'SEARCH_PLANS': {
        const p = payload as SearchPlansPayload
        result = searchPlans(p.plans, p.query, p.options)
        break
      }

      case 'OPTIMIZE_LAYOUT': {
        const p = payload as OptimizeLayoutPayload
        result = optimizePlanLayout(p.plans, p.containerWidth)
        break
      }

      default:
        throw new Error(`Unknown message type: ${type}`)
    }

    const endTime = performance.now()
    const response: WorkerResponse = {
      id,
      type,
      result,
      performance: {
        duration: endTime - startTime,
        memoryUsed: getMemoryUsage(),
      },
    }

    self.postMessage(response)
  } catch (error) {
    const endTime = performance.now()
    const response: WorkerResponse = {
      id,
      type,
      error: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        duration: endTime - startTime,
        memoryUsed: getMemoryUsage(),
      },
    }

    self.postMessage(response)
  }
}

/**
 * プランの前処理（正規化、ソート、重複除去など）
 */
function processPlans(plans: CalendarPlan[], options: Record<string, unknown> = {}) {
  // 大量データを効率的に処理
  const batchSize = 1000
  const processedPlans: CalendarPlan[] = []

  for (let i = 0; i < plans.length; i += batchSize) {
    const batch = plans.slice(i, i + batchSize)

    // バッチごとに処理
    const processed = batch
      .filter((plan) => plan.startDate && plan.title) // 必須フィールドチェック
      .map((plan) => normalizePlan(plan))
      .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())

    processedPlans.push(...processed)

    // 進行状況の報告（オプション）
    if (options.onProgress) {
      const progress = Math.min(100, ((i + batchSize) / plans.length) * 100)
      self.postMessage({
        id: 'progress',
        type: 'PROGRESS',
        result: { progress },
      })
    }
  }

  // 重複除去
  const uniquePlans = removeDuplicatePlans(processedPlans)

  return {
    plans: uniquePlans,
    totalProcessed: plans.length,
    uniqueCount: uniquePlans.length,
    duplicatesRemoved: plans.length - uniquePlans.length,
  }
}

/**
 * プランの正規化
 */
function normalizePlan(plan: CalendarPlan): CalendarPlan {
  const normalized: CalendarPlan = {
    ...plan,
    title: plan.title.trim(),
    color: plan.color || '#3b82f6',
    tags: plan.tags || [],
  }

  if (plan.startDate) {
    normalized.startDate = new Date(plan.startDate)
  }
  if (plan.endDate) {
    normalized.endDate = new Date(plan.endDate)
  }

  return normalized
}

/**
 * 重複プランの除去
 */
function removeDuplicatePlans(plans: CalendarPlan[]): CalendarPlan[] {
  const seen = new Set<string>()
  const unique: CalendarPlan[] = []

  for (const plan of plans) {
    const key = `${plan.title}-${plan.startDate?.getTime()}-${plan.endDate?.getTime()}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(plan)
    }
  }

  return unique
}

/**
 * プランの重複計算
 */
function calculatePlanOverlaps(plans: CalendarPlan[], dateRange: { start: Date; end: Date }): OverlapResult[] {
  const results: OverlapResult[] = []
  const relevantPlans = plans.filter(
    (plan) => plan.startDate && plan.startDate >= dateRange.start && plan.startDate <= dateRange.end
  )

  for (let i = 0; i < relevantPlans.length; i++) {
    const plan = relevantPlans[i]
    if (!plan || !plan.startDate || !plan.endDate) continue

    const overlaps: OverlapResult['overlaps'] = []

    for (let j = i + 1; j < relevantPlans.length; j++) {
      const otherPlan = relevantPlans[j]
      if (!otherPlan || !otherPlan.startDate || !otherPlan.endDate) continue

      const overlap = calculateTimeOverlap(plan.startDate, plan.endDate, otherPlan.startDate, otherPlan.endDate)

      if (overlap.duration > 0) {
        overlaps.push({
          planId: otherPlan.id,
          overlapDuration: overlap.duration,
          overlapPercentage: overlap.percentage,
        })
      }
    }

    if (overlaps.length > 0) {
      results.push({
        planId: plan.id,
        overlaps,
      })
    }
  }

  return results
}

/**
 * 時間の重複計算
 */
function calculateTimeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): { duration: number; percentage: number } {
  const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()))
  const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()))

  if (overlapStart >= overlapEnd) {
    return { duration: 0, percentage: 0 }
  }

  const overlapDuration = overlapEnd.getTime() - overlapStart.getTime()
  const event1Duration = end1.getTime() - start1.getTime()
  const percentage = (overlapDuration / event1Duration) * 100

  return { duration: overlapDuration, percentage }
}

/**
 * 繰り返しプランの生成
 */
function generateRecurringPlans(
  basePlan: CalendarPlan,
  pattern: RecurrencePattern,
  dateRange: { start: Date; end: Date }
): CalendarPlan[] {
  if (!basePlan.startDate || !basePlan.endDate) return []

  const plans: CalendarPlan[] = []
  const planDuration = basePlan.endDate.getTime() - basePlan.startDate.getTime()

  let currentDate = new Date(basePlan.startDate)
  let count = 0
  const maxCount = pattern.count || 1000 // 安全なデフォルト

  while (currentDate <= dateRange.end && count < maxCount) {
    if (currentDate >= dateRange.start) {
      const newPlan: CalendarPlan = {
        ...basePlan,
        id: `${basePlan.id}_${count}`,
        startDate: new Date(currentDate),
        endDate: new Date(currentDate.getTime() + planDuration),
        parentPlanId: basePlan.id,
      }
      plans.push(newPlan)
    }

    // 次の日付を計算
    currentDate = getNextRecurrenceDate(currentDate, pattern)
    count++

    if (pattern.endDate && currentDate > pattern.endDate) {
      break
    }
  }

  return plans
}

/**
 * 次の繰り返し日付を計算
 */
function getNextRecurrenceDate(currentDate: Date, pattern: RecurrencePattern): Date {
  const nextDate = new Date(currentDate)

  switch (pattern.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + pattern.interval)
      break

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7 * pattern.interval)
      break

    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + pattern.interval)
      break

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + pattern.interval)
      break
  }

  return nextDate
}

/**
 * プラン検索
 */
function searchPlans(
  plans: CalendarPlan[],
  query: string,
  options: { caseSensitive?: boolean; fields?: string[] } = {}
): CalendarPlan[] {
  const normalizedQuery = options.caseSensitive ? query : query.toLowerCase()
  const fields = options.fields || ['title', 'description', 'location']

  return plans.filter((plan) => {
    return fields.some((field) => {
      const value = plan[field as keyof CalendarPlan] as string
      if (!value) return false

      const normalizedValue = options.caseSensitive ? value : value.toLowerCase()
      return normalizedValue.includes(normalizedQuery)
    })
  })
}

/**
 * プランレイアウトの最適化
 */
function optimizePlanLayout(plans: CalendarPlan[], containerWidth: number): LayoutOptimization[] {
  // 同時間帯のプランをグループ化
  const timeGroups = groupPlansByTime(plans)
  const layouts: LayoutOptimization[] = []

  for (const group of timeGroups) {
    const columnCount = group.length
    const columnWidth = containerWidth / columnCount

    group.forEach((plan, index) => {
      layouts.push({
        planId: plan.id,
        column: index,
        width: columnWidth - 4, // マージン考慮
        left: index * columnWidth + 2,
      })
    })
  }

  return layouts
}

/**
 * 時間帯でプランをグループ化
 */
function groupPlansByTime(plans: CalendarPlan[]): CalendarPlan[][] {
  const groups: CalendarPlan[][] = []
  const sortedPlans = plans
    .filter((p) => p.startDate && p.endDate)
    .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())

  for (const plan of sortedPlans) {
    // 重複する既存グループを探す
    const overlappingGroup = groups.find((group) => group.some((groupPlan) => plansOverlap(plan, groupPlan)))

    if (overlappingGroup) {
      overlappingGroup.push(plan)
    } else {
      groups.push([plan])
    }
  }

  return groups
}

/**
 * プランの重複チェック
 */
function plansOverlap(plan1: CalendarPlan, plan2: CalendarPlan): boolean {
  if (!plan1.startDate || !plan1.endDate || !plan2.startDate || !plan2.endDate) {
    return false
  }

  return plan1.startDate < plan2.endDate && plan2.startDate < plan1.endDate
}

/**
 * メモリ使用量の取得（概算）
 */
function getMemoryUsage(): number {
  // Web Worker環境では正確なメモリ使用量の取得が困難
  // 概算値を返す
  if ('memory' in performance) {
    return (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize
  }
  return 0
}

// エラーハンドリング
self.onerror = function (message, _source, _lineno, _colno, error) {
  self.postMessage({
    id: 'error',
    type: 'ERROR',
    error: error?.message || String(message),
  })
}

// 未処理の Promise エラーをキャッチ
self.addEventListener('unhandledrejection', function (event) {
  self.postMessage({
    id: 'error',
    type: 'UNHANDLED_REJECTION',
    error: event.reason,
  })
})
