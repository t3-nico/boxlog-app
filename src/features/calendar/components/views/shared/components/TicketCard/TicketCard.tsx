// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * チケット表示カードコンポーネント
 */

'use client'

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { calendarColors } from '@/features/calendar/theme'
import { useI18n } from '@/features/i18n/lib/hooks'

import { cn } from '@/lib/utils'

import { MIN_EVENT_HEIGHT, Z_INDEX } from '../../constants/grid.constants'
import type { CalendarTicket, TicketCardProps } from '../../types/event.types'

import { TicketCardContent } from './TicketCardContent'

export const TicketCard = memo<TicketCardProps>(function TicketCard({
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
  const { t } = useI18n()
  const [isHovered, setIsHovered] = useState(false)

  // すべてのチケットは時間指定チケット

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
    width: `calc(${safePosition.width}% - 8px)`, // 右側に8pxの余白
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
  const ticketCardClasses = cn(
    // 基本スタイル
    'overflow-hidden rounded-md shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    // colors.tsのscheduledカラーを参照（ドラッグ中はactive）
    isDragging ? scheduledColors.active : scheduledColors.background,
    scheduledColors.text,
    // 状態別スタイル
    isDragging ? 'cursor-grabbing' : 'cursor-pointer',
    isSelected && 'ring-2 ring-blue-500 ring-offset-1',
    // サイズ別スタイル（上下左右に4pxのpadding = p-1）
    safePosition.height < 30 ? 'p-1 text-xs' : 'p-1 text-sm',
    className
  )

  return (
    <div
      className={ticketCardClasses}
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
      aria-label={`Ticket: ${event.title}`}
      aria-pressed={isSelected}
    >
      <TicketCardContent
        event={
          {
            ...event,
            start: event.startDate || new Date(),
            end: event.endDate || new Date(),
          } as CalendarTicket
        }
        isCompact={safePosition.height < 40}
        showTime={safePosition.height >= 30}
        previewTime={previewTime}
      />

      {/* 下部リサイズハンドル */}
      <div
        className="absolute right-0 bottom-0 left-0 cursor-ns-resize focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
        role="slider"
        tabIndex={0}
        aria-label="Resize ticket duration"
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
        title={t('calendar.event.adjustEndTime')}
      />
    </div>
  )
})
