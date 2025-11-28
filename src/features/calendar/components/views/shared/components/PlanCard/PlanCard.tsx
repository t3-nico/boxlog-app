// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * プラン表示カードコンポーネント
 */

'use client'

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { calendarColors } from '@/features/calendar/theme'
import { useI18n } from '@/features/i18n/lib/hooks'

import { cn } from '@/lib/utils'

import { MIN_EVENT_HEIGHT, Z_INDEX } from '../../constants/grid.constants'
import type { PlanCardProps } from '../../types/plan.types'

import { PlanCardContent } from './PlanCardContent'

export const PlanCard = memo<PlanCardProps>(function PlanCard({
  plan,
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

  // すべてのプランは時間指定プラン

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
      onClick?.(plan)
    },
    [onClick, plan]
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDoubleClick?.(plan)
    },
    [onDoubleClick, plan]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onContextMenu?.(plan, e)
    },
    [onContextMenu, plan]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // 左クリックのみ
        onDragStart?.(plan)
      }
    },
    [onDragStart, plan]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onDragEnd?.(plan)
    }
  }, [isDragging, onDragEnd, plan])

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
        // キーボードイベントの場合はplanオブジェクトを直接渡す
        onClick?.(plan)
      }
    },
    [onClick, plan]
  )

  // リサイズハンドラー
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onResizeStart?.(plan, 'bottom', e, {
        top: safePosition.top,
        left: safePosition.left,
        width: safePosition.width,
        height: safePosition.height,
      })
    },
    [onResizeStart, plan, safePosition]
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
        onDragEnd?.(plan)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDragging, onDragEnd, plan])

  // 状態に応じたスタイルを決定
  // CSSクラスを組み立て（colors.tsのscheduledを参照）
  const planCardClasses = cn(
    // 基本スタイル
    'overflow-hidden rounded-md shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    // colors.tsのscheduledカラーを参照（ドラッグ中はactive）
    isDragging ? scheduledColors.active : scheduledColors.background,
    scheduledColors.text,
    // 状態別スタイル
    isDragging ? 'cursor-grabbing' : 'cursor-pointer',
    isSelected && 'ring-primary ring-2 ring-offset-1',
    // サイズ別スタイル（上下左右に8pxのpadding = p-2）
    safePosition.height < 30 ? 'p-2 text-xs' : 'p-2 text-sm',
    className
  )

  // planがundefinedの場合は何も表示しない（全hooks実行後）
  if (!plan || !plan.id) {
    console.error('PlanCard: plan is undefined or missing id', { plan, position })
    return null
  }

  return (
    <div
      className={planCardClasses}
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
      aria-label={`plan: ${plan.title}`}
      aria-pressed={isSelected}
    >
      <PlanCardContent
        plan={plan}
        isCompact={safePosition.height < 40}
        showTime={safePosition.height >= 30}
        previewTime={previewTime}
      />

      {/* 下部リサイズハンドル */}
      <div
        className="focus:ring-ring absolute right-0 bottom-0 left-0 cursor-ns-resize focus:ring-2 focus:ring-offset-1 focus:outline-none"
        role="slider"
        tabIndex={0}
        aria-label="Resize plan duration"
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
