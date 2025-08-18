'use client'

import React from 'react'
import { format } from 'date-fns'
import { MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PositionedEvent } from './types'

interface EventBlockProps {
  event: PositionedEvent
  className?: string
  onClick?: (event: PositionedEvent) => void
  onDoubleClick?: (event: PositionedEvent) => void
  showTime?: boolean       // 時間を表示するか
  showLocation?: boolean   // 場所を表示するか
  minHeight?: number       // 最小高さ
  isSelected?: boolean     // 選択状態
  isDragging?: boolean     // ドラッグ中
}

/**
 * イベントブロック
 * カレンダー上に表示される個別イベントブロック
 * 時間、タイトル、場所を表示し、オーバーフロー時は省略
 */
export function EventBlock({
  event,
  className,
  onClick,
  onDoubleClick,
  showTime = true,
  showLocation = true,
  minHeight = 20,
  isSelected = false,
  isDragging = false
}: EventBlockProps) {
  const { position } = event
  const actualHeight = Math.max(minHeight, position.height)
  
  // イベントの色（デフォルトは青）
  const eventColor = event.color || '#3B82F6'
  
  // 時間表示の判定（高さが十分にある場合のみ）
  const shouldShowTime = showTime && actualHeight > 30
  const shouldShowLocation = showLocation && actualHeight > 50 && event.location

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(event)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDoubleClick?.(event)
  }

  return (
    <div
      className={cn(
        'absolute rounded-md cursor-pointer transition-all duration-200 group overflow-hidden',
        'hover:shadow-lg hover:scale-[1.02] hover:z-20',
        isSelected && 'ring-2 ring-blue-400 ring-offset-1 z-10',
        isDragging && 'opacity-70 shadow-xl z-30',
        className
      )}
      style={{
        top: `${position.top}px`,
        height: `${actualHeight}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        backgroundColor: eventColor,
        borderLeft: `4px solid ${eventColor}`,
        filter: isDragging ? 'brightness(0.9)' : undefined
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 背景のグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
      
      {/* コンテンツ */}
      <div className="relative h-full p-1 sm:p-2 text-white">
        <div className="flex flex-col h-full text-xs">
          {/* タイトル */}
          <div 
            className="font-medium leading-tight mb-1 flex-shrink-0"
            style={{
              fontSize: actualHeight > 40 ? '0.75rem' : '0.6875rem',
              lineHeight: actualHeight > 40 ? '1.2' : '1.1'
            }}
          >
            <div className="truncate" title={event.title}>
              {event.title}
            </div>
          </div>
          
          {/* 時間表示 */}
          {shouldShowTime && (
            <div className="flex items-center gap-1 text-white/90 mb-1 flex-shrink-0">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs leading-none">
                {format(event.startTime, 'HH:mm')}
                {event.endTime && ` - ${format(event.endTime, 'HH:mm')}`}
              </span>
            </div>
          )}
          
          {/* 場所表示 */}
          {shouldShowLocation && (
            <div className="flex items-center gap-1 text-white/80 flex-shrink-0">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs leading-none truncate" title={event.location}>
                {event.location}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* ホバー時のアクション */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          {/* 編集ボタン（ダブルクリックヒント） */}
          <div className="w-4 h-4 bg-white/20 rounded text-white/70 flex items-center justify-center text-xs">
            ✏️
          </div>
        </div>
      </div>
      
      {/* リサイズハンドル（下端） */}
      <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/20" />
    </div>
  )
}

/**
 * コンパクトなイベントブロック
 * 高さが制限されている場合に使用
 */
export function CompactEventBlock({
  event,
  ...props
}: Omit<EventBlockProps, 'showTime' | 'showLocation' | 'minHeight'>) {
  return (
    <EventBlock
      event={event}
      showTime={false}
      showLocation={false}
      minHeight={16}
      {...props}
    />
  )
}