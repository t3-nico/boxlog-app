// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import React, { useCallback, useEffect } from 'react'

import { cn } from '@/lib/utils'

import { HOUR_HEIGHT } from '../../constants/grid.constants'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import type { CalendarPlan } from '../../types/plan.types'
import { CalendarDragSelection } from '../CalendarDragSelection'
import { PlanCard } from '../PlanCard'

export interface PlanGridProps {
  date: Date
  plans: CalendarPlan[]
  planStyles: Record<string, React.CSSProperties>
  onPlanClick?: (plan: CalendarPlan) => void
  onPlanContextMenu?: (plan: CalendarPlan, e: React.MouseEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onPlanUpdate?: (plan: CalendarPlan) => void
  onTimeRangeSelect?: (start: Date, end: Date) => void
  className?: string
  showTimeGrid?: boolean
  showCurrentTime?: boolean
}

/**
 * 共通のプラングリッドコンポーネント
 * 全てのビュー（Day, Week, ThreeDay等）で利用可能
 */
export const PlanGrid = ({
  date,
  plans,
  planStyles,
  onPlanClick,
  onPlanContextMenu,
  onEmptyClick,
  onPlanUpdate,
  onTimeRangeSelect,
  className,
  showTimeGrid = true,
}: PlanGridProps) => {
  // ドラッグ&ドロップ機能
  const { dragState, handlers } = useDragAndDrop({
    onPlanUpdate: onPlanUpdate
      ? async (planId, updates) => {
          const plan = plans.find((p) => p.id === planId)
          if (plan) {
            await onPlanUpdate({
              ...plan,
              start: updates.startTime,
              end: updates.endTime,
            })
          }
        }
      : undefined,
    date,
    plans,
  })

  // グローバルマウスイベント処理
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      document.addEventListener('mousemove', handlers.handleMouseMove)
      document.addEventListener('mouseup', handlers.handleMouseUp)

      // カーソル制御
      if (dragState.isResizing) {
        document.body.style.cursor = 'ns-resize'
        document.body.style.userSelect = 'none'
      } else if (dragState.isDragging) {
        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
      }

      return () => {
        document.removeEventListener('mousemove', handlers.handleMouseMove)
        document.removeEventListener('mouseup', handlers.handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [dragState.isDragging, dragState.isResizing, handlers.handleMouseMove, handlers.handleMouseUp])

  // プランクリックハンドラー
  const handlePlanClick = useCallback(
    (plan: CalendarPlan) => {
      if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
        return
      }
      onPlanClick?.(plan)
    },
    [onPlanClick, dragState]
  )

  // プラン右クリックハンドラー
  const handlePlanContextMenu = useCallback(
    (plan: CalendarPlan, mouseEvent: React.MouseEvent) => {
      if (dragState.isDragging || dragState.isResizing || dragState.recentlyDragged) {
        return
      }
      onPlanContextMenu?.(plan, mouseEvent)
    },
    [onPlanContextMenu, dragState]
  )

  // 時間グリッドの生成
  const timeGrid = showTimeGrid
    ? Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className={cn('relative', hour < 23 && 'border-b border-neutral-900/20 dark:border-neutral-100/20')}
          style={{ height: HOUR_HEIGHT }}
        />
      ))
    : null

  return (
    <div className={cn('bg-background relative flex-1 overflow-hidden', className)}>
      {/* 背景選択レイヤー */}
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        onSingleClick={onEmptyClick}
        disabled={dragState.isDragging || dragState.isResizing}
      >
        {/* 時間グリッド */}
        {showTimeGrid != null && (
          <div className="absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
            {timeGrid}
          </div>
        )}
      </CalendarDragSelection>

      {/* プラン表示レイヤー */}
      <div className="pointer-events-none absolute inset-0" style={{ height: 24 * HOUR_HEIGHT }}>
        {plans.map((plan) => {
          const style = planStyles[plan.id]
          if (!style) return null

          const isDragging = dragState.draggedPlanId === plan.id && dragState.isDragging
          const isResizing = dragState.isResizing && dragState.draggedPlanId === plan.id

          // ドラッグ・リサイズ中の位置調整
          const adjustedStyle = { ...style }
          if (dragState.snappedPosition && (isDragging || isResizing)) {
            if (isDragging) {
              adjustedStyle.top = `${dragState.snappedPosition.top}px`
            } else if (isResizing && dragState.snappedPosition.height) {
              adjustedStyle.height = `${dragState.snappedPosition.height}px`
            }
            adjustedStyle.zIndex = 1000
          }

          return (
            <div key={plan.id} style={adjustedStyle} className="pointer-events-none absolute">
              <div
                className="pointer-events-auto absolute inset-0 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
                role="button"
                tabIndex={0}
                aria-label={`Drag plan: ${plan.title}`}
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    handlers.handleMouseDown(plan.id, e, {
                      top: parseFloat(style.top?.toString() || '0'),
                      left: 0,
                      width: 100,
                      height: parseFloat(style.height?.toString() || '20'),
                    })
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    // キーボードでドラッグ操作を開始する代替手段
                  }
                }}
              >
                <PlanCard
                  plan={plan}
                  position={{
                    top: 0,
                    left: 0,
                    width: 100,
                    height: parseFloat(adjustedStyle.height?.toString() || '20'),
                  }}
                  onClick={() => handlePlanClick(plan)}
                  onContextMenu={(plt, e) => handlePlanContextMenu(plt, e)}
                  onResizeStart={(plt, direction, e) =>
                    handlers.handleResizeStart(plt.id, direction, e, {
                      top: parseFloat(style.top?.toString() || '0'),
                      left: 0,
                      width: 100,
                      height: parseFloat(style.height?.toString() || '20'),
                    })
                  }
                  isDragging={isDragging}
                  isResizing={isResizing}
                  previewTime={isDragging || isResizing ? dragState.previewTime : null}
                  className={cn('h-full w-full', isDragging && 'cursor-grabbing', !isDragging && 'cursor-grab')}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlanGrid
