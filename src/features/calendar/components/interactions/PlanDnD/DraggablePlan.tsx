// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useDraggable } from '@dnd-kit/core'

// import type { CalendarEvent } from '@/features/calendar/types/calendar.types'
import { cn } from '@/lib/utils'

export interface DraggedEventData {
  event: CalendarEvent
  dayIndex: number
  originalTop: number
  mouseOffsetY: number // マウスカーソルとカード上部のオフセット
  width: number // イベントカードの幅
  height: number // イベントカードの高さ
}

interface DraggableEventProps {
  event: CalendarEvent
  dayIndex: number
  topPosition: number
  onEventClick?: (event: CalendarEvent) => void
  onDragCancel?: () => void
  style: React.CSSProperties
  children: React.ReactNode
}

// ドラッグ開始閾値（px）
const DRAG_THRESHOLD = 5

export const DraggableEvent = ({
  event,
  dayIndex,
  topPosition,
  onEventClick,
  style,
  children,
}: DraggableEventProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isClicking, setIsClicking] = useState(false)
  const [isDragReady, setIsDragReady] = useState(false)

  // @dnd-kit/core の useDraggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `calendar-event-${event.id}`,
    data: {
      event,
      dayIndex,
      originalTop: topPosition,
      type: 'calendar-event',
    },
    disabled: !isDragReady,
  })

  // ドラッグ閾値を考慮したマウスイベントハンドラー
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsClicking(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isClicking || !dragStartPos) return

      const distance = Math.sqrt(Math.pow(e.clientX - dragStartPos.x, 2) + Math.pow(e.clientY - dragStartPos.y, 2))

      if (distance >= DRAG_THRESHOLD && !isDragReady) {
        setIsDragReady(true)
      }
    },
    [isClicking, dragStartPos, isDragReady]
  )

  const handleMouseUp = useCallback(() => {
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

  // タッチイベントのサポート
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    setIsClicking(true)
    setDragStartPos({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isClicking || !dragStartPos) return

      const touch = e.touches[0]
      if (!touch) return
      const distance = Math.sqrt(
        Math.pow(touch.clientX - dragStartPos.x, 2) + Math.pow(touch.clientY - dragStartPos.y, 2)
      )

      if (distance >= DRAG_THRESHOLD && !isDragReady) {
        setIsDragReady(true)
      }
    },
    [isClicking, dragStartPos, isDragReady]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragReady) {
      setIsClicking(false)
      setDragStartPos(null)
    }
  }, [isDragReady])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      // ドラッグ中はクリックイベントを無視
      if (!isDragging && !isDragReady && onEventClick) {
        onEventClick(event)
      }
    },
    [isDragging, isDragReady, onEventClick, event]
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
      data-event="true"
      data-event-block="true"
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.title}`}
      className={cn(
        'absolute z-20 rounded-md border border-white/20 hover:shadow-lg',
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
