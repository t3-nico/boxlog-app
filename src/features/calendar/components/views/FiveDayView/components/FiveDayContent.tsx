// @ts-nocheck
// TODO(#389): 型エラーを修正後、@ts-nocheckを削除
'use client'

import React, { useCallback } from 'react'

import { cn } from '@/lib/utils'

import {
  calculateEventGhostStyle,
  calculatePreviewTime,
  CalendarDragSelection,
  type DateTimeSelection,
  EventBlock,
  useGlobalDragCursor,
  useTimeCalculation,
} from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop'

interface FiveDayContentProps {
  date: Date
  events: CalendarPlan[]
  eventStyles: Record<string, React.CSSProperties>
  onPlanClick?: (plan: CalendarPlan) => void
  onPlanContextMenu?: (plan: CalendarPlan, e: React.MouseEvent) => void
  onEmptyClick?: (date: Date, timeString: string) => void
  onPlanUpdate?: (planId: string, updates: Partial<CalendarPlan>) => void
  onTimeRangeSelect?: (selection: DateTimeSelection) => void
  className?: string
  dayIndex: number // 5日間内での日付インデックス（0-4）
  displayDates?: Date[] // 5日間の全日付配列（日付間移動用）
}

export const FiveDayContent = ({
  date,
  events,
  eventStyles,
  onPlanClick,
  onPlanContextMenu,
  onEmptyClick,
  onPlanUpdate,
  onTimeRangeSelect,
  className,
  dayIndex,
  displayDates,
}: FiveDayContentProps) => {
  // ドラッグ&ドロップ機能用にonPlanUpdateを変換
  const handlePlanUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onPlanUpdate) return

      console.log('🔧 FiveDayContent: プラン更新要求:', {
        planId,
        startTime: updates.startTime.toISOString(),
        endTime: updates.endTime.toISOString(),
      })

      // handleUpdatePlan形式で呼び出し
      await onPlanUpdate(planId, {
        startTime: updates.startTime,
        endTime: updates.endTime,
      })
    },
    [onPlanUpdate]
  )

  // ドラッグ&ドロップ機能（日付間移動対応）
  const { dragState, handlers } = useDragAndDrop({
    onEventUpdate: handlePlanUpdate,
    onEventClick: onPlanClick,
    date,
    events,
    displayDates,
    viewMode: '5day',
  })

  // 時間計算機能
  const { calculateTimeFromEvent } = useTimeCalculation()

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers)

  // 空白クリックハンドラー
  const handleEmptyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onEmptyClick) return

      const { timeString } = calculateTimeFromEvent(e)
      onEmptyClick(date, timeString)
    },
    [date, onEmptyClick, calculateTimeFromEvent]
  )

  // プランクリックハンドラー（ドラッグ・リサイズ中のクリックは無視）
  const handlePlanClick = useCallback(
    (plan: CalendarPlan) => {
      // ドラッグ・リサイズ操作中のクリックは無視
      if (dragState.isDragging || dragState.isResizing) {
        return
      }

      onPlanClick?.(plan)
    },
    [onPlanClick, dragState.isDragging, dragState.isResizing]
  )

  // プラン右クリックハンドラー
  const handlePlanContextMenu = useCallback(
    (plan: CalendarPlan, mouseEvent: React.MouseEvent) => {
      // ドラッグ操作中またはリサイズ操作中は右クリックを無視
      if (dragState.isDragging || dragState.isResizing) {
        return
      }
      onPlanContextMenu?.(plan, mouseEvent)
    },
    [onPlanContextMenu, dragState.isDragging, dragState.isResizing]
  )

  // 時間グリッドの生成（DayViewと同じパターン）
  const timeGrid = Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      className={`relative ${hour < 23 ? 'border-b border-neutral-900/20 dark:border-neutral-100/20' : ''}`}
      style={{ height: HOUR_HEIGHT }}
    />
  ))

  return (
    <div className={cn('bg-background relative h-full flex-1 overflow-hidden', className)} data-calendar-grid>
      {/* CalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing}
      >
        {/* 背景グリッド（DayViewと同じパターン） */}
        <div className="absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
          {timeGrid}
        </div>
      </CalendarDragSelection>

      {/* プラン表示エリア */}
      <div className="pointer-events-none absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
        {events.map((plan) => {
          const style = eventStyles[plan.id]
          if (!style) return null

          const isDragging = dragState.draggedEventId === plan.id && dragState.isDragging
          const isResizingThis = dragState.isResizing && dragState.draggedEventId === plan.id
          const currentTop = parseFloat(style.top?.toString() || '0')
          const currentHeight = parseFloat(style.height?.toString() || '20')

          // ゴースト表示スタイル（共通化）
          const adjustedStyle = calculateEventGhostStyle(style, plan.id, dragState)

          return (
            <div key={plan.id} style={adjustedStyle} className="pointer-events-none absolute" data-event-block="true">
              {/* EventBlockの内容部分のみクリック可能 */}
              <div
                className="pointer-events-auto absolute inset-0 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
                role="button"
                tabIndex={0}
                aria-label={`Drag plan: ${plan.title}`}
                onMouseDown={(e) => {
                  // 左クリックのみドラッグ開始
                  if (e.button === 0) {
                    handlers.handleMouseDown(
                      plan.id,
                      e,
                      {
                        top: currentTop,
                        left: 0,
                        width: 100,
                        height: currentHeight,
                      },
                      dayIndex
                    ) // 日付インデックスを渡す
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // キーボードでドラッグ操作を開始する代替手段
                  }
                }}
              >
                <EventBlock
                  event={plan}
                  position={{
                    top: 0,
                    left: 0,
                    width: 100,
                    height:
                      isResizingThis && dragState.snappedPosition ? dragState.snappedPosition.height : currentHeight,
                  }}
                  // クリックは useDragAndDrop で処理されるため削除
                  onContextMenu={(plan, e) => handlePlanContextMenu(plan, e)}
                  onResizeStart={(plan, direction, e, _position) =>
                    handlers.handleResizeStart(plan.id, direction, e, {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight,
                    })
                  }
                  isDragging={isDragging}
                  isResizing={isResizingThis}
                  previewTime={calculatePreviewTime(plan.id, dragState)}
                  className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
