'use client'

import { useEffect, useMemo } from 'react'

import { usePlans } from '@/features/plans/hooks/usePlans'
import type { Plan } from '@/features/plans/types/plan'
import { logger } from '@/lib/logger'

import { calculateViewDateRange } from '../../../lib/view-helpers'
import { plansToCalendarPlans } from '../../../utils/planDataAdapter'

import type { CalendarPlan, CalendarViewType, ViewDateRange } from '../../../types/calendar.types'

interface UseCalendarDataOptions {
  viewType: CalendarViewType
  currentDate: Date
}

interface PlanWithPlanTags extends Plan {
  plan_tags?: Array<{ tag_id: string; tags: { id: string; name: string; color: string } | null }>
}

// tRPCから返る型（API定義から推論される）
type PlansApiResult = ReturnType<typeof usePlans>['data']

interface UseCalendarDataResult {
  viewDateRange: ViewDateRange
  filteredEvents: CalendarPlan[]
  plansData: PlansApiResult
}

export function useCalendarData({ viewType, currentDate }: UseCalendarDataOptions): UseCalendarDataResult {
  // plansを取得（リアルタイム性最優化済み）
  const { data: plansData } = usePlans()

  // デバッグ: plansDataの更新を検知
  useEffect(() => {
    console.log('[useCalendarData] plansData 更新検知:', {
      count: plansData?.length,
      firstPlan: plansData?.[0]
        ? {
            id: plansData[0].id,
            start_time: plansData[0].start_time,
            end_time: plansData[0].end_time,
          }
        : null,
    })
  }, [plansData])

  // ビューに応じた期間計算
  const viewDateRange = useMemo(() => {
    return calculateViewDateRange(viewType, currentDate)
  }, [viewType, currentDate])

  // 表示範囲のイベントを取得してCalendarPlan型に変換（削除済みを除外）
  const filteredEvents = useMemo(() => {
    // planデータがない場合は空配列を返す
    if (!plansData) {
      return []
    }

    // plan_tags を tags に変換
    const plansWithTags = (plansData as PlanWithPlanTags[]).map((plan) => {
      const tags = plan.plan_tags?.map((pt) => pt.tags).filter(Boolean) ?? []
      const { plan_tags: _plan_tags, ...planData } = plan
      return { ...planData, tags } as Plan & { tags: Array<{ id: string; name: string; color: string }> }
    })

    // start_time/end_timeが設定されているplanのみを抽出
    const plansWithTime = plansWithTags.filter((plan) => {
      return plan.start_time && plan.end_time
    })

    // planをCalendarPlanに変換
    const calendarEvents = plansToCalendarPlans(
      plansWithTime as Array<Plan & { tags: Array<{ id: string; name: string; color: string }> }>
    )

    // 表示範囲内のイベントのみをフィルタリング
    const startDateOnly = new Date(
      viewDateRange.start.getFullYear(),
      viewDateRange.start.getMonth(),
      viewDateRange.start.getDate()
    )
    const endDateOnly = new Date(
      viewDateRange.end.getFullYear(),
      viewDateRange.end.getMonth(),
      viewDateRange.end.getDate()
    )

    const filtered = calendarEvents.filter((event) => {
      // startDate/endDate が null の場合はスキップ
      if (!event.startDate || !event.endDate) {
        return false
      }
      const eventStartDateOnly = new Date(
        event.startDate.getFullYear(),
        event.startDate.getMonth(),
        event.startDate.getDate()
      )
      const eventEndDateOnly = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate())

      return (
        (eventStartDateOnly >= startDateOnly && eventStartDateOnly <= endDateOnly) ||
        (eventEndDateOnly >= startDateOnly && eventEndDateOnly <= endDateOnly) ||
        (eventStartDateOnly <= startDateOnly && eventEndDateOnly >= endDateOnly)
      )
    })

    logger.log(`[useCalendarData] plansフィルタリング:`, {
      totalplans: plansData.length,
      plansWithTime: plansWithTime.length,
      filteredCount: filtered.length,
      dateRange: {
        start: startDateOnly.toDateString(),
        end: endDateOnly.toDateString(),
      },
      sampleEvents: filtered.slice(0, 3).map((e) => ({
        title: e.title,
        startDate: e.startDate?.toISOString() ?? null,
        endDate: e.endDate?.toISOString() ?? null,
        tags: e.tags,
      })),
    })

    return filtered
  }, [viewDateRange, plansData])

  return {
    viewDateRange,
    filteredEvents,
    plansData,
  }
}
