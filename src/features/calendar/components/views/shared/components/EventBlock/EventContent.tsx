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
  
  // 通常表示：時間 + タイトル + 説明（オプション）
  return (
    <div className="flex flex-col h-full">
      {/* 時間表示 */}
      {showTime && (
        <div className="text-xs opacity-75 leading-tight mb-0.5">
          {formatTimeRange(
            event.start || new Date(), 
            event.end || new Date(startTime + 60 * 60 * 1000), 
            timeFormat
          )}
        </div>
      )}
      
      {/* タイトル */}
      <div className="text-sm font-medium leading-tight mb-1 flex-shrink-0">
        <span className="line-clamp-2">
          {event.title}
        </span>
      </div>
      
      {/* 説明（高さに余裕がある場合のみ） */}
      {event.description && (
        <div className="text-xs opacity-75 leading-tight flex-1 overflow-hidden">
          <span className="line-clamp-2">
            {event.description}
          </span>
        </div>
      )}
    </div>
  )
})