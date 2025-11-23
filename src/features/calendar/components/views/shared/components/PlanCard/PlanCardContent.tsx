// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
/**
 * プランカードの中身（タイトル、時間等）のコンポーネント
 */

'use client'

import { Bell, Repeat } from 'lucide-react'
import { memo } from 'react'

import { useI18n } from '@/features/i18n/lib/hooks'

import type { Calendarplan } from '../../types/event.types'
import { formatTimeRange } from '../../utils/dateHelpers'

interface PlanCardContentProps {
  event: Calendarplan
  isCompact?: boolean
  showTime?: boolean
  timeFormat?: '12h' | '24h'
  previewTime?: { start: Date; end: Date } | null // ドラッグ中のプレビュー時間
}

// Helper function: Parse plan start date
function parseplanStartDate(event: Calendarplan | Record<string, unknown>): Date | null {
  if (event.start instanceof Date) return event.start
  if (event.start) return new Date(event.start)
  if (event.startDate instanceof Date) return event.startDate
  if (event.startDate) return new Date(event.startDate)
  return null
}

// Helper function: Parse plan end date
function parseplanEndDate(event: Calendarplan | Record<string, unknown>): Date | null {
  if (event.end instanceof Date) return event.end
  if (event.end) return new Date(event.end)
  if (event.endDate instanceof Date) return event.endDate
  if (event.endDate) return new Date(event.endDate)
  return null
}

// Helper function: Calculate plan duration
function calculateplanDuration(planStart: Date | null, planEnd: Date | null): number {
  const startTime = planStart?.getTime() || new Date().getTime()
  const endTime = planEnd?.getTime() || new Date(startTime + 60 * 60 * 1000).getTime()
  return Math.floor((endTime - startTime) / (1000 * 60))
}

export const PlanCardContent = memo<PlanCardContentProps>(function PlanCardContent({
  event,
  isCompact = false,
  showTime = true,
  timeFormat = '24h',
  previewTime = null,
}) {
  const { t } = useI18n()

  // プランの開始・終了時刻をDateオブジェクトに変換
  const planStart = parseplanStartDate(event)
  const planEnd = parseplanEndDate(event)

  // 継続時間を計算

  if (isCompact) {
    // コンパクト表示：タイトル #番号
    return (
      <div className="flex h-full items-center gap-1">
        <span className="text-foreground truncate text-xs leading-tight font-medium">{event.title}</span>
        {event.plan_number && (
          <span className="flex-shrink-0 text-xs leading-tight opacity-75">#{event.plan_number}</span>
        )}
      </div>
    )
  }

  // 通常表示：タイトル #番号 + 時間 + アイコン + タグの順番（優先度順）
  return (
    <div className="relative flex h-full flex-col gap-0.5 overflow-hidden">
      {/* タイトル（最優先） */}
      <div className="flex flex-shrink-0 items-baseline gap-1 text-sm leading-tight font-medium">
        <span className={`${isCompact ? 'line-clamp-1' : 'line-clamp-2'} text-foreground`}>{event.title}</span>
        {event.plan_number && (
          <span className="flex-shrink-0 text-sm leading-tight opacity-75">#{event.plan_number}</span>
        )}
      </div>

      {/* 時間表示 + アイコン（第2優先） */}
      {showTime != null && (
        <div className="event-time pointer-events-none flex flex-shrink-0 items-center gap-1 text-xs leading-tight opacity-75">
          <span>
            {previewTime
              ? formatTimeRange(previewTime.start, previewTime.end, timeFormat)
              : planStart && planEnd
                ? formatTimeRange(planStart, planEnd, timeFormat)
                : t('calendar.event.noTimeSet')}
          </span>
          {/* 繰り返しアイコン */}
          {event.isRecurring && <Repeat className="h-3 w-3 flex-shrink-0 opacity-75" />}
          {/* 通知アイコン（reminder_minutesが設定されている場合） */}
          {event.reminder_minutes != null && <Bell className="h-3 w-3 flex-shrink-0 opacity-75" />}
        </div>
      )}

      {/* タグ表示（残りスペースがあれば表示） */}
      {event.tags && event.tags.length > 0 ? (
        <div className="flex min-h-0 flex-shrink flex-wrap gap-1 overflow-hidden pt-1">
          {event.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm border px-1.5 py-0.5 text-xs leading-tight"
              style={{
                borderColor: tag.color,
              }}
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
          {event.tags.length > 2 && (
            <span className="inline-flex items-center px-1 text-xs opacity-75">+{event.tags.length - 2}</span>
          )}
        </div>
      ) : null}
    </div>
  )
})
