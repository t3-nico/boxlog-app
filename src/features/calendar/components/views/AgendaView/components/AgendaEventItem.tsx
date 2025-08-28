'use client'

import React from 'react'
import { format } from 'date-fns'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTimeCalculation } from '../../shared/hooks/useTimeCalculation'
import type { AgendaEventItemProps } from '../AgendaView.types'

/**
 * AgendaEventItem - イベント1つの行表示
 * 
 * @description
 * イベントの詳細が見やすいリスト形式：
 * - 時間範囲
 * - イベントタイトル
 * - 場所（あれば）
 * - 説明（あれば、truncated）
 */
export function AgendaEventItem({
  event,
  onEventClick,
  onEventContextMenu,
  onEventUpdate,
  onEventDelete,
  compact = false,
  showDate = false,
  className
}: AgendaEventItemProps) {
  // 共通の時間計算機能を使用
  const { formatTimeRange, isAllDayEvent } = useTimeCalculation()
  
  // 時間範囲の表示テキストを生成（共通化）
  const timeRange = React.useMemo(() => {
    if (!event.startDate) return 'No time set'
    
    const start = event.startDate instanceof Date 
      ? event.startDate 
      : new Date(event.startDate)
    
    if (isNaN(start.getTime())) return 'No time set'
    
    // 共通の判定を使用
    if (isAllDayEvent(start, event.endDate)) {
      return 'All day'
    }
    
    // 共通のフォーマット機能を使用
    return formatTimeRange(start, event.endDate)
  }, [event.startDate, event.endDate, formatTimeRange, isAllDayEvent])
  
  // イベントの色を取得
  const eventColor = event.color || '#3b82f6'
  
  // クリックハンドラー
  const handleClick = () => {
    onEventClick?.(event)
  }
  
  // 右クリックハンドラー
  const handleContextMenu = (e: React.MouseEvent) => {
    if (onEventContextMenu) {
      onEventContextMenu(event, e)
    }
  }
  
  return (
    <div 
      className={cn(
        'agenda-event-item p-4 hover:bg-muted/50 cursor-pointer transition-colors',
        'border-l-4',
        compact && 'py-2',
        className
      )}
      style={{ borderLeftColor: eventColor }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="flex gap-4">
        {/* 時間表示 */}
        <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-mono">{timeRange}</span>
          </div>
        </div>
        
        {/* イベント詳細 */}
        <div className="flex-1 min-w-0">
          {/* タイトル */}
          <div className="font-medium text-foreground mb-1 truncate">
            {event.title || 'Untitled Event'}
          </div>
          
          {/* 日付（showDateがtrueの場合のみ） */}
          {showDate && event.startDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(
                  event.startDate instanceof Date ? event.startDate : new Date(event.startDate),
                  'MMM d (E)'
                )}
              </span>
            </div>
          )}
          
          {/* 場所 */}
          {event.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          {/* 説明（compactでない場合のみ） */}
          {!compact && event.description && (
            <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {event.description}
            </div>
          )}
          
          {/* マルチデイイベントのインジケーター */}
          {event.isMultiDay && (
            <div className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded mt-2">
              <Calendar className="h-3 w-3" />
              <span>複数日</span>
            </div>
          )}
        </div>
        
        {/* 右側の追加情報 */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {/* イベントの状態表示（必要に応じて） */}
          {event.isRecurring && (
            <div className="text-xs text-muted-foreground">
              繰り返し
            </div>
          )}
          
          {/* 色インジケーター */}
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: eventColor }}
            title={`イベント色: ${eventColor}`}
          />
        </div>
      </div>
    </div>
  )
}