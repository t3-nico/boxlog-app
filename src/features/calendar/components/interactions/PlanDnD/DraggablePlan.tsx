'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useDraggable } from '@dnd-kit/core'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { cn } from '@/lib/utils'

export interface DraggedPlanData {
  plan: CalendarPlan
  dayIndex: number
  originalTop: number
  mouseOffsetY: number // マウスカーソルとカード上部のオフセット
  width: number // プランカードの幅
  height: number // プランカードの高さ
}

// 後方互換性のためのエイリアス
/** @deprecated Use DraggedPlanData instead */
export type DraggedEventData = DraggedPlanData

interface DraggablePlanProps {
  plan: CalendarPlan
  dayIndex: number
  topPosition: number
  onPlanClick?: (plan: CalendarPlan) => void
  onDragCancel?: () => void
  style: React.CSSProperties
  children: React.ReactNode
}

// ドラッグ開始閾値（px）
const DRAG_THRESHOLD = 5

export const DraggablePlan = ({ plan, dayIndex, topPosition, onPlanClick, style, children }: DraggablePlanProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isClicking, setIsClicking] = useState(false)
  const [isDragReady, setIsDragReady] = useState(false)

  // RAF throttle用のref（INP改善: 連続的なmousemove/touchmoveをthrottle化）
  const rafIdRef = useRef<number | null>(null)
  const pendingMoveRef = useRef<{ x: number; y: number } | null>(null)

  // @dnd-kit/core の useDraggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `calendar-plan-${plan.id}`,
    data: {
      plan,
      dayIndex,
      originalTop: topPosition,
      type: 'calendar-plan',
    },
    disabled: !isDragReady,
  })

  // RAF throttle化された距離計算処理（INP改善）
  const processPendingMove = useCallback(() => {
    const pending = pendingMoveRef.current
    if (!pending || !dragStartPos || isDragReady) {
      rafIdRef.current = null
      return
    }

    const distance = Math.sqrt(Math.pow(pending.x - dragStartPos.x, 2) + Math.pow(pending.y - dragStartPos.y, 2))

    if (distance >= DRAG_THRESHOLD) {
      setIsDragReady(true)
    }

    pendingMoveRef.current = null
    rafIdRef.current = null
  }, [dragStartPos, isDragReady])

  // ドラッグ閾値を考慮したマウスイベントハンドラー
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsClicking(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isClicking || !dragStartPos || isDragReady) return

      // RAF throttle: 最新の座標を保存し、次のフレームで処理
      pendingMoveRef.current = { x: e.clientX, y: e.clientY }

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(processPendingMove)
      }
    },
    [isClicking, dragStartPos, isDragReady, processPendingMove]
  )

  const handleMouseUp = useCallback(() => {
    // RAFをキャンセル
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    pendingMoveRef.current = null

    if (!isDragReady) {
      setIsClicking(false)
      setDragStartPos(null)
    }
  }, [isDragReady])

  // ドラッグ終了後にリセット
  useEffect(() => {
    if (!isDragging && isDragReady) {
      setIsDragReady(false)
      setDragStartPos(null)
      setIsClicking(false)
    }
  }, [isDragging, isDragReady])

  // コンポーネントアンマウント時のRAFクリーンアップ
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  // タッチイベントのサポート（RAF throttle化）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    setIsClicking(true)
    setDragStartPos({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isClicking || !dragStartPos || isDragReady) return

      const touch = e.touches[0]
      if (!touch) return

      // RAF throttle: 最新の座標を保存し、次のフレームで処理
      pendingMoveRef.current = { x: touch.clientX, y: touch.clientY }

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(processPendingMove)
      }
    },
    [isClicking, dragStartPos, isDragReady, processPendingMove]
  )

  const handleTouchEnd = useCallback(() => {
    // RAFをキャンセル
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    pendingMoveRef.current = null

    if (!isDragReady) {
      setIsClicking(false)
      setDragStartPos(null)
    }
  }, [isDragReady])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      // ドラッグ中はクリックイベントを無視
      if (!isDragging && !isDragReady && onPlanClick) {
        onPlanClick(plan)
      }
    },
    [isDragging, isDragReady, onPlanClick, plan]
  )

  // ドラッグ時のスタイル
  const transformStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={(node) => {
        ref.current = node
        setNodeRef(node)
      }}
      {...attributes}
      {...listeners}
      data-plan="true"
      data-plan-block="true"
      role="button"
      tabIndex={0}
      aria-label={`Plan: ${plan.title}`}
      className={cn(
        'border-border/20 absolute z-20 rounded-md border hover:shadow-lg',
        isDragging && 'scale-105 opacity-40',
        !isDragging && 'transition-all duration-200',
        isDragReady ? 'cursor-grabbing' : 'cursor-pointer hover:cursor-grab active:cursor-grabbing'
      )}
      style={{
        ...style,
        ...transformStyle,
        transition: isDragging ? 'opacity 0.2s' : 'all 0.2s',
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e as unknown as React.MouseEvent)
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

// 後方互換性のためのエイリアス
/** @deprecated Use DraggablePlan instead */
export const DraggableEvent = DraggablePlan
