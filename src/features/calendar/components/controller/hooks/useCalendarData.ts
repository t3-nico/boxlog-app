// @ts-nocheck
// TODO(#389): 型エラーを修正後、@ts-nocheckを削除
'use client'

import { useEffect, useMemo } from 'react'

import { useplans } from '@/features/plans/hooks/usePlans'
import { logger } from '@/lib/logger'

import { calculateViewDateRange } from '../../../lib/view-helpers'
import { plansToCalendarPlans } from '../../../utils/planDataAdapter'

import type { CalendarPlan, CalendarViewType, ViewDateRange } from '../../../types/calendar.types'

interface UseCalendarDataOptions {
  viewType: CalendarViewType
  currentDate: Date
}

interface UseCalendarDataResult {
  viewDateRange: ViewDateRange
  filteredTasks: never[]
  filteredEvents: CalendarPlan[]
  plansData: unknown
}

export function useCalendarData({ viewType, currentDate }: UseCalendarDataOptions): UseCalendarDataResult {
  // plansを取得（リアルタイム性最優化済み）
  const { data: plansData } = useplans()

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
    const dateRange = calculateViewDateRange(viewType, currentDate)

    // TwoWeekView診断ログ
    if (viewType === '2week') {
      logger.log('[useCalendarData] 2week範囲計算:', {
        viewType,
        currentDate: currentDate.toDateString(),
        calculatedRange: {
          start: dateRange.start.toDateString(),
          end: dateRange.end.toDateString(),
          dayCount: dateRange.days.length,
        },
      })
    }

    return dateRange
  }, [viewType, currentDate])

  // 表示範囲のタスクを取得
  const filteredTasks = useMemo(() => {
    return []
  }, [])

  // 表示範囲のイベントを取得してCalendarPlan型に変換（削除済みを除外）
  const filteredEvents = useMemo(() => {
    // planデータがない場合は空配列を返す
    if (!plansData) {
      return []
    }

    // plan_tags を tags に変換
    const plansWithTags = (
      plansData as unknown as Array<plan & { plan_tags?: Array<{ tag_id: string; tags: unknown }> }>
    ).map((plan) => {
      const tags = plan.plan_tags?.map((tt) => tt.tags).filter(Boolean) ?? []
      const { plan_tags, ...planData } = plan
      return { ...planData, tags } as plan & { tags: unknown[] }
    })

    // start_time/end_timeが設定されているplanのみを抽出
    const plansWithTime = plansWithTags.filter((plan) => {
      return plan.start_time && plan.end_time
    })

    // planをCalendarPlanに変換
    const calendarEvents = plansToCalendarPlans(plansWithTime as plan[])

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
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        tags: e.tags,
      })),
    })

    return filtered
  }, [viewDateRange.start, viewDateRange.end, plansData])

  return {
    viewDateRange,
    filteredTasks,
    filteredEvents,
    plansData,
  }
}
