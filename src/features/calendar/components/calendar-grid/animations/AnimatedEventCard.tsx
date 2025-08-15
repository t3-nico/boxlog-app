'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { CalendarEvent } from '@/features/events'

interface AnimatedEventCardProps {
  event: CalendarEvent
  style: React.CSSProperties
  isSelected?: boolean
  isNew?: boolean
  isDeleting?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  children?: React.ReactNode
  className?: string
}

export function AnimatedEventCard({
  event,
  style,
  isSelected = false,
  isNew = false,
  isDeleting = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  children,
  className
}: AnimatedEventCardProps) {
  const [isVisible, setIsVisible] = useState(!isNew)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 新規イベントのアニメーション
  useEffect(() => {
    if (isNew && !isVisible) {
      // 短い遅延後にフェードイン開始
      animationTimeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, 10)
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [isNew, isVisible])

  // 削除アニメーション
  useEffect(() => {
    if (isDeleting) {
      setIsVisible(false)
    }
  }, [isDeleting])

  // 選択時のアニメーション
  const getAnimationClasses = () => {
    const baseClasses = [
      "transition-all duration-200 ease-out",
      "transform-gpu" // GPUアクセラレーション
    ]

    if (isNew) {
      baseClasses.push(
        isVisible 
          ? "animate-in fade-in-0 zoom-in-95 duration-200" 
          : "opacity-0 scale-95"
      )
    }

    if (isDeleting) {
      baseClasses.push("animate-out fade-out-0 zoom-out-95 duration-150")
    }

    if (isSelected) {
      baseClasses.push(
        "shadow-lg shadow-primary/25",
        "scale-105",
        "ring-2 ring-primary/50",
        "z-30"
      )
    }

    if (isHovered && !isSelected) {
      baseClasses.push(
        "brightness-110",
        "shadow-md",
        "scale-[1.02]",
        "z-25"
      )
    }

    return baseClasses.join(" ")
  }

  // イベントの色調整
  const getEventColor = () => {
    if (!event.color) return '#3b82f6'
    
    // ホバー時は明度を上げる
    if (isHovered && !isSelected) {
      // 色を10%明るくする
      const color = event.color
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        
        const brighten = (value: number) => Math.min(255, Math.round(value * 1.1))
        
        return `rgb(${brighten(r)}, ${brighten(g)}, ${brighten(b)})`
      }
    }
    
    return event.color
  }

  // クリック処理（100ms以下の反応速度）
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // 即座にビジュアルフィードバック
    if (cardRef.current) {
      cardRef.current.style.transform = 'scale(0.98)'
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transform = ''
        }
      }, 100)
    }
    
    onClick?.()
  }

  // ダブルクリック処理
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.()
  }

  // 右クリック処理
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu?.(e)
  }

  // マウスイベント
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      // 削除イベントを発火
      console.log('キーボードで削除:', event.id)
    }
  }

  return (
    <div
      ref={cardRef}
      data-event-block
      data-event-id={event.id}
      className={cn(
        "absolute rounded-md cursor-pointer overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "will-change-transform", // パフォーマンス最適化
        getAnimationClasses(),
        className
      )}
      style={{
        ...style,
        backgroundColor: getEventColor(),
        containIntrinsicSize: 'layout' // パフォーマンス最適化
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Event: ${event.title}`}
    >
      {children || (
        <div className="p-2 h-full overflow-hidden text-white">
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              {/* タイトル */}
              <div className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                {event.title}
              </div>
              
              {/* 時間（高さが十分な場合のみ） */}
              {(style.height as number) > 40 && event.startDate && (
                <div className="text-xs opacity-90 leading-tight">
                  {format(event.startDate, 'HH:mm')}
                  {event.endDate && ` - ${format(event.endDate, 'HH:mm')}`}
                </div>
              )}
            </div>
            
            {/* 場所（高さが十分な場合のみ） */}
            {event.location && (style.height as number) > 70 && (
              <div className="text-xs opacity-80 leading-tight mt-1 line-clamp-1">
                📍 {event.location}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 選択時のインジケーター */}
      {isSelected && (
        <div className="absolute inset-0 rounded-md border-2 border-primary/80 pointer-events-none" />
      )}
      
      {/* ホバー時のオーバーレイ */}
      {isHovered && !isSelected && (
        <div className="absolute inset-0 bg-white/10 rounded-md pointer-events-none" />
      )}
    </div>
  )
}

// アニメーション用のCSS（globals.cssに追加推奨）
export const eventAnimationStyles = `
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeOutScale {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }

  .animate-fade-in-scale {
    animation: fadeInScale 0.2s ease-out forwards;
  }

  .animate-fade-out-scale {
    animation: fadeOutScale 0.15s ease-in forwards;
  }

  /* ハードウェアアクセラレーション */
  .transform-gpu {
    transform: translateZ(0);
  }

  /* レスポンシブなズーム効果 */
  @media (hover: hover) {
    .event-card:hover {
      transform: scale(1.02);
    }
  }

  /* タッチデバイス用 */
  @media (hover: none) {
    .event-card:active {
      transform: scale(0.98);
    }
  }
`