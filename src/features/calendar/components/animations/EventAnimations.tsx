'use client'

import React, { useEffect, useState, useRef } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

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
  onAnimationComplete,
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

  // アニメーション状態の決定
  const getAnimationVariant = () => {
    if (isDragging) return 'dragging'
    if (isSelected) return 'selected'
    if (isHovered) return 'hover'
    return 'default'
  }

  const animationVariants = {
    default: {
      scale: 1,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      zIndex: 1
    },
    hover: eventAnimations.hover,
    selected: eventAnimations.selected,
    dragging: eventAnimations.dragging
  }

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {isVisible && (
        <motion.div
          key={event.id}
          layoutId={event.id}
          className={className}
          style={style}
          initial={isCreating ? eventAnimations.create.initial : false}
          animate={isCreating ? eventAnimations.create.animate : animationVariants[getAnimationVariant()]}
          exit={eventAnimations.delete.exit}
          transition={isCreating ? eventAnimations.create.transition : { duration: 0.1 }}
          whileHover={!isDragging ? { filter: 'brightness(1.1)' } : undefined}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
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
  date,
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
    <motion.div
      initial={eventAnimations.create.initial}
      animate={eventAnimations.create.animate}
      exit={eventAnimations.delete.exit}
      transition={eventAnimations.create.transition}
      className={`absolute rounded border-l-4 bg-white shadow-lg z-30 ${className}`}
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
          <div
            onClick={handleTitleClick}
            className="text-sm font-medium cursor-text truncate"
            style={{ color }}
          >
            {eventTitle}
          </div>
        )}

        {/* 時間表示 */}
        <div className="text-xs text-gray-600 mt-1">
          {startTime} - {endTime}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-1 mt-auto">
          <button
            onClick={handleConfirm}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
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
    <motion.div
      key={`deleting-${event.id}`}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ duration: 0.15, ease: 'easeIn' }}
      onAnimationComplete={onAnimationComplete}
    >
      {children}
    </motion.div>
  )
}

// パルス効果（ホバー時の視覚フィードバック）
interface PulseEffectProps {
  isActive: boolean
  children: React.ReactNode
  intensity?: 'low' | 'medium' | 'high'
}

export const PulseEffect = ({ isActive, children, intensity = 'medium' }: PulseEffectProps) => {
  const pulseVariants = {
    low: { scale: [1, 1.01, 1] },
    medium: { scale: [1, 1.02, 1] },
    high: { scale: [1, 1.05, 1] }
  }

  return (
    <motion.div
      animate={isActive ? pulseVariants[intensity] : { scale: 1 }}
      transition={{
        duration: 1,
        repeat: isActive ? Infinity : 0,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// スムーズなレイアウト変更
export const SmoothLayoutGroup = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div layout transition={{ duration: 0.2, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

// ユーティリティ関数
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

// 成功・エラーアニメーション
interface StatusAnimationProps {
  type: 'success' | 'error' | 'info'
  children: React.ReactNode
  duration?: number
}

export const StatusAnimation = ({ type, children, duration = 2000 }: StatusAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`fixed top-4 right-4 p-3 rounded-lg text-white shadow-lg z-50 ${colors[type]}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// フレーマーモーション設定のプリセット
export const motionPresets = {
  // 滑らかなスケール変更
  smoothScale: {
    type: 'spring',
    stiffness: 400,
    damping: 30
  },
  
  // 素早いフェード
  quickFade: {
    duration: 0.15,
    ease: 'easeInOut'
  },
  
  // 弾性のあるエントリー
  bounceIn: {
    type: 'spring',
    stiffness: 300,
    damping: 20
  }
} as const