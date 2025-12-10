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
} from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop'
import type { WeekPlanPosition } from '../WeekView.types'

interface WeekContentProps {
  date: Date
  plans: CalendarPlan[]
  planPositions: WeekPlanPosition[]
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined
  onPlanContextMenu?: ((plan: CalendarPlan, e: React.MouseEvent) => void) | undefined
  onEmptyClick?: ((date: Date, timeString: string) => void) | undefined
  onPlanUpdate?: ((planId: string, updates: Partial<CalendarPlan>) => void) | undefined
  onTimeRangeSelect?: ((selection: import('../../shared').DateTimeSelection) => void) | undefined
  className?: string | undefined
  dayIndex: number // 週内での日付インデックス（0-6）
  displayDates?: Date[] | undefined // 週の全日付配列（日付間移動用）
  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined
}

export const WeekContent = ({
  date,
  plans,
  planPositions,
  onPlanClick,
  onPlanContextMenu,
  onEmptyClick,
  onPlanUpdate,
  onTimeRangeSelect,
  className,
  dayIndex,
  displayDates,
  disabledPlanId,
}: WeekContentProps) => {
  // ドラッグ&ドロップ機能用にonPlanUpdateを変換
  const handlePlanUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onPlanUpdate) return

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
    viewMode: 'week',
    disabledPlanId,
  })

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers)

  // この日のプラン位置を統一方式で変換
  const dayPlanPositions = React.useMemo(() => {
    // planPositionsから該当dayIndexのプランを抽出（統一フィルタリング済み）
    return planPositions
      .filter((pos) => pos.dayIndex === dayIndex)
      .map((pos) => ({
        plan: pos.plan,
        top: pos.top,
        height: pos.height,
        left: 2, // 列内での位置（px）
        width: 96, // 列幅の96%使用
        zIndex: pos.zIndex,
        column: pos.column,
        totalColumns: pos.totalColumns,
        opacity: 1.0,
      }))
  }, [planPositions, dayIndex])

  const planStyles = usePlanStyles(dayPlanPositions)

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
      className={`relative ${hour < 23 ? 'border-border border-b' : ''}`}
      style={{ height: HOUR_HEIGHT }}
    />
  ))

  return (
    <div
      className={cn(
        'bg-background relative h-full flex-1',
        dragState.isDragging ? 'overflow-visible' : 'overflow-hidden',
        className
      )}
      data-calendar-grid
    >
      {/* CalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0 z-10"
        onTimeRangeSelect={(selection) => {
          // DayViewと同じように直接DateTimeSelectionを渡す
          onTimeRangeSelect?.(selection)
        }}
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
        {/* 通常のプラン表示 */}
        {plans.map((plan) => {
          const style = planStyles[plan.id]
          if (!style) return null

          const isDragging = dragState.draggedEventId === plan.id && dragState.isDragging

          // ドラッグ中のプラン表示制御：元のカラムで水平移動表示
          // （非表示にせず、水平位置を調整して表示継続）
          const isResizingThis = dragState.isResizing && dragState.draggedEventId === plan.id
          const currentTop = parseFloat(style.top?.toString() || '0')
          const currentHeight = parseFloat(style.height?.toString() || '20')

          // ゴースト表示スタイル（共通化）
          const adjustedStyle = calculatePlanGhostStyle(style, plan.id, dragState)

          return (
            <div key={plan.id} style={adjustedStyle} className="pointer-events-none absolute" data-plan-block="true">
              {/* PlanBlockの内容部分のみクリック可能 */}
              <div
                className="focus:ring-ring pointer-events-auto absolute inset-0 rounded focus:ring-2 focus:ring-offset-1 focus:outline-none"
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
                        ? (dragState.snappedPosition.height ?? currentHeight)
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

        {/* ドラッグ中のプランを他の日付カラムで表示 */}
        {dragState.isDragging &&
        dragState.draggedEventId &&
        dragState.targetDateIndex !== undefined &&
        dragState.targetDateIndex === dayIndex &&
        !plans.find((p) => p.id === dragState.draggedEventId) &&
        displayDates
          ? (() => {
              // 週の全プランからドラッグ中のプランを探す
              // displayDates配列を使って全日付のプランを探索

              // 他のWeekContentインスタンスが保持しているプランを探すのは困難
              // そのため、親コンポーネントから渡されるplans配列から探す
              // 現在はplansには当日のプランのみ含まれているため、
              // WeekGridから全プランを渡すよう修正が必要

              // Implementation tracked in Issue #89
              return null
            })()
          : null}
      </div>
    </div>
  )
}
