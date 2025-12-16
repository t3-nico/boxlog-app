'use client'

import { useMemo } from 'react'

import { differenceInMinutes, isSameDay, isToday, startOfDay } from 'date-fns'

import type { CalendarPlan } from '../types/calendar.types'

/**
 * 未完了プラン情報
 */
export interface OverduePlan {
  /** プランデータ */
  plan: CalendarPlan
  /** 超過時間（分） */
  overdueMinutes: number
}

/**
 * 日付ごとの未完了プランを取得するフック
 *
 * @param plans - 全プラン配列
 * @param date - 対象日付（指定日に終了予定だったプラン）
 * @returns 未完了プラン配列（超過時間でソート済み）
 *
 * @description
 * フィルタ条件:
 * - status !== 'done' (todo または doing)
 * - endDate !== null
 * - endDate < now (期限切れ)
 * - 当日の場合: endDateが今日で、かつ現在時刻を過ぎているもの
 * - 過去の日付: その日が終了予定日だったもの
 */
export function useOverduePlans(plans: CalendarPlan[], date: Date): OverduePlan[] {
  return useMemo(() => {
    const now = new Date()
    const targetDate = startOfDay(date)
    const isTargetToday = isToday(date)

    return plans
      .filter((plan) => {
        // 完了済みは除外
        if (plan.status === 'done') return false

        // 終了日がないプランは除外
        if (!plan.endDate) return false

        // 今日の場合: 終了予定時刻が現在時刻を過ぎているもの
        if (isTargetToday) {
          return isSameDay(plan.endDate, targetDate) && plan.endDate < now
        }

        // 過去の日付の場合: その日が終了予定日だったもの
        return isSameDay(plan.endDate, targetDate)
      })
      .map((plan) => ({
        plan,
        overdueMinutes: differenceInMinutes(now, plan.endDate!),
      }))
      .sort((a, b) => b.overdueMinutes - a.overdueMinutes) // 超過時間が長い順
  }, [plans, date])
}

/**
 * 全ての期限切れ未完了プランを取得するフック
 *
 * @param plans - 全プラン配列
 * @returns 期限切れの未完了プラン配列（超過時間でソート済み）
 *
 * @description
 * フィルタ条件:
 * - status !== 'done' (todo または doing)
 * - endDate !== null
 * - endDate < now (現在時刻より前に終了予定だった)
 */
export function useAllOverduePlans(plans: CalendarPlan[]): OverduePlan[] {
  return useMemo(() => {
    const now = new Date()

    return plans
      .filter((plan) => {
        // 完了済みは除外
        if (plan.status === 'done') return false

        // 終了日がないプランは除外
        if (!plan.endDate) return false

        // 終了予定時刻が現在時刻を過ぎているもの
        return plan.endDate < now
      })
      .map((plan) => ({
        plan,
        overdueMinutes: differenceInMinutes(now, plan.endDate!),
      }))
      .sort((a, b) => b.overdueMinutes - a.overdueMinutes) // 超過時間が長い順
  }, [plans])
}
