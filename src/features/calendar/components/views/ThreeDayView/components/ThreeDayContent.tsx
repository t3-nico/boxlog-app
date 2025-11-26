// @ts-nocheck
// TODO(#389): 型エラーを修正後、@ts-nocheckを削除
'use client'

import React, { useCallback } from 'react'

// import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { cn } from '@/lib/utils'

import {
  calculatePlanGhostStyle,
  calculatePreviewTime,
  CalendarDragSelection,
  PlanBlock,
  useGlobalDragCursor,
  useTimeCalculation,
} from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop'

interface ThreeDayContentProps {
  date: Date
  plans: CalendarPlan[]
  planStyles: Record<string, React.CSSProperties>
  onPlanClick?: (plan: CalendarPlan) => void
  onPlanContextMenu?: (plan: CalendarPlan, e: React.MouseEvent) => void
  onEmptyClick?: (date: Date, timeString: string) => void
  onPlanUpdate?: (planIdOrPlan: string | CalendarPlan, updates?: { startTime: Date; endTime: Date }) => void
  onTimeRangeSelect?: (date: Date, startTime: string, endTime: string) => void
  className?: string
  dayIndex: number // 3日間内での日付インデックス（0-2）
  displayDates?: Date[] // 3日間の全日付配列（日付間移動用）
}

export const ThreeDayContent = ({
  date,
  plans,
  planStyles,
  onPlanClick,
  onPlanContextMenu,
  onEmptyClick,
  onPlanUpdate,
  onTimeRangeSelect,
  className,
  dayIndex,
  displayDates,
}: ThreeDayContentProps) => {
  // ドラッグ&ドロップ機能用にonPlanUpdateをそのまま使用
  const handlePlanUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onPlanUpdate) return

      console.log('🔧 ThreeDayContent: プラン更新要求:', {
        planId,
        startTime: updates.startTime.toISOString(),
        endTime: updates.endTime.toISOString(),
      })

      // handleUpdatePlanは両方の形式に対応（planId + updates形式で呼び出し）
      await onPlanUpdate(planId, updates)
    },
    [onPlanUpdate]
  )

  // ドラッグ&ドロップ機能（日付間移動対応）
  const { dragState, handlers } = useDragAndDrop({
    onPlanUpdate: handlePlanUpdate,
    onPlanClick,
    date,
    plans,
    displayDates,
    viewMode: '3day',
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
      className={`relative ${hour < 23 ? 'border-border border-b' : ''}`}
      style={{ height: HOUR_HEIGHT }}
    />
  ))

  return (
    <div className={cn('bg-background relative h-full flex-1 overflow-hidden', className)} data-calendar-grid>
      {/* CalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={(selection) => {
          const startTime = `${String(selection.startHour).padStart(2, '0')}:${String(selection.startMinute).padStart(2, '0')}`
          const endTime = `${String(selection.endHour).padStart(2, '0')}:${String(selection.endMinute).padStart(2, '0')}`
          onTimeRangeSelect?.(date, startTime, endTime)
        }}
        onSingleClick={onEmptyClick}
        onDoubleClick={onEmptyClick} // ダブルクリックでもイベント作成
        disabled={dragState.isDragging || dragState.isResizing}
      >
        {/* 背景グリッド（DayViewと同じパターン） */}
        <div className="absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
          {timeGrid}
        </div>
      </CalendarDragSelection>

      {/* プラン表示エリア */}
      <div className="pointer-events-none absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
        {plans.map((plan) => {
          // planがundefinedの場合はスキップ
          if (!plan || !plan.id) {
            console.warn('ThreeDayContent: Invalid plan detected', plan)
            return null
          }

          const style = planStyles[plan.id]
          if (!style) return null

          const isDragging = dragState.draggedPlanId === plan.id && dragState.isDragging
          const isResizingThis = dragState.isResizing && dragState.draggedPlanId === plan.id
          const currentTop = parseFloat(style.top?.toString() || '0')
          const currentHeight = parseFloat(style.height?.toString() || '20')

          // ゴースト表示スタイル（共通化）
          const adjustedStyle = calculatePlanGhostStyle(style, plan.id, dragState)

          return (
            <div key={plan.id} style={adjustedStyle} className="pointer-events-none absolute" data-event-block="true">
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
