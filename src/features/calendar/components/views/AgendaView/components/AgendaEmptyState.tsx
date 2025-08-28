'use client'

import React from 'react'
import { format } from 'date-fns'
import { Calendar, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/shadcn-ui/button'
import { EmptyState } from '../../shared'
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
    <EmptyState
      icon={Calendar}
      title="No events"
      description={`No events are scheduled for ${periodText}. Add new events to manage your schedule.`}
      className={className}
      actions={onCreateEvent ? (
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
      ) : undefined}
      hint="💡 Tip: You can also add events by clicking on empty time slots in the calendar"
    />
  )
}