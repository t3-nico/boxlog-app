// @ts-nocheck TODO(#389): 型エラー6件を段階的に修正する
'use client'

import React, { useCallback } from 'react'

import { cn } from '@/lib/utils'

import { CalendarDragSelection, EventBlock, calculateEventGhostStyle, calculatePreviewTime } from '../../shared'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
import { useGlobalDragCursor } from '../../shared/hooks/useGlobalDragCursor'
import { useTimeCalculation } from '../../shared/hooks/useTimeCalculation'
import type { CalendarPlan } from '../../shared/types/event.types'
import type { DayContentProps } from '../DayView.types'
import { useDragAndDrop } from '../hooks/useDragAndDrop'

export const DayContent = ({
  date,
  plans,
  planStyles,
  onPlanClick,
  onPlanContextMenu,
  onEmptyClick,
  onPlanUpdate,
  onTimeRangeSelect,
  className,
}: DayContentProps) => {
  // ドラッグ&ドロップ機能用にonPlanUpdateをそのまま使用
  const handlePlanUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onPlanUpdate) return

      // handleUpdatePlanは両方の形式に対応（planId + updates形式で呼び出し）
      await onPlanUpdate(planId, updates)
    },
    [onPlanUpdate]
  )

  // ドラッグ&ドロップ機能
  // @ts-expect-error TODO(#389): TimedEvent型をCalendarPlan型に統一する必要がある
  const { dragState, handlers } = useDragAndDrop({
    onPlanUpdate: handlePlanUpdate,
    onPlanClick,
    date,
    plans,
  })

  // 時間計算機能
  const { calculateTimeFromEvent } = useTimeCalculation()

  // グローバルドラッグカーソー管理（共通化）
  useGlobalDragCursor(dragState, handlers)
  // 空白クリックハンドラー（現在使用されていない - CalendarDragSelectionが処理）
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
      // @ts-expect-error TODO(#389): TimedEvent型をCalendarPlan型に統一する必要がある
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
      // @ts-expect-error TODO(#389): TimedEvent型をCalendarPlan型に統一する必要がある
      onPlanContextMenu?.(plan, mouseEvent)
    },
    [onPlanContextMenu, dragState.isDragging, dragState.isResizing]
  )

  // 時間グリッドの生成（1時間単位、23時は下線なし）
  const timeGrid = Array.from({ length: 24 }, (_, hour) => (
    <div
      key={hour}
      className={`relative ${hour < 23 ? 'border-border border-b' : ''}`}
      style={{ height: HOUR_HEIGHT }}
    />
  ))

  return (
    <div className={cn('bg-background relative flex-1 overflow-hidden', className)} data-calendar-grid>
      {/* 新しいCalendarDragSelectionを使用 */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing} // ドラッグ・リサイズ中は背景クリックを無効化
      >
        {/* 背景グリッド（CalendarDragSelectionが全イベントを処理） */}
        <div className={`absolute inset-0`} style={{ height: 24 * HOUR_HEIGHT }}>
          {timeGrid}
        </div>
      </CalendarDragSelection>

      {/* プラン表示エリア */}
      <div className="pointer-events-none absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
        {plans &&
          Array.isArray(plans) &&
          plans.map((plan) => {
            // planがundefinedの場合はスキップ
            if (!plan || !plan.id) {
              console.warn('DayContent: Invalid plan detected', plan)
              return null
            }

            const style = planStyles[plan.id]
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
                      handlers.handleMouseDown(plan.id, e, {
                        top: currentTop,
                        left: 0,
                        width: 100,
                        height: currentHeight,
                      })
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      // キーボードでドラッグ操作を開始する代替手段
                      // ここでは単純にフォーカスを維持
                    }
                  }}
                >
                  <EventBlock
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
