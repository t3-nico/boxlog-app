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
  previewTime?: { start: Date; end: Date } | null // ドラッグ中のプレビュー時間
}

export const EventContent = memo<EventContentProps>(function EventContent({
  event,
  isCompact = false,
  showTime = true,
  timeFormat = '24h',
  previewTime = null
}) {
  // デバッグ用ログ削除
  
  // イベントの開始・終了時刻をDateオブジェクトに変換（startDateとendDateフィールドも考慮）
  const eventStart = event.start instanceof Date ? event.start : 
                     (event.start ? new Date(event.start) : 
                     ((event as any).startDate instanceof Date ? (event as any).startDate : 
                     ((event as any).startDate ? new Date((event as any).startDate) : null)))
                     
  const eventEnd = event.end instanceof Date ? event.end : 
                   (event.end ? new Date(event.end) : 
                   ((event as any).endDate instanceof Date ? (event as any).endDate : 
                   ((event as any).endDate ? new Date((event as any).endDate) : null)))
  
  // 継続時間を計算（安全なDate処理）
  const startTime = eventStart?.getTime() || new Date().getTime()
  const endTime = eventEnd?.getTime() || new Date(startTime + 60 * 60 * 1000).getTime()
  const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60))
  const isShortEvent = durationMinutes <= 30
  
  if (isCompact) {
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
    <div className="flex flex-col h-full relative">
      {/* タイトル */}
      <div className="text-sm font-medium leading-tight mb-1 flex-shrink-0">
        <span className="line-clamp-2">
          {event.title}
        </span>
      </div>
      
      {/* 時間表示（日付） */}
      {showTime && (
        <div className="event-time text-xs leading-tight mb-1 opacity-75">
          {previewTime ? (
            formatTimeRange(previewTime.start, previewTime.end, timeFormat)
          ) : (
            eventStart && eventEnd ? formatTimeRange(
              eventStart, 
              eventEnd, 
              timeFormat
            ) : '時間未設定'
          )}
        </div>
      )}
      
      {/* 時間の長さを視覚化するストレッチ領域 */}
      <div className="flex-1 min-h-0 flex items-end justify-between">
        {/* タグ表示 */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 w-full">
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
        
        {/* 時間の長さを示す視覚的インジケーター */}
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-30">
          <div className="w-1 bg-current rounded-full" style={{ height: 'calc(100% - 16px)' }} />
        </div>
      </div>
    </div>
  )
})