// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useDrag, useDragLayer } from 'react-dnd'

import type { CalendarEvent } from '@/features/events'
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

export const DRAG_TYPE = {
  EVENT: 'calendar-event',
} as const

// ドラッグ開始閾値（px）
const DRAG_THRESHOLD = 5

// カスタムドラッグレイヤー（ゴーストイメージ）
export const CustomDragLayer = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem() as DraggedEventData | null,
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging || !currentOffset || !item) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: currentOffset.x - item.mouseOffsetY,
        top: currentOffset.y - item.mouseOffsetY,
        width: item.width,
        height: item.height,
      }}
    >
      <div className="bg-primary/90 text-primary-foreground border-primary rounded-md border-2 p-2 shadow-2xl">
        <div className="truncate text-sm font-medium">{item.event.title}</div>
      </div>
    </div>
  )
}

export const DraggableEvent = ({
  event,
  dayIndex,
  topPosition,
  onEventClick,
  onDragCancel,
  style,
  children,
}: DraggableEventProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragReady, setIsDragReady] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isClicking, setIsClicking] = useState(false)

  // ESCキーでドラッグをキャンセル
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging) {
        if (onDragCancel) {
          onDragCancel()
        }
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isDragging, onDragCancel])

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: DRAG_TYPE.EVENT,
      canDrag: isDragReady,
      item: (monitor): DraggedEventData => {
        const initialClientOffset = monitor.getInitialClientOffset()

        // マウスカーソルとカード上部のオフセットを計算
        let mouseOffsetY = 0
        let width = 0
        let height = 0
        if (initialClientOffset && ref.current) {
          const rect = ref.current.getBoundingClientRect()
          mouseOffsetY = initialClientOffset.y - rect.top
          width = rect.width
          height = rect.height
        }

        return {
          event,
          dayIndex,
          originalTop: topPosition,
          mouseOffsetY,
          width,
          height,
        }
      },
      end: (_item, monitor) => {
        setIsDragReady(false)
        setDragStartPos(null)

        const didDrop = monitor.didDrop()
        if (!didDrop && ref.current) {
          // ドロップ失敗時は元の位置に戻るアニメーション
          ref.current.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          setTimeout(() => {
            if (ref.current) {
              ref.current.style.transition = ''
            }
          }, 300)
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [event, dayIndex, topPosition, isDragReady]
  )

  // カスタムドラッグプレビューを使用するため、デフォルトのプレビューを無効化
  useEffect(() => {
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' // 1x1透明gif
    preview(img, { captureDraggingState: false })
  }, [preview])

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

  drag(ref)

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

  return (
    <div
      ref={ref}
      data-event="true"
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
        transform: isDragging ? 'scale(1.05)' : undefined,
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
