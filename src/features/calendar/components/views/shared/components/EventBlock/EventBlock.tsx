/**
 * イベント表示ブロックコンポーネント
 */

'use client'

import React, { memo, useState } from 'react'
import { EventContent } from './EventContent'
import { useEventPosition } from '../../hooks/useEventPosition'
import { MIN_EVENT_HEIGHT, Z_INDEX, TRANSITION_DURATION } from '../../constants/grid.constants'
import type { EventBlockProps, TimedEvent } from '../../types/event.types'

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
  
  // CSSクラスを組み立て
  const eventClasses = [
    'rounded-md shadow-sm border-l-4 px-2 py-1 overflow-hidden',
    'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1',
    isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : '',
    isHovered ? 'shadow-lg' : '',
    // カラー設定（Tailwindクラス）
    eventColor === 'blue' ? 'bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-900 dark:text-blue-100' :
    eventColor === 'red' ? 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900 dark:text-red-100' :
    eventColor === 'green' ? 'bg-green-100 border-green-500 text-green-900 dark:bg-green-900 dark:text-green-100' :
    eventColor === 'yellow' ? 'bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' :
    eventColor === 'purple' ? 'bg-purple-100 border-purple-500 text-purple-900 dark:bg-purple-900 dark:text-purple-100' :
    'bg-gray-100 border-gray-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
    className
  ].filter(Boolean).join(' ')
  
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