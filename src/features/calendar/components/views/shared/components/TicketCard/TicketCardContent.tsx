// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
/**
 * チケットカードの中身（タイトル、時間等）のコンポーネント
 */

'use client'

import { memo } from 'react'

import { useI18n } from '@/features/i18n/lib/hooks'

import type { CalendarTicket } from '../../types/event.types'
import { formatTimeRange } from '../../utils/dateHelpers'

interface TicketCardContentProps {
  event: CalendarTicket
  isCompact?: boolean
  showTime?: boolean
  timeFormat?: '12h' | '24h'
  previewTime?: { start: Date; end: Date } | null // ドラッグ中のプレビュー時間
}

// Helper function: Parse ticket start date
function parseTicketStartDate(event: CalendarTicket | Record<string, unknown>): Date | null {
  if (event.start instanceof Date) return event.start
  if (event.start) return new Date(event.start)
  if (event.startDate instanceof Date) return event.startDate
  if (event.startDate) return new Date(event.startDate)
  return null
}

// Helper function: Parse ticket end date
function parseTicketEndDate(event: CalendarTicket | Record<string, unknown>): Date | null {
  if (event.end instanceof Date) return event.end
  if (event.end) return new Date(event.end)
  if (event.endDate instanceof Date) return event.endDate
  if (event.endDate) return new Date(event.endDate)
  return null
}

// Helper function: Calculate ticket duration
function calculateTicketDuration(ticketStart: Date | null, ticketEnd: Date | null): number {
  const startTime = ticketStart?.getTime() || new Date().getTime()
  const endTime = ticketEnd?.getTime() || new Date(startTime + 60 * 60 * 1000).getTime()
  return Math.floor((endTime - startTime) / (1000 * 60))
}

export const TicketCardContent = memo<TicketCardContentProps>(function TicketCardContent({
  event,
  isCompact = false,
  showTime = true,
  timeFormat = '24h',
  previewTime = null,
}) {
  const { t } = useI18n()

  // チケットの開始・終了時刻をDateオブジェクトに変換
  const ticketStart = parseTicketStartDate(event)
  const ticketEnd = parseTicketEndDate(event)

  // 継続時間を計算

  if (isCompact) {
    // コンパクト表示：タイトルのみ
    return (
      <div className="flex h-full items-center">
        <span className="truncate text-xs leading-tight font-medium">{event.title}</span>
      </div>
    )
  }

  // 通常表示：タイトル + 時間 + タグの順番（優先度順）
  return (
    <div className="relative flex h-full flex-col gap-0.5 overflow-hidden">
      {/* タイトル（最優先） */}
      <div className="flex-shrink-0 text-sm leading-tight font-medium">
        <span className={isCompact ? 'line-clamp-1' : 'line-clamp-2'}>{event.title}</span>
      </div>

      {/* 時間表示（第2優先） */}
      {showTime != null && (
        <div className="ticket-time pointer-events-none flex-shrink-0 text-xs leading-tight opacity-75">
          {previewTime
            ? formatTimeRange(previewTime.start, previewTime.end, timeFormat)
            : ticketStart && ticketEnd
              ? formatTimeRange(ticketStart, ticketEnd, timeFormat)
              : t('calendar.event.noTimeSet')}
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
