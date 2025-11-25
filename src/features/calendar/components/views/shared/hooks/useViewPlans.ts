import { useMemo } from 'react'

import { isSameDay, isValid } from 'date-fns'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

import { HOUR_HEIGHT } from '../constants/grid.constants'

import { usePlanLayoutCalculator, type PlanLayout } from './usePlanLayoutCalculator'

const PLAN_PADDING = 2 // プラン間のパディング
const MIN_PLAN_HEIGHT = 20 // 最小プラン高さ

interface UseViewPlansOptions {
  date: Date
  plans: CalendarPlan[]
}

export interface PlanPosition {
  plan: CalendarPlan
  top: number
  height: number
  left: number
  width: number
  zIndex: number
  column: number
  totalColumns: number
  opacity?: number
}

interface UseViewPlansReturn {
  dayPlans: CalendarPlan[]
  planPositions: PlanPosition[]
  maxConcurrentPlans: number
  skippedPlansCount: number
}

/**
 * 汎用的なビュープラン処理フック
 * DayView, WeekView等で共通利用可能
 */
export function useViewPlans({ date, plans = [] }: UseViewPlansOptions): UseViewPlansReturn {
  // 指定日のプランのみフィルター
  const dayPlans = useMemo(() => {
    if (!plans || !Array.isArray(plans)) {
      return []
    }
    return plans.filter((plan) => {
      if (!plan.startDate || !isValid(new Date(plan.startDate))) {
        return false
      }

      const planDate = new Date(plan.startDate)
      return isSameDay(planDate, date)
    })
  }, [date, plans])

  // CalendarPlanをusePlanLayoutCalculatorで期待される形式に変換
  const convertedPlans = useMemo(() => {
    return dayPlans.map((plan) => ({
      ...plan,
      start: plan.startDate!,
      end: plan.endDate || new Date(new Date(plan.startDate!).getTime() + 60 * 60 * 1000),
    }))
  }, [dayPlans])

  // 新しいレイアウト計算システムを使用
  const planLayouts = usePlanLayoutCalculator(convertedPlans, { notifyConflicts: true })

  // レイアウト情報をPlanPositionに変換
  const planPositions = useMemo((): PlanPosition[] => {
    return planLayouts.map((layout: PlanLayout, index: number) => {
      const startDate = new Date(layout.plan.start)
      const endDate = new Date(layout.plan.end)

      const startHour = startDate.getHours() + startDate.getMinutes() / 60
      const endHour = endDate.getHours() + endDate.getMinutes() / 60
      const duration = Math.max(endHour - startHour, 0.25) // 最小15分

      // 位置計算
      const top = startHour * HOUR_HEIGHT
      const height = Math.max(duration * HOUR_HEIGHT - PLAN_PADDING, MIN_PLAN_HEIGHT)

      console.log('🎨 プラン配置:', {
        タイトル: layout.plan.title,
        カラム: layout.column,
        総カラム数: layout.totalColumns,
        幅: layout.width,
        左位置: layout.left,
        top,
        height,
      })

      return {
        plan: layout.plan as CalendarPlan,
        top,
        height,
        left: layout.left,
        width: layout.width,
        zIndex: 10 + index,
        column: layout.column,
        totalColumns: layout.totalColumns,
        opacity: layout.totalColumns > 1 ? 0.95 : 1.0,
      }
    })
  }, [planLayouts])

  const maxConcurrentPlans = useMemo(() => {
    return Math.max(1, ...planLayouts.map((layout: PlanLayout) => layout.totalColumns))
  }, [planLayouts])

  // デバッグログ
  console.log('🔍 useViewPlans Debug:', {
    plansInput: plans.length,
    dayPlansFiltered: dayPlans.length,
    planLayoutsCount: planLayouts.length,
    planPositionsCount: planPositions.length,
    dayPlans: dayPlans.slice(0, 2),
    planPositions: planPositions.slice(0, 2),
  })

  // planPositions内のundefinedを検出
  planPositions.forEach((pos, index) => {
    if (!pos.plan || !pos.plan.id) {
      console.error('❌ useViewPlans: Invalid plan in planPositions', {
        index,
        position: pos,
        planLayout: planLayouts[index],
      })
    }
  })

  return {
    dayPlans,
    planPositions,
    maxConcurrentPlans,
    skippedPlansCount: 0, // 新しいシステムではスキップしない
  }
}
