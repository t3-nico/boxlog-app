'use client'

import React, { useCallback } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { cn } from '@/lib/utils'

import {
  calculatePlanGhostStyle,
  calculatePreviewTime,
  CalendarDragSelection,
  PlanBlock,
  useGlobalDragCursor,
  usePlanStyles,
  useTimeCalculation,
} from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop'

interface TwoWeekContentProps {
  date: Date
  plans: CalendarPlan[]
  onPlanClick?: (plan: CalendarPlan) => void
  onPlanContextMenu?: (plan: CalendarPlan, e: React.MouseEvent) => void
  onEmptyClick?: (date: Date, timeString: string) => void
  onPlanUpdate?: (planId: string, updates: Partial<CalendarPlan>) => void
  onTimeRangeSelect?: (date: Date, startTime: string, endTime: string) => void
  onCreatePlan?: (startDate: Date, endDate: Date) => void
  className?: string
  dayIndex: number // 2週間内での日付インデックス（0-13）
  displayDates?: Date[] // 2週間の全日付配列（日付間移動用）
}

export const TwoWeekContent = ({
  date,
  plans,
  onPlanClick,
  onPlanContextMenu,
  onEmptyClick,
  onPlanUpdate,
  onTimeRangeSelect: _onTimeRangeSelect,
  onCreatePlan,
  className,
  dayIndex,
  displayDates,
}: TwoWeekContentProps) => {
  // ドラッグ&ドロップ機能用にonPlanUpdateを変換
  const handlePlanUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onPlanUpdate) return

      console.log('🔧 TwoWeekContent: プラン更新要求:', {
        planId,
        startTime: updates.startTime.toISOString(),
        endTime: updates.endTime.toISOString(),
      })

      // handleUpdatePlan形式で呼び出し
      await onPlanUpdate(planId, {
        startDate: updates.startTime,
        endDate: updates.endTime,
      })
    },
    [onPlanUpdate]
  )

  // ドラッグ&ドロップ機能（日付間移動対応）
  const { dragState, handlers } = useDragAndDrop({
    onPlanUpdate: handlePlanUpdate,
    onPlanClick,
    date,
    events: plans,
    displayDates,
    viewMode: '2week',
  })

  // 時間計算機能
  const { calculateTimeFromEvent } = useTimeCalculation()

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers)

  // この日のプラン位置を統一方式で変換
  const dayPlanPositions = React.useMemo(() => {
    // 渡されたplansは既にdisplayDatesでフィルタリング済みのため、直接変換
    return plans.map((plan) => {
      // startDate/endDateを使用した統一的なプラン位置計算
      const startDate = plan.startDate || new Date()
      const startHour = startDate.getHours()
      const startMinute = startDate.getMinutes()
      const top = (startHour + startMinute / 60) * HOUR_HEIGHT

      // 高さ計算（統一）
      let height = HOUR_HEIGHT // デフォルト1時間
      if (plan.endDate) {
        const endHour = plan.endDate.getHours()
        const endMinute = plan.endDate.getMinutes()
        const duration = endHour + endMinute / 60 - (startHour + startMinute / 60)
        height = Math.max(20, duration * HOUR_HEIGHT) // 最小20px
      }

      return {
        plan,
        top,
        height,
        left: 2, // 列内での位置（px）
        width: 96, // 列幅の96%使用
        zIndex: 20,
        column: 0,
        totalColumns: 1,
        opacity: 1.0,
      }
    })
  }, [plans])

  const planStyles = usePlanStyles(dayPlanPositions)

  // 空白クリックハンドラー
  const handleEmptyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onEmptyClick) return

      const { timeString } = calculateTimeFromEvent(e)
      onEmptyClick(date, timeString)
    },
    [date, onEmptyClick, calculateTimeFromEvent]
  )

  // プランクリックハンドラー（ドラッグ・リサイズ後のクリックは無視）
  const handlePlanClick = useCallback(
    (plan: CalendarPlan) => {
      // ドラッグ・リサイズ操作中またはドラッグ・リサイズ直後のクリックは無視
      if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
        return
      }

      onPlanClick?.(plan)
    },
    [onPlanClick, dragState.isDragging, dragState.isResizing, dragState.recentlyDragged]
  )

  // プラン右クリックハンドラー
  const handlePlanContextMenu = useCallback(
    (plan: CalendarPlan, mouseEvent: React.MouseEvent) => {
      // ドラッグ操作中またはリサイズ操作中は右クリックを無視
      if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
        return
      }
      onPlanContextMenu?.(plan, mouseEvent)
    },
    [onPlanContextMenu, dragState.isDragging, dragState.isResizing, dragState.recentlyDragged]
  )

  return (
    <div className={cn('bg-background relative h-full flex-1 overflow-hidden', className)} data-calendar-grid>
      {/* CalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0 z-10"
        onTimeRangeSelect={(selection) => {
          // 時間範囲選択時の処理
          const startTime = `${String(selection.startHour).padStart(2, '0')}:${String(selection.startMinute).padStart(2, '0')}`
          const endTime = `${String(selection.endHour).padStart(2, '0')}:${String(selection.endMinute).padStart(2, '0')}`

          if (_onTimeRangeSelect) {
            _onTimeRangeSelect(date, startTime, endTime)
          }

          const startDate = new Date(date)
          startDate.setHours(selection.startHour, selection.startMinute, 0, 0)

          const endDate = new Date(date)
          endDate.setHours(selection.endHour, selection.endMinute, 0, 0)

          onCreatePlan?.(startDate, endDate)
        }}
        onSingleClick={onEmptyClick}
        disabled={
          dragState.isDragging || dragState.isResizing || dragState.recentlyDragged || dragState.recentlyResized
        }
      >
        {/* 背景グリッドはHourLinesがレンダリング済み */}
        <div className="absolute inset-0 cursor-cell" style={{ height: 24 * HOUR_HEIGHT }} />
      </CalendarDragSelection>

      {/* プラン表示エリア */}
      <div className="pointer-events-none absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
        {plans.map((plan) => {
          const style = planStyles[plan.id]
          if (!style) return null

          const isDragging = dragState.draggedEventId === plan.id && dragState.isDragging
          const isResizingThis = dragState.isResizing && dragState.draggedEventId === plan.id
          const currentTop = parseFloat(style.top?.toString() || '0')
          const currentHeight = parseFloat(style.height?.toString() || '20')

          // ゴースト表示スタイル（共通化）
          const adjustedStyle = calculatePlanGhostStyle(style, plan.id, dragState)

          return (
            <div key={plan.id} style={adjustedStyle} className="pointer-events-none absolute" data-plan-block="true">
              {/* PlanBlockの内容部分のみクリック可能 */}
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
                <PlanBlock
                  plan={plan}
                  position={{
                    top: 0,
                    left: 0,
                    width: 100,
                    height:
                      isResizingThis && dragState.snappedPosition
                        ? dragState.snappedPosition.height ?? currentHeight
                        : currentHeight,
                  }}
                  // クリックは useDragAndDrop で処理されるため削除
                  onContextMenu={(plan: CalendarPlan, e: React.MouseEvent) => handlePlanContextMenu(plan, e)}
                  onResizeStart={(
                    plan: CalendarPlan,
                    direction: 'top' | 'bottom',
                    e: React.MouseEvent,
                    _position: { top: number; left: number; width: number; height: number }
                  ) =>
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
