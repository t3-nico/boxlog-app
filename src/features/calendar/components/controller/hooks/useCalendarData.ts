'use client'

import { useEffect, useMemo } from 'react'

import { usePlans } from '@/features/plans/hooks/usePlans'
import type { Plan } from '@/features/plans/types/plan'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { logger } from '@/lib/logger'

import { useCalendarFilterStore } from '../../../stores/useCalendarFilterStore'

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
  allCalendarPlans: CalendarPlan[]
  plansData: PlansApiResult
}

export function useCalendarData({ viewType, currentDate }: UseCalendarDataOptions): UseCalendarDataResult {
  // plansを取得（リアルタイム性最優化済み）
  const { data: plansData } = usePlans()

  // 週の開始日設定を取得
  const weekStartsOn = useCalendarSettingsStore((state) => state.weekStartsOn)

  // フィルター設定を取得（状態の値を直接参照して変更を検知）
  const visibleTypes = useCalendarFilterStore((state) => state.visibleTypes)
  const visibleTagIds = useCalendarFilterStore((state) => state.visibleTagIds)
  const showUntagged = useCalendarFilterStore((state) => state.showUntagged)

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

  // ビューに応じた期間計算（週の開始日設定を反映）
  const viewDateRange = useMemo(() => {
    return calculateViewDateRange(viewType, currentDate, weekStartsOn)
  }, [viewType, currentDate, weekStartsOn])

  // 全プランをCalendarPlan型に変換（期限切れ未完了表示用）
  const allCalendarPlans = useMemo(() => {
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
    return plansToCalendarPlans(
      plansWithTime as Array<Plan & { tags: Array<{ id: string; name: string; color: string }> }>
    )
  }, [plansData])

  // 表示範囲のイベントをフィルタリング
  const filteredEvents = useMemo(() => {
    if (allCalendarPlans.length === 0) {
      return []
    }

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

    const filtered = allCalendarPlans.filter((event) => {
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

    // サイドバーのフィルター設定を適用
    const visibilityFiltered = filtered.filter((event) => {
      // 種類チェック（現時点ではPlanのみ）
      if (!visibleTypes.plan) {
        return false
      }

      const tagIds = event.tags?.map((tag) => tag.id) ?? []

      // タグなしの場合
      if (tagIds.length === 0) {
        return showUntagged
      }

      // いずれかのタグが表示中なら表示
      return tagIds.some((tagId) => visibleTagIds.has(tagId))
    })

    logger.log(`[useCalendarData] plansフィルタリング:`, {
      totalPlans: allCalendarPlans.length,
      dateFiltered: filtered.length,
      visibilityFiltered: visibilityFiltered.length,
      dateRange: {
        start: startDateOnly.toDateString(),
        end: endDateOnly.toDateString(),
      },
      sampleEvents: visibilityFiltered.slice(0, 3).map((e) => ({
        title: e.title,
        startDate: e.startDate?.toISOString() ?? null,
        endDate: e.endDate?.toISOString() ?? null,
        tags: e.tags,
      })),
    })

    return visibilityFiltered
  }, [viewDateRange, allCalendarPlans, visibleTypes, visibleTagIds, showUntagged])

  return {
    viewDateRange,
    filteredEvents,
    allCalendarPlans,
    plansData,
  }
}
