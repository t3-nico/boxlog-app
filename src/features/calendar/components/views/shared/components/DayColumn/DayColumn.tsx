/**
 * 1日分の列コンポーネント（再利用可能）
 */

'use client'

import React, { memo, useMemo } from 'react'
import { EventBlock } from '../EventBlock'
import { CurrentTimeLineForColumn } from '../../grid/CurrentTimeLine'
import { EmptyState } from '../EmptyState'
import { useEventPosition } from '../../hooks/useEventPosition'
import { filterEventsByDate, sortTimedEvents } from '../../utils/eventPositioning'
import { isToday, isWeekend } from '../../utils/dateHelpers'
import { HOUR_HEIGHT, GRID_BACKGROUND, GRID_BORDER, Z_INDEX } from '../../constants/grid.constants'
import type { DayColumnProps, TimedEvent } from '../../types/view.types'

export const DayColumn = memo<DayColumnProps>(function DayColumn({
  date,
  events,
  hourHeight = HOUR_HEIGHT,
  isToday: isTodayProp,
  isWeekend: isWeekendProp,
  onTimeClick,
  onEventClick,
  onEventDoubleClick,
  onEventContextMenu,
  className = ''
}) {
  // 今日・週末の判定（propsで上書き可能）
  const isTodayActual = isTodayProp ?? isToday(date)
  const isWeekendActual = isWeekendProp ?? isWeekend(date)
  
  // この日のイベントをフィルタリング
  const dayEvents = useMemo(() => {
    const filtered = filterEventsByDate(events, date)
    return sortTimedEvents(filtered)
  }, [events, date])
  
  // イベントの位置を計算
  const eventPositions = useEventPosition(dayEvents, { hourHeight })
  
  // 時間クリックハンドラー
  const handleTimeClick = (e: React.MouseEvent) => {
    if (!onTimeClick) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    
    // 時間を計算（15分単位で丸める）
    const totalMinutes = (y * 60) / hourHeight
    const hour = Math.floor(totalMinutes / 60)
    const minute = Math.floor((totalMinutes % 60) / 15) * 15
    
    onTimeClick(date, hour, minute)
  }
  
  
  // カラムのスタイル
  const columnClasses = [
    'relative flex-1 min-w-0',
    GRID_BACKGROUND,
    GRID_BORDER,
    'border-r last:border-r-0',
    isWeekendActual ? 'bg-gray-50 dark:bg-gray-800/50' : '',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <div className={columnClasses}>
      {/* イベント表示エリア */}
      <div
        className="relative flex-1 cursor-pointer"
        onClick={handleTimeClick}
        style={{
          minHeight: `${24 * hourHeight}px`
        }}
      >
        {/* 現在時刻線（今日のみ） */}
        {isTodayActual && (
          <CurrentTimeLineForColumn
            hourHeight={hourHeight}
            showDot={true}
          />
        )}
        
        {/* イベント */}
        {dayEvents.map((event) => {
          const position = eventPositions.get(event.id)
          if (!position) return null
          
          return (
            <EventBlock
              key={event.id}
              event={event}
              position={position}
              onClick={onEventClick}
              onDoubleClick={onEventDoubleClick}
              onContextMenu={onEventContextMenu}
            />
          )
        })}
        
        {/* 空状態（イベントがない場合） */}
        {dayEvents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <EmptyState
              message=""
              description=""
              icon={
                <div className="text-4xl text-gray-300 dark:text-gray-600">
                  📅
                </div>
              }
              className="p-4"
            />
          </div>
        )}
      </div>
    </div>
  )
})