'use client'

import { useMemo } from 'react'

import { addDays, isSameDay, startOfDay } from 'date-fns'
import { CalendarDays } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { EmptyState } from '../shared/components/EmptyState'

import type { AgendaViewProps } from './AgendaView.types'
import { AgendaListItem } from './components/AgendaListItem'

/** アジェンダビューで表示する日数 */
const AGENDA_DAYS = 14

/**
 * AgendaView - スケジュール済みプランをフラットなリストで表示
 *
 * **レイアウト**: 日付 | 時間 | タイトル# | タグ
 */
export function AgendaView({ plans, currentDate, className, onPlanClick, onPlanContextMenu }: AgendaViewProps) {
  const t = useTranslations('calendar.agenda')

  // 表示範囲の計算（currentDateから14日間）
  const dateRange = useMemo(() => {
    const start = startOfDay(currentDate)
    const dates: Date[] = []
    for (let i = 0; i < AGENDA_DAYS; i++) {
      dates.push(addDays(start, i))
    }
    return dates
  }, [currentDate])

  // プランをフラットなリストに変換し、時系列でソート
  const sortedPlans = useMemo(() => {
    const plansInRange = (plans ?? []).filter((plan) => {
      if (!plan.startDate) return false
      const planDate = startOfDay(plan.startDate)
      return dateRange.some((d) => isSameDay(d, planDate))
    })

    // 日時順でソート
    return plansInRange.sort((a, b) => {
      const aTime = a.startDate?.getTime() ?? 0
      const bTime = b.startDate?.getTime() ?? 0
      return aTime - bTime
    })
  }, [plans, dateRange])

  const hasAnyPlans = sortedPlans.length > 0

  return (
    <CalendarViewAnimation viewType="agenda">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        {/* スクロール可能なコンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {hasAnyPlans ? (
            <div className="divide-border divide-y">
              {sortedPlans.map((plan) => (
                <AgendaListItem key={plan.id} plan={plan} onClick={onPlanClick} onContextMenu={onPlanContextMenu} />
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title={t('emptyTitle')} description={t('emptyDescription')} />
          )}
        </div>
      </div>
    </CalendarViewAnimation>
  )
}
