'use client'

import { isToday as checkIsToday, format, isTomorrow } from 'date-fns'
import { ja } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'

import type { AgendaDayGroupProps } from '../AgendaView.types'

import { AgendaItem } from './AgendaItem'

/**
 * AgendaDayGroup - 日付ごとにグループ化されたプラン表示
 *
 * 日付ヘッダーと、その日のプランリストを表示
 */
export function AgendaDayGroup({ date, plans, isToday, onPlanClick, onPlanContextMenu }: AgendaDayGroupProps) {
  const locale = useLocale()
  const dateLocale = locale === 'ja' ? ja : undefined

  // 日付ラベルの生成
  const getDateLabel = () => {
    if (checkIsToday(date)) {
      return locale === 'ja' ? '今日' : 'Today'
    }
    if (isTomorrow(date)) {
      return locale === 'ja' ? '明日' : 'Tomorrow'
    }
    return format(date, locale === 'ja' ? 'M月d日' : 'MMM d', dateLocale ? { locale: dateLocale } : undefined)
  }

  // 曜日の取得
  const getDayOfWeek = () => {
    return format(date, locale === 'ja' ? 'EEEE' : 'EEEE', dateLocale ? { locale: dateLocale } : undefined)
  }

  // プランを時間順にソート
  const sortedPlans = [...plans].sort((a, b) => {
    // 終日イベントを先に
    if (a.allDay && !b.allDay) return -1
    if (!a.allDay && b.allDay) return 1

    // 開始時間でソート
    const aTime = a.startDate?.getTime() ?? 0
    const bTime = b.startDate?.getTime() ?? 0
    return aTime - bTime
  })

  return (
    <div className="mb-4">
      {/* 日付ヘッダー */}
      <div
        className={cn(
          'bg-background/95 sticky top-0 z-10 flex items-baseline gap-2 px-4 py-2 backdrop-blur-sm',
          'border-border border-b'
        )}
      >
        <span className={cn('text-lg font-semibold', isToday ? 'text-primary' : 'text-foreground')}>
          {getDateLabel()}
        </span>
        <span className="text-muted-foreground text-sm">{getDayOfWeek()}</span>
        {isToday && (
          <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-medium">
            {locale === 'ja' ? '今日' : 'Today'}
          </span>
        )}
      </div>

      {/* プランリスト */}
      <div className="divide-border divide-y">
        {sortedPlans.length > 0 ? (
          sortedPlans.map((plan) => (
            <AgendaItem key={plan.id} plan={plan} onClick={onPlanClick} onContextMenu={onPlanContextMenu} />
          ))
        ) : (
          <div className="text-muted-foreground px-4 py-6 text-center text-sm">
            {locale === 'ja' ? '予定はありません' : 'No events'}
          </div>
        )}
      </div>
    </div>
  )
}
