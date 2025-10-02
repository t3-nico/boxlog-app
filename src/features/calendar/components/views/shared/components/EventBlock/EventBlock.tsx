/**
 * イベント表示ブロックコンポーネント
 */

'use client'

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'

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
  isDragging = false,
  isSelected = false,
  className = '',
  style = {},
  previewTime = null,
}) {
  const [isHovered, setIsHovered] = useState(false)

  // すべてのイベントは時間指定イベント

  // カレンダーテーマのscheduledカラーを使用
  const scheduledColors = calendarColors.event.scheduled

  // positionが未定義の場合のデフォルト値
  const safePosition = useMemo(
    () =>
      position || {
        top: 0,
        left: 0,
        width: 100,
        height: MIN_EVENT_HEIGHT,
      },
    [position]
  )

  // 動的スタイルを計算
  const dynamicStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${safePosition.top}px`,
    left: `${safePosition.left}%`,
    width: `${safePosition.width}%`,
    height: `${Math.max(safePosition.height, MIN_EVENT_HEIGHT)}px`,
    zIndex: isHovered || isSelected || isDragging ? Z_INDEX.DRAGGING : Z_INDEX.EVENTS,
    cursor: isDragging ? 'grabbing' : 'pointer',
    ...style,
  }

  // イベントハンドラー
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onClick?.(event)
    },
    [onClick, event]
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDoubleClick?.(event)
    },
    [onDoubleClick, event]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onContextMenu?.(event, e)
    },
    [onContextMenu, event]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // 左クリックのみ
        onDragStart?.(event)
      }
    },
    [onDragStart, event]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onDragEnd?.(event)
    }
  }, [isDragging, onDragEnd, event])

  // ホバー状態制御
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        // キーボードイベントの場合はeventオブジェクトを直接渡す
        onClick?.(event)
      }
    },
    [onClick, event]
  )

  // リサイズハンドラー
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onResizeStart?.(event, 'bottom', e, {
        top: safePosition.top,
        left: safePosition.left,
        width: safePosition.width,
        height: safePosition.height,
      })
    },
    [onResizeStart, event, safePosition]
  )

  const handleResizeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // キーボードでのリサイズ操作の代替手段
    }
  }, [])

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

  // CSSクラスを組み立て（colors.tsのscheduledを参照）
  const eventClasses = cn(
    // 基本スタイル
    'overflow-hidden rounded-md px-2 py-1 shadow-sm',
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      draggable={false} // HTML5 draggableは使わない
      role="button"
      tabIndex={0}
      aria-label={`Event: ${event.title}`}
      aria-pressed={isSelected}
    >
      <EventContent
        event={
          {
            ...event,
            start: event.startDate || new Date(),
            end: event.endDate || new Date(),
          } as TimedEvent
        }
        isCompact={safePosition.height < 40}
        showTime={safePosition.height >= 30}
        previewTime={previewTime}
      />

      {/* 下部リサイズハンドル */}
      <div
        className="absolute bottom-0 left-0 right-0 cursor-ns-resize focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        role="slider"
        tabIndex={0}
        aria-label="Resize event duration"
        aria-orientation="vertical"
        aria-valuenow={safePosition.height}
        aria-valuemin={20}
        aria-valuemax={480}
        onMouseDown={handleResizeMouseDown}
        onKeyDown={handleResizeKeyDown}
        style={{
          height: '8px',
          zIndex: 10,
        }}
        title="ドラッグして終了時間を調整"
      />
    </div>
  )
})
