// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
/**
 * イベントの中身（タイトル、時間等）のコンポーネント
 */

'use client'

import { memo } from 'react'

import { useI18n } from '@/features/i18n/lib/hooks'

import type { TimedEvent } from '../../types/event.types'
import { formatTimeRange } from '../../utils/dateHelpers'

interface EventContentProps {
  event: TimedEvent
  isCompact?: boolean
  showTime?: boolean
  timeFormat?: '12h' | '24h'
  previewTime?: { start: Date; end: Date } | null // ドラッグ中のプレビュー時間
}

// Helper function: Parse event start date
function parseEventStartDate(event: TimedEvent | Record<string, unknown>): Date | null {
  if (event.start instanceof Date) return event.start
  if (event.start) return new Date(event.start)
  if (event.startDate instanceof Date) return event.startDate
  if (event.startDate) return new Date(event.startDate)
  return null
}

// Helper function: Parse event end date
function parseEventEndDate(event: TimedEvent | Record<string, unknown>): Date | null {
  if (event.end instanceof Date) return event.end
  if (event.end) return new Date(event.end)
  if (event.endDate instanceof Date) return event.endDate
  if (event.endDate) return new Date(event.endDate)
  return null
}

// Helper function: Calculate event duration
function calculateEventDuration(eventStart: Date | null, eventEnd: Date | null): number {
  const startTime = eventStart?.getTime() || new Date().getTime()
  const endTime = eventEnd?.getTime() || new Date(startTime + 60 * 60 * 1000).getTime()
  return Math.floor((endTime - startTime) / (1000 * 60))
}

export const EventContent = memo<EventContentProps>(function EventContent({
  event,
  isCompact = false,
  showTime = true,
  timeFormat = '24h',
  previewTime = null,
}) {
  const { t } = useI18n()

  // イベントの開始・終了時刻をDateオブジェクトに変換
  const eventStart = parseEventStartDate(event)
  const eventEnd = parseEventEndDate(event)

  // 継続時間を計算

  if (isCompact) {
    // コンパクト表示：タイトルのみ
    return (
      <div className="flex h-full items-center">
        <span className="truncate text-xs leading-tight font-medium">{event.title}</span>
      </div>
    )
  }

  // 通常表示：タイトル + 日付 + タグの順番
  return (
    <div className="relative flex h-full flex-col">
      {/* タイトル */}
      <div className="mb-1 flex-shrink-0 text-sm leading-tight font-medium">
        <span className="line-clamp-2">{event.title}</span>
      </div>

      {/* 時間表示（日付） */}
      {showTime != null && (
        <div className="event-time mb-1 text-sm leading-tight opacity-75">
          {previewTime
            ? formatTimeRange(previewTime.start, previewTime.end, timeFormat)
            : eventStart && eventEnd
              ? formatTimeRange(eventStart, eventEnd, timeFormat)
              : t('calendar.event.noTimeSet')}
        </div>
      )}

      {/* 時間の長さを視覚化するストレッチ領域 */}
      <div className="flex min-h-0 flex-1 items-end justify-between">
        {/* タグ表示 */}
        {event.tags && event.tags.length > 0 ? (
          <div className="flex w-full flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex flex-shrink-0 items-center rounded-sm bg-white/30 px-1.5 py-0.5 text-xs leading-tight text-white"
                style={{ backgroundColor: `${tag.color}40` }}
              >
                {tag.icon ? <span className="mr-0.5">{tag.icon}</span> : null}
                {tag.name}
              </span>
            ))}
            {event.tags.length > 3 && <span className="px-1 text-xs opacity-75">+{event.tags.length - 3}</span>}
          </div>
        ) : null}

        {/* 時間の長さを示す視覚的インジケーター */}
        <div className="absolute top-1/2 right-1 -translate-y-1/2 transform opacity-30">
          <div className="w-1 rounded-full bg-current" style={{ height: 'calc(100% - 16px)' }} />
        </div>
      </div>
    </div>
  )
})
