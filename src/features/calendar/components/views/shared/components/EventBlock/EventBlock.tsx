/**
 * イベント表示ブロックコンポーネント
 */

'use client'

import React, { memo, useState } from 'react'
import { EventContent } from './EventContent'
import { useEventPosition } from '../../hooks/useEventPosition'
import { MIN_EVENT_HEIGHT, Z_INDEX, TRANSITION_DURATION } from '../../constants/grid.constants'
import type { EventBlockProps, TimedEvent } from '../../types/event.types'
import { eventBlockVariants, calendarZIndex } from '@/styles/themes/components'
import { cn } from '@/lib/utils'

export const EventBlock = memo<EventBlockProps>(function EventBlock({
  event,
  position,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  isDragging = false,
  isSelected = false,
  isResizing = false,
  className = '',
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // すべてのイベントは時間指定イベント
  
  // イベントの色を決定
  const eventColor = event.color || 'blue'
  
  // 動的スタイルを計算
  const dynamicStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${position.top}px`,
    left: `${position.left}%`,
    width: `${position.width}%`,
    height: `${Math.max(position.height, MIN_EVENT_HEIGHT)}px`,
    zIndex: isHovered || isSelected || isDragging ? Z_INDEX.DRAGGING : Z_INDEX.EVENTS,
    transition: isDragging || isResizing ? 'none' : `all ${TRANSITION_DURATION}ms ease-in-out`,
    cursor: isDragging ? 'grabbing' : 'grab',
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    opacity: isDragging ? 0.8 : 1,
    ...style
  }
  
  // イベントハンドラー
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(event)
  }
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.(event)
  }
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu?.(event, e)
  }
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左クリックのみ
      onDragStart?.(event)
    }
  }
  
  const handleMouseUp = () => {
    if (isDragging) {
      onDragEnd?.(event)
    }
  }
  
  // 状態に応じたスタイルを決定
  const eventState = isDragging ? 'dragging' : isSelected ? 'selected' : isHovered ? 'hovered' : 'default'
  
  // CSSクラスを組み立て（中央管理のスタイルを使用）
  const eventClasses = cn(
    eventBlockVariants({
      color: eventColor as any,
      state: eventState,
      size: position.height < 30 ? 'compact' : 'default'
    }),
    className
  )
  
  return (
    <div
      className={eventClasses}
      style={dynamicStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={false} // HTML5 draggableは使わない
      role="button"
      tabIndex={0}
      aria-label={`イベント: ${event.title}`}
      aria-selected={isSelected}
    >
      <EventContent
        event={event as TimedEvent}
        isCompact={position.height < 40}
        showTime={position.height >= 30}
      />
    </div>
  )
})