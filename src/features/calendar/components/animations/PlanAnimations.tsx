// @ts-nocheck TODO(#621): Events削除後の一時的な型エラー回避
'use client'

import React, { useEffect, useRef, useState } from 'react'

import { timeToMinutes } from '@/features/calendar/lib/time-grid-helpers'
// import { CalendarPlan } from '@/features/calendar/types/calendar.types'

// アニメーション設定
export const eventAnimations = {
  // イベント作成時
  create: {
    initial: { opacity: 0, scale: 0.8, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // イベント削除時
  delete: {
    initial: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8, y: -10 },
    transition: { duration: 0.15, ease: 'easeIn' },
  },

  // ホバー時
  hover: {
    scale: 1.02,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.1, ease: 'easeOut' },
  },

  // 選択時
  selected: {
    scale: 1.05,
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
    borderWidth: '2px',
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // ドラッグ中
  dragging: {
    scale: 1.1,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    zIndex: 50,
    transition: { duration: 0.1, ease: 'easeOut' },
  },
}

// アニメーション付きイベントコンポーネント
interface AnimatedEventItemProps {
  plan: CalendarPlan
  children: React.ReactNode
  isSelected?: boolean
  isHovered?: boolean
  isDragging?: boolean
  isCreating?: boolean
  onAnimationComplete?: () => void
  className?: string
  style?: React.CSSProperties
}

export const AnimatedEventItem = ({
  event,
  children,
  isSelected = false,
  isHovered = false,
  isDragging = false,
  isCreating = false,
  className,
  style,
}: AnimatedEventItemProps) => {
  const [isVisible, setIsVisible] = useState(!isCreating)

  useEffect(() => {
    if (isCreating) {
      // 作成アニメーション開始
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    }
  }, [isCreating])

  return (
    <div>
      {isVisible === true && (
        <div
          key={event.id}
          className={`${className} transition-all duration-200 ease-out ${isCreating ? 'animate-in fade-in scale-in-95 slide-in-from-bottom-2' : ''} ${isSelected ? 'scale-105 border-2 shadow-[0_8px_24px_rgba(59,130,246,0.3)]' : ''} ${isHovered ? 'scale-[1.02] shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : ''} ${isDragging ? 'z-50 scale-110 shadow-[0_12px_32px_rgba(0,0,0,0.2)]' : ''} ${!isDragging ? 'hover:brightness-110' : ''}`}
          style={style}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// 作成中のイベントプレビュー
interface CreatingEventPreviewProps {
  date: Date
  startTime: string
  endTime: string
  title?: string
  color?: string
  onConfirm?: (title: string) => void
  onCancel?: () => void
  dayWidth: number
  className?: string
}

export const CreatingEventPreview = ({
  startTime,
  endTime,
  title = 'New Event',
  color = '#3B82F6',
  onConfirm,
  onCancel,
  dayWidth,
  className,
}: CreatingEventPreviewProps) => {
  const [eventTitle, setEventTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 位置とサイズの計算
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const top = startMinutes * (72 / 60) // HOUR_HEIGHT / 60
  const height = Math.max((endMinutes - startMinutes) * (72 / 60), 20)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleConfirm = () => {
    onConfirm?.(eventTitle.trim() || title)
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleTitleClick = () => {
    setIsEditing(true)
  }

  return (
    <div
      className={`animate-in fade-in scale-in-95 slide-in-from-bottom-2 absolute z-30 rounded border-l-4 bg-white shadow-lg transition-all duration-200 ease-out ${className}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        width: `${dayWidth * 0.95}%`,
        left: '2.5%',
        borderLeftColor: color,
        backgroundColor: `${color}15`,
      }}
    >
      <div className="flex h-full flex-col p-2">
        {/* タイトル編集 */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            className="w-full border-none bg-transparent text-sm font-medium outline-none"
            style={{ color }}
            placeholder="Event title"
          />
        ) : (
          <button
            type="button"
            onClick={handleTitleClick}
            className="w-full cursor-text truncate border-none bg-transparent p-0 text-left text-sm font-medium"
            style={{ color }}
          >
            {eventTitle}
          </button>
        )}

        {/* 時間表示 */}
        <div className="mt-1 text-xs text-gray-600">
          {startTime} - {endTime}
        </div>

        {/* アクションボタン */}
        <div className="mt-auto flex gap-1">
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-primary text-primary-foreground hover:bg-primary/92 active:bg-primary/88 rounded px-2 py-1 text-xs transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/92 active:bg-secondary/88 rounded px-2 py-1 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// 削除アニメーション用のコンポーネント
interface DeletingEventProps {
  plan: CalendarPlan
  onAnimationComplete: () => void
  children: React.ReactNode
}

export const DeletingEvent = ({ event, onAnimationComplete, children }: DeletingEventProps) => {
  return (
    <div
      key={`deleting-${event.id}`}
      className="animate-out fade-out scale-out-95 slide-out-to-bottom-2 duration-150"
      onAnimationEnd={onAnimationComplete}
    >
      {children}
    </div>
  )
}

// パルス効果（ホバー時の視覚フィードバック）
interface PulseEffectProps {
  isActive: boolean
  children: React.ReactNode
  intensity?: 'low' | 'medium' | 'high'
}

export const PulseEffect = ({ isActive, children }: PulseEffectProps) => {
  return <div className={isActive ? 'animate-pulse' : ''}>{children}</div>
}
