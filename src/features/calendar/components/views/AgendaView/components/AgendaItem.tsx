'use client'

import { Bell } from 'lucide-react'

import { calendarColors } from '@/features/calendar/theme'
import { RecurringIndicatorFromFlag } from '@/features/plans/components/shared/RecurringIndicator'
import { useDateFormat } from '@/features/settings/hooks/useDateFormat'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'

import type { AgendaItemProps } from '../AgendaView.types'

/**
 * AgendaItem - アジェンダビュー内の個別プラン表示
 *
 * PlanCardContentと統一されたスタイル:
 * - 左側に時間表示
 * - カラーインジケーター（calendarColors使用）
 * - タイトル、タグ、アイコン表示
 */
export function AgendaItem({ plan, onClick, onContextMenu }: AgendaItemProps) {
  const locale = useLocale()
  const scheduledColors = calendarColors.event.scheduled
  const { formatTime: formatTimeWithSettings } = useDateFormat()

  const handleClick = () => {
    onClick?.(plan)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu?.(plan, e)
  }

  // 時間のフォーマット
  const formatTime = (date: Date | null) => {
    if (!date) return ''
    return formatTimeWithSettings(date)
  }

  const startTime = formatTime(plan.startDate)
  const endTime = formatTime(plan.endDate)
  const hasTime = startTime && endTime

  // タグの表示（最大2つ）
  const displayTags = plan.tags?.slice(0, 2) ?? []

  return (
    <button
      type="button"
      className={cn(
        'group flex w-full items-start gap-3 rounded-lg p-3',
        'hover:bg-state-hover focus-visible:bg-state-active/50',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
        'transition-colors duration-150',
        'cursor-pointer text-left'
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* 時間表示 */}
      <div className="text-muted-foreground w-16 shrink-0 pt-0.5 text-sm">
        {hasTime ? (
          <div className="flex flex-col">
            <span>{startTime}</span>
            <span className="text-muted-foreground/60 text-xs">{endTime}</span>
          </div>
        ) : (
          <span className="text-xs">{locale === 'ja' ? '終日' : 'All day'}</span>
        )}
      </div>

      {/* カラーインジケーター（calendarColors使用） */}
      <div
        className={cn('mt-1.5 h-4 w-1 shrink-0 rounded-full', scheduledColors.background)}
        style={plan.color ? { backgroundColor: plan.color } : undefined}
      />

      {/* コンテンツ */}
      <div className="min-w-0 flex-1">
        {/* タイトル + プラン番号（PlanCardContentと統一） */}
        <div className="flex items-baseline gap-1">
          <span className="text-foreground truncate font-medium">{plan.title}</span>
          {plan.plan_number && <span className="text-muted-foreground flex-shrink-0 text-sm">#{plan.plan_number}</span>}
        </div>

        {/* アイコン表示（繰り返し・通知） */}
        {(plan.isRecurring || plan.reminder_minutes != null) && (
          <div className="mt-0.5 flex items-center gap-1.5">
            <RecurringIndicatorFromFlag isRecurring={plan.isRecurring} size="sm" />
            {plan.reminder_minutes != null && (
              <Bell className="text-muted-foreground h-3.5 w-3.5" aria-label="Reminder set" />
            )}
          </div>
        )}

        {/* タグ（PlanCardContentと統一されたスタイル） */}
        {displayTags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {displayTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm border px-1.5 py-0.5 text-xs leading-tight"
                style={{ borderColor: tag.color }}
                title={tag.name}
              >
                {tag.icon && (
                  <span className="flex-shrink-0" style={{ color: tag.color }}>
                    {tag.icon}
                  </span>
                )}
                <span className="flex-shrink-0 font-medium" style={{ color: tag.color }}>
                  #
                </span>
                <span className="truncate">{tag.name}</span>
              </span>
            ))}
            {(plan.tags?.length ?? 0) > 2 && (
              <span className="text-muted-foreground inline-flex items-center px-1 text-xs">
                +{(plan.tags?.length ?? 0) - 2}
              </span>
            )}
          </div>
        )}

        {/* 説明（存在する場合） */}
        {plan.description && <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{plan.description}</p>}
      </div>

      {/* 所要時間 */}
      {plan.duration > 0 && (
        <div className="text-muted-foreground shrink-0 text-xs">
          {plan.duration >= 60
            ? `${Math.floor(plan.duration / 60)}h${plan.duration % 60 > 0 ? ` ${plan.duration % 60}m` : ''}`
            : `${plan.duration}m`}
        </div>
      )}
    </button>
  )
}
