'use client'

import React from 'react'
import { format, isToday } from 'date-fns'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/shadcn-ui/button'
import { DateDisplay } from '../../shared'
import { AgendaEventItem } from './AgendaEventItem'
import type { AgendaDayGroupProps } from '../AgendaView.types'

/**
 * AgendaDayGroup - 日付ごとのイベントグループ
 * 
 * @description
 * Googleカレンダーのアジェンダビューのような構造：
 * - 日付ヘッダー（スティッキー）
 * - その日のイベントリスト
 * - 空の場合の表示
 */
export function AgendaDayGroup({
  date,
  events,
  isToday: isTodayProp,
  onEventClick,
  onEventContextMenu,
  onCreateEvent,
  className
}: AgendaDayGroupProps) {
  const todayFlag = isTodayProp ?? isToday(date)
  
  return (
    <div 
      className={cn('agenda-day-group', className)}
      data-date={format(date, 'yyyy-MM-dd')}
    >
      {/* 日付ヘッダー（スティッキー） */}
      <div 
        className={cn(
          'sticky top-0 z-10 px-4 py-3 bg-background/95 backdrop-blur-sm',
          todayFlag && 'bg-primary/5'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 統一されたDateDisplayを使用 */}
            <DateDisplay
              date={date}
              showDayName={true}
              showMonthYear={false}
              dayNameFormat="long"
              dateFormat="MMM d"
              isToday={todayFlag}
              isSelected={false}
              className={cn(
                'text-lg font-medium',
                todayFlag ? 'text-primary' : 'text-foreground'
              )}
            />
            {events.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {events.length} events
              </span>
            )}
          </div>
          
          {/* 予定追加ボタン */}
          {onCreateEvent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateEvent(date)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add event</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* イベントリスト */}
      <div className="divide-y divide-neutral-900/20 dark:divide-neutral-100/20">
        {events.length > 0 ? (
          events.map(event => (
            <AgendaEventItem 
              key={event.id} 
              event={event}
              onEventClick={onEventClick}
              onEventContextMenu={onEventContextMenu}
              showDate={false} // 日付グループ内では日付は表示しない
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <div className="text-muted-foreground text-sm">
              No events
            </div>
            {onCreateEvent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateEvent(date)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}