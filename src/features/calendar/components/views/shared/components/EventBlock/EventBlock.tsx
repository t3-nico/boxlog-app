/**
 * イベント表示ブロックコンポーネント
 */

'use client'

import React, { memo, useState, useEffect } from 'react'

import { calendarColors } from '@/features/calendar/theme'

import { cn } from '@/lib/utils'

import { MIN_EVENT_HEIGHT, Z_INDEX } from '../../constants/grid.constants'
import type { EventBlockProps, TimedEvent } from '../../types/event.types'



import { EventContent } from './EventContent'

export const EventBlock = memo<EventBlockProps>(function EventBlock({
  event,
  position,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResizeEnd,
  isDragging = false,
  isSelected = false,
  isResizing = false,
  className = '',
  style = {},
  previewTime = null
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // すべてのイベントは時間指定イベント
  
  // カレンダーテーマのscheduledカラーを使用
  const scheduledColors = calendarColors.event.scheduled
  
  // positionが未定義の場合のデフォルト値
  const safePosition = position || {
    top: 0,
    left: 0,
    width: 100,
    height: MIN_EVENT_HEIGHT
  }

  // 動的スタイルを計算
  const dynamicStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${safePosition.top}px`,
    left: `${safePosition.left}%`,
    width: `${safePosition.width}%`,
    height: `${Math.max(safePosition.height, MIN_EVENT_HEIGHT)}px`,
    zIndex: isHovered || isSelected || isDragging ? Z_INDEX.DRAGGING : Z_INDEX.EVENTS,
    cursor: isDragging ? 'grabbing' : 'pointer',
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
  
  // Escキーでドラッグをキャンセル
  useEffect(() => {
    if (!isDragging) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // ドラッグ状態をリセット（親コンポーネントに委ねる）
        onDragEnd?.(event)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDragging, onDragEnd, event])
  
  // 状態に応じたスタイルを決定
  const eventState = isDragging ? 'dragging' : isSelected ? 'selected' : isHovered ? 'hovered' : 'default'
  
  // CSSクラスを組み立て（colors.tsのscheduledを参照）
  const eventClasses = cn(
    // 基本スタイル
    'rounded-md shadow-sm px-2 py-1 overflow-hidden',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    // colors.tsのscheduledカラーを参照（ドラッグ中はactive）
    isDragging ? scheduledColors.active : scheduledColors.background,
    scheduledColors.text,
    // 状態別スタイル
    isDragging ? 'cursor-grabbing' : 'cursor-pointer',
    isSelected && 'ring-2 ring-blue-500 ring-offset-1',
    // サイズ別スタイル
    safePosition.height < 30 ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-sm',
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e as any)
        }
      }}
      draggable={false} // HTML5 draggableは使わない
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.title}`}
      aria-selected={isSelected}
    >
      <EventContent
        event={{
          ...event,
          start: event.startDate || new Date(),
          end: event.endDate || new Date()
        } as TimedEvent}
        isCompact={safePosition.height < 40}
        showTime={safePosition.height >= 30}
        previewTime={previewTime}
      />
      
      {/* 下部リサイズハンドル */}
      <div
        className="absolute bottom-0 left-0 right-0 cursor-ns-resize"
        onMouseDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onResizeStart?.(event, 'bottom', e, {
            top: safePosition.top,
            left: safePosition.left,
            width: safePosition.width,
            height: safePosition.height
          })
        }}
        style={{ 
          height: '8px',
          zIndex: 10
        }}
        title="ドラッグして終了時間を調整"
      />
    </div>
  )
})