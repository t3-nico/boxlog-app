'use client'

import React, { useEffect, useState, useRef } from 'react'


import { CalendarEvent } from '@/features/events'

// アニメーション設定
export const eventAnimations = {
  // イベント作成時
  create: {
    initial: { opacity: 0, scale: 0.8, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // イベント削除時
  delete: {
    initial: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8, y: -10 },
    transition: { duration: 0.15, ease: 'easeIn' }
  },
  
  // ホバー時
  hover: {
    scale: 1.02,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.1, ease: 'easeOut' }
  },
  
  // 選択時
  selected: {
    scale: 1.05,
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
    borderWidth: '2px',
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // ドラッグ中
  dragging: {
    scale: 1.1,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    zIndex: 50,
    transition: { duration: 0.1, ease: 'easeOut' }
  }
}

// アニメーション付きイベントコンポーネント
interface AnimatedEventItemProps {
  event: CalendarEvent
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
  _onAnimationComplete,
  className,
  style
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
          className={`${className} transition-all duration-200 ease-out ${isCreating ? 'animate-in fade-in scale-in-95 slide-in-from-bottom-2' : ''} ${isSelected ? 'scale-105 shadow-[0_8px_24px_rgba(59,130,246,0.3)] border-2' : ''} ${isHovered ? 'scale-[1.02] shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : ''} ${isDragging ? 'scale-110 shadow-[0_12px_32px_rgba(0,0,0,0.2)] z-50' : ''} ${!isDragging ? 'hover:brightness-110' : ''}`}
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
  _date,
  startTime,
  endTime,
  title = 'New Event',
  color = '#3B82F6',
  onConfirm,
  onCancel,
  dayWidth,
  className
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
      className={`absolute rounded border-l-4 bg-white shadow-lg z-30 transition-all duration-200 ease-out animate-in fade-in scale-in-95 slide-in-from-bottom-2 ${className}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        width: `${dayWidth * 0.95}%`,
        left: '2.5%',
        borderLeftColor: color,
        backgroundColor: `${color}15`
      }}
    >
      <div className="p-2 h-full flex flex-col">
        {/* タイトル編集 */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            className="text-sm font-medium bg-transparent border-none outline-none w-full"
            style={{ color }}
            placeholder="Event title"
          />
        ) : (
          <button
            type="button"
            onClick={handleTitleClick}
            className="text-sm font-medium cursor-text truncate text-left w-full bg-transparent border-none p-0"
            style={{ color }}
          >
            {eventTitle}
          </button>
        )}

        {/* 時間表示 */}
        <div className="text-xs text-gray-600 mt-1">
          {startTime} - {endTime}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-1 mt-auto">
          <button
            type="button"
            onClick={handleConfirm}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
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
  event: CalendarEvent
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

export const PulseEffect = ({ isActive, children, intensity: _intensity = 'medium' }: PulseEffectProps) => {
  return (
    <div className={isActive ? 'animate-pulse' : ''}>
      {children}
    </div>
  )
}
