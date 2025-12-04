'use client'

import { useCallback, useMemo } from 'react'

import { format, isToday, isTomorrow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Tag } from 'lucide-react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { PlanTagSelectDialogEnhanced } from '@/features/plans/components/shared/PlanTagSelectDialogEnhanced'
import { usePlanTags } from '@/features/plans/hooks/usePlanTags'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'

interface AgendaListItemProps {
  plan: CalendarPlan
  onClick?: ((plan: CalendarPlan) => void) | undefined
  onContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined
}

/**
 * AgendaListItem - フラットリスト表示用のアイテム
 *
 * レイアウト: 日付 | 時間 | タイトル# | タグ
 */
export function AgendaListItem({ plan, onClick, onContextMenu }: AgendaListItemProps) {
  const locale = useLocale()
  const dateLocale = locale === 'ja' ? ja : undefined
  const { addPlanTag, removePlanTag } = usePlanTags()

  // プランの実際のIDを取得（繰り返しプランの場合はcalendarIdを使用）
  const planId = plan.calendarId ?? plan.id

  // 選択中のタグID
  const selectedTagIds = useMemo(() => {
    return plan.tags?.map((t) => t.id) ?? []
  }, [plan.tags])

  const handleClick = () => {
    onClick?.(plan)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu?.(plan, e)
  }

  // タグの変更ハンドラー
  const handleTagsChange = useCallback(
    async (newTagIds: string[]) => {
      const currentTagIds = selectedTagIds
      const addedTagIds = newTagIds.filter((id) => !currentTagIds.includes(id))
      const removedTagIds = currentTagIds.filter((id) => !newTagIds.includes(id))

      // 追加されたタグを処理
      for (const tagId of addedTagIds) {
        await addPlanTag(planId, tagId)
      }

      // 削除されたタグを処理
      for (const tagId of removedTagIds) {
        await removePlanTag(planId, tagId)
      }
    },
    [planId, selectedTagIds, addPlanTag, removePlanTag]
  )

  // 日付のフォーマット
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    if (isToday(date)) {
      return locale === 'ja' ? '今日' : 'Today'
    }
    if (isTomorrow(date)) {
      return locale === 'ja' ? '明日' : 'Tomorrow'
    }
    return format(date, locale === 'ja' ? 'M/d' : 'M/d', dateLocale ? { locale: dateLocale } : undefined)
  }

  // 時間のフォーマット
  const formatTime = (date: Date | null) => {
    if (!date) return ''
    return format(date, 'HH:mm')
  }

  const dateLabel = formatDate(plan.startDate)
  const startTime = formatTime(plan.startDate)
  const endTime = formatTime(plan.endDate)
  const timeRange =
    startTime && endTime ? `${startTime}-${endTime}` : startTime || (locale === 'ja' ? '終日' : 'All day')

  // タグの表示
  const displayTags = plan.tags?.slice(0, 3) ?? []

  return (
    <button
      type="button"
      className={cn(
        'group flex w-full items-center gap-4 px-4 py-3',
        'hover:bg-secondary focus-visible:bg-secondary',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
        'transition-colors duration-150',
        'cursor-pointer text-left'
      )}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* 日付 */}
      <div
        className={cn(
          'w-12 shrink-0 text-sm font-medium',
          isToday(plan.startDate ?? new Date()) ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {dateLabel}
      </div>

      {/* 時間 */}
      <div className="text-muted-foreground w-24 shrink-0 text-sm">{timeRange}</div>

      {/* タイトル + # */}
      <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
        <span className="text-foreground max-w-48 truncate font-medium group-hover:underline">{plan.title}</span>
        {plan.plan_number && <span className="text-muted-foreground shrink-0 text-sm">#{plan.plan_number}</span>}
      </div>

      {/* タグ */}
      <div
        className="flex w-40 shrink-0 items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {displayTags.length > 0 ? (
          <>
            {displayTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex max-w-20 items-center gap-0.5 truncate rounded border px-1.5 py-0.5 text-xs"
                style={{ borderColor: tag.color, color: tag.color }}
                title={tag.name}
              >
                <span className="truncate">{tag.name}</span>
              </span>
            ))}
            {(plan.tags?.length ?? 0) > 3 && (
              <span className="text-muted-foreground text-xs">+{(plan.tags?.length ?? 0) - 3}</span>
            )}
          </>
        ) : (
          <PlanTagSelectDialogEnhanced
            selectedTagIds={selectedTagIds}
            onTagsChange={handleTagsChange}
            align="end"
            side="bottom"
          >
            <div className="hover:bg-primary/10 flex w-fit cursor-pointer items-center gap-1 rounded py-0.5 text-sm transition-colors">
              <div className="text-muted-foreground flex items-center gap-1">
                <Tag className="size-3" />
                <span>{locale === 'ja' ? 'タグを追加' : 'Add tag'}</span>
              </div>
            </div>
          </PlanTagSelectDialogEnhanced>
        )}
      </div>
    </button>
  )
}
