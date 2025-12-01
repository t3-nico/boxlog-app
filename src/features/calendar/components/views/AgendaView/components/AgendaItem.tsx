'use client'

import { format } from 'date-fns'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { cn } from '@/lib/utils'

import type { AgendaItemProps } from '../AgendaView.types'

/**
 * AgendaItem - アジェンダビュー内の個別プラン表示
 *
 * Googleカレンダーのアジェンダ風デザイン:
 * - 左側に時間表示
 * - カラーインジケーター
 * - タイトルと詳細情報
 */
export function AgendaItem({ plan, onClick, onContextMenu }: AgendaItemProps) {
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
    return format(date, 'HH:mm')
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
        'hover:bg-accent/50 focus-visible:bg-accent/50',
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
          <span className="text-xs">終日</span>
        )}
      </div>

      {/* カラーインジケーター */}
      <div
        className="mt-1.5 h-4 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: plan.color || 'var(--primary)' }}
      />

      {/* コンテンツ */}
      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate font-medium">{plan.title}</div>

        {/* タグ */}
        {displayTags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {displayTags.map((tag) => (
              <span
                key={tag.id}
                className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs"
                style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : undefined}
              >
                {tag.name}
              </span>
            ))}
            {(plan.tags?.length ?? 0) > 2 && (
              <span className="text-muted-foreground text-xs">+{(plan.tags?.length ?? 0) - 2}</span>
            )}
          </div>
        )}

        {/* 説明（存在する場合） */}
        {plan.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{plan.description}</p>
        )}
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
