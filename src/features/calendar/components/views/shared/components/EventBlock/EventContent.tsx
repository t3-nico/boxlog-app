/**
 * イベントの中身（タイトル、時間等）のコンポーネント
 */

'use client'

import React, { memo } from 'react'
import { formatTime, formatTimeRange } from '../../utils/dateHelpers'
import type { TimedEvent } from '../../types/event.types'

interface EventContentProps {
  event: TimedEvent
  isCompact?: boolean
  showTime?: boolean
  timeFormat?: '12h' | '24h'
}

export const EventContent = memo<EventContentProps>(function EventContent({
  event,
  isCompact = false,
  showTime = true,
  timeFormat = '24h'
}) {
  // 継続時間を計算（安全なDate処理）
  const startTime = event.start?.getTime ? event.start.getTime() : new Date().getTime()
  const endTime = event.end?.getTime ? event.end.getTime() : new Date(startTime + 60 * 60 * 1000).getTime()
  const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60))
  const isShortEvent = durationMinutes <= 30
  
  if (isCompact || isShortEvent) {
    // コンパクト表示：タイトルのみ
    return (
      <div className="flex items-center h-full">
        <span className="text-xs font-medium truncate leading-tight">
          {event.title}
        </span>
      </div>
    )
  }
  
  // 通常表示：タイトル + 日付 + タグの順番
  return (
    <div className="flex flex-col h-full">
      {/* タイトル */}
      <div className="text-sm font-medium leading-tight mb-1 flex-shrink-0">
        <span className="line-clamp-2">
          {event.title}
        </span>
      </div>
      
      {/* 時間表示（日付） */}
      {showTime && (
        <div className="text-xs opacity-75 leading-tight mb-1">
          {formatTimeRange(
            event.start || new Date(), 
            event.end || new Date(startTime + 60 * 60 * 1000), 
            timeFormat
          )}
        </div>
      )}
      
      {/* タグ表示 */}
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto w-full">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-1.5 py-0.5 text-xs rounded-sm bg-white/30 text-white leading-tight flex-shrink-0"
              style={{ backgroundColor: `${tag.color}40` }}
            >
              {tag.icon && <span className="mr-0.5">{tag.icon}</span>}
              {tag.name}
            </span>
          ))}
          {event.tags.length > 3 && (
            <span className="text-xs opacity-75 px-1">
              +{event.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
})