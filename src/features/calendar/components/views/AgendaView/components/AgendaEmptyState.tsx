'use client'

import React from 'react'
import { format } from 'date-fns'
import { Calendar, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/shadcn-ui/button'
import type { AgendaEmptyStateProps } from '../AgendaView.types'

/**
 * AgendaEmptyState - イベントなし表示
 * 
 * @description
 * 指定期間にイベントがない場合の表示：
 * - 期間の説明
 * - イベント作成の促進
 * - 視覚的なアイコン
 */
export function AgendaEmptyState({
  startDate,
  endDate,
  onCreateEvent,
  className
}: AgendaEmptyStateProps) {
  
  // 期間の表示テキストを生成
  const periodText = React.useMemo(() => {
    const start = format(startDate, 'MMM d')
    const end = format(endDate, 'MMM d')
    
    // 同じ日の場合
    if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return start
    }
    
    return `${start} - ${end}`
  }, [startDate, endDate])
  
  // 今日の日付で新しいイベントを作成
  const handleCreateToday = () => {
    const today = new Date()
    onCreateEvent?.(today)
  }
  
  // 開始日で新しいイベントを作成
  const handleCreateStartDate = () => {
    onCreateEvent?.(startDate)
  }
  
  return (
    <div className={cn(
      'agenda-empty-state flex flex-col items-center justify-center',
      'py-16 px-8 text-center',
      className
    )}>
      {/* アイコン */}
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-muted-foreground" />
      </div>
      
      {/* メッセージ */}
      <h3 className="text-lg font-medium text-foreground mb-2">
        No events
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        No events are scheduled for {periodText}.
        Add new events to manage your schedule.
      </p>
      
      {/* アクションボタン */}
      {onCreateEvent && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCreateToday}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Today's Event
          </Button>
          
          {/* 開始日が今日でない場合は、開始日での作成ボタンも表示 */}
          {format(startDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
            <Button
              variant="outline"
              onClick={handleCreateStartDate}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event on {format(startDate, 'M/d')}
            </Button>
          )}
        </div>
      )}
      
      {/* 追加のヒント */}
      <div className="mt-8 text-xs text-muted-foreground max-w-sm">
        <p>
          💡 Tip: You can also add events by clicking on empty time slots in the calendar
        </p>
      </div>
    </div>
  )
}