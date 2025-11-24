// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * 1日分の列コンポーネント（再利用可能）
 */

'use client'

import React, { memo, useMemo } from 'react'

import { GRID_BACKGROUND, HOUR_HEIGHT } from '../../constants/grid.constants'
import { usePlanPosition } from '../../hooks/usePlanPosition'
import type { DayColumnProps } from '../../types/view.types'
import { isWeekend } from '../../utils/dateHelpers'
import { filterEventsByDate, sortTimedEvents } from '../../utils/planPositioning'
import { EmptyState } from '../EmptyState'
import { PlanCard } from '../PlanCard/PlanCard'

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
  className = '',
}) {
  // 今日・週末の判定（propsで上書き可能）
  const isWeekendActual = isWeekendProp ?? isWeekend(date)

  // この日のイベントをフィルタリング
  const dayEvents = useMemo(() => {
    const filtered = filterEventsByDate(events, date)
    return sortTimedEvents(filtered)
  }, [events, date])

  // プランの位置を計算
  const eventPositions = usePlanPosition(dayEvents, { hourHeight })

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
    'border-r border-neutral-900/20 dark:border-neutral-100/20 last:border-r-0',
    isWeekendActual ? 'bg-gray-50 dark:bg-gray-800/50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={columnClasses}>
      {/* イベント表示エリア */}
      <div
        role="button"
        tabIndex={0}
        className="relative flex-1 cursor-pointer"
        onClick={handleTimeClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleTimeClick(e as unknown as React.MouseEvent<Element, MouseEvent>)
          }
        }}
        style={{
          minHeight: `${24 * hourHeight}px`,
        }}
        aria-label={`Day column for ${date.toDateString()}`}
      >
        {/* 現在時刻線はScrollableCalendarLayoutで統一表示 */}

        {/* イベント */}
        {dayEvents.map((event) => {
          const position = eventPositions.get(event.id)
          // positionが見つからない場合は、デフォルト位置を使用してレンダリング

          return (
            <PlanCard
              key={event.id}
              event={event}
              position={position} // undefinedでも大丈夫（PlanCard側で対応済み）
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
              icon={<div className="text-4xl text-gray-300 dark:text-gray-600">📅</div>}
              className="p-4"
            />
          </div>
        )}
      </div>
    </div>
  )
})
