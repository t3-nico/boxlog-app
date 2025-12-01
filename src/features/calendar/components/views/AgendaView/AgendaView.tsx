'use client'

import { useMemo } from 'react'

import { addDays, isSameDay, isToday, startOfDay } from 'date-fns'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

import { CalendarViewAnimation } from '../../animations/ViewTransition'

import type { AgendaViewProps } from './AgendaView.types'
import { AgendaDayGroup } from './components/AgendaDayGroup'

/** アジェンダビューで表示する日数 */
const AGENDA_DAYS = 14

/**
 * AgendaView - スケジュール済みプランを時系列リストで表示
 *
 * **特徴**:
 * - 日付ヘッダー付きのリスト形式
 * - 今日から14日先までを表示
 * - 予定がある日のみ表示（空の日はスキップ可能）
 * - 今日・明日のラベル表示
 */
export function AgendaView({
  plans,
  currentDate,
  className,
  onPlanClick,
  onPlanContextMenu,
}: AgendaViewProps) {
  const { locale } = useI18n()

  // 表示範囲の計算（currentDateから14日間）
  const dateRange = useMemo(() => {
    const start = startOfDay(currentDate)
    const dates: Date[] = []
    for (let i = 0; i < AGENDA_DAYS; i++) {
      dates.push(addDays(start, i))
    }
    return dates
  }, [currentDate])

  // プランを日付ごとにグループ化
  const plansByDate = useMemo(() => {
    const grouped = new Map<string, CalendarPlan[]>()

    // 各日付の初期化
    dateRange.forEach((date) => {
      grouped.set(date.toISOString(), [])
    })

    // プランを日付ごとに振り分け
    plans.forEach((plan) => {
      if (!plan.startDate) return

      const planDate = startOfDay(plan.startDate)

      // 表示範囲内の日付を探す
      const matchingDate = dateRange.find((d) => isSameDay(d, planDate))
      if (matchingDate) {
        const key = matchingDate.toISOString()
        const existing = grouped.get(key) ?? []
        grouped.set(key, [...existing, plan])
      }
    })

    return grouped
  }, [plans, dateRange])

  // 予定がある日のみをフィルタリング（オプション）
  const datesWithPlans = useMemo(() => {
    return dateRange.filter((date) => {
      const key = date.toISOString()
      const dayPlans = plansByDate.get(key) ?? []
      // 今日は常に表示、それ以外は予定がある日のみ
      return isToday(date) || dayPlans.length > 0
    })
  }, [dateRange, plansByDate])

  // プランが全くない場合のメッセージ
  const hasAnyPlans = plans.length > 0

  return (
    <CalendarViewAnimation viewType="agenda">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        {/* ヘッダー */}
        <div className="border-border bg-background shrink-0 border-b px-4 py-3">
          <h2 className="text-foreground text-lg font-semibold">
            {locale === 'ja' ? 'アジェンダ' : 'Agenda'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {locale === 'ja'
              ? `今後${AGENDA_DAYS}日間の予定`
              : `Next ${AGENDA_DAYS} days`}
          </p>
        </div>

        {/* スクロール可能なコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {hasAnyPlans || datesWithPlans.length > 0 ? (
            <div className="py-2">
              {datesWithPlans.map((date) => {
                const key = date.toISOString()
                const dayPlans = plansByDate.get(key) ?? []

                return (
                  <AgendaDayGroup
                    key={key}
                    date={date}
                    plans={dayPlans}
                    isToday={isToday(date)}
                    onPlanClick={onPlanClick}
                    onPlanContextMenu={onPlanContextMenu}
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-muted-foreground/50 mb-4 text-6xl">📅</div>
              <p className="text-muted-foreground text-center">
                {locale === 'ja'
                  ? '今後の予定はありません'
                  : 'No upcoming events'}
              </p>
              <p className="text-muted-foreground/70 mt-1 text-center text-sm">
                {locale === 'ja'
                  ? 'カレンダーで新しい予定を作成してください'
                  : 'Create a new event in the calendar'}
              </p>
            </div>
          )}
        </div>
      </div>
    </CalendarViewAnimation>
  )
}
