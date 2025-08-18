'use client'

import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/features/events'
import { applyEventLayout, type LayoutedEvent } from '../../utils/event-layout'

// 定数
const HOUR_HEIGHT = 72 // 1時間の高さ（px）
const MIN_EVENT_HEIGHT = 20 // 最小イベント高さ（px）

// パフォーマンス最適化用のイベントコンポーネント
interface OptimizedEventItemProps {
  event: LayoutedEvent
  onEventClick?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  dayWidth: number
}

const OptimizedEventItem = memo<OptimizedEventItemProps>(({
  event,
  onEventClick,
  onDeleteEvent,
  dayWidth
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEventClick?.(event)
  }, [event, onEventClick])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDeleteEvent?.(event.id)
  }, [event.id, onDeleteEvent])

  // スタイル計算をメモ化
  const eventStyle = useMemo(() => {
    const { layout } = event
    
    return {
      position: 'absolute' as const,
      top: `${layout.top}px`,
      left: `${(layout.left / 100) * dayWidth}px`,
      width: `${(layout.width / 100) * dayWidth}px`,
      height: `${Math.max(layout.height, MIN_EVENT_HEIGHT)}px`,
      zIndex: layout.zIndex + 10, // 基本zIndexを上げる
      backgroundColor: `${event.color}15`,
      borderLeft: `3px solid ${event.color}`,
      borderRadius: '4px',
      transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out'
    }
  }, [event.layout, event.color, dayWidth])

  // 時間表示の計算をメモ化
  const timeDisplay = useMemo(() => {
    const startTime = format(event.startDate, 'HH:mm')
    if (event.endDate) {
      const endTime = format(event.endDate, 'HH:mm')
      return `${startTime}-${endTime}`
    }
    return startTime
  }, [event.startDate, event.endDate])

  // 優先度アイコン
  const priorityIcon = useMemo(() => {
    switch (event.priority) {
      case 'urgent':
        return '🔴'
      case 'important':
        return '🟠'
      case 'necessary':
        return '🔵'
      case 'delegate':
        return '🟣'
      case 'optional':
        return '⚪'
      default:
        return ''
    }
  }, [event.priority])

  return (
    <div
      style={eventStyle}
      className={cn(
        'group cursor-pointer overflow-hidden',
        'hover:transform hover:scale-[1.02] hover:shadow-md',
        'transition-all duration-150 ease-out',
        isHovered && 'z-50'
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${event.title}${event.description ? `\n${event.description}` : ''}${event.location ? `\n📍 ${event.location}` : ''}`}
    >
      {/* イベント内容 */}
      <div className="p-2 h-full flex flex-col justify-between">
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-1 min-h-0">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {priorityIcon && (
              <span className="text-xs flex-shrink-0">{priorityIcon}</span>
            )}
            <span 
              className="font-medium text-xs truncate leading-tight"
              style={{ color: event.color }}
            >
              {event.title}
            </span>
          </div>
          
          {/* 削除ボタン（ホバー時のみ表示） */}
          {onDeleteEvent && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs text-gray-500 hover:text-red-500 flex-shrink-0 w-4 h-4 flex items-center justify-center"
              title="削除"
            >
              ×
            </button>
          )}
        </div>

        {/* 時間表示 */}
        <div className="text-xs text-gray-600 mt-1 leading-tight">
          {timeDisplay}
        </div>

        {/* 場所（高さに余裕がある場合のみ） */}
        {event.location && event.layout.height > 40 && (
          <div className="text-xs text-gray-500 mt-1 truncate leading-tight">
            📍 {event.location}
          </div>
        )}

        {/* タグ（高さに余裕がある場合のみ） */}
        {event.tags && event.tags.length > 0 && event.layout.height > 60 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {event.tags.slice(0, 2).map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center px-1 py-0.5 rounded text-xs"
                style={{ 
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  fontSize: '10px'
                }}
              >
                {tag.icon && <span className="mr-0.5">{tag.icon}</span>}
                {tag.name}
              </span>
            ))}
            {event.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{event.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* 重複インジケーター */}
      {event.isRecurring && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xs text-blue-600">🔄</span>
        </div>
      )}

      {/* マルチデイインジケーター */}
      {event.isMultiDay && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // カスタム比較関数でパフォーマンス最適化
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.title === nextProps.event.title &&
    prevProps.event.startDate.getTime() === nextProps.event.startDate.getTime() &&
    prevProps.event.endDate?.getTime() === nextProps.event.endDate?.getTime() &&
    prevProps.event.color === nextProps.event.color &&
    prevProps.event.layout.top === nextProps.event.layout.top &&
    prevProps.event.layout.left === nextProps.event.layout.left &&
    prevProps.event.layout.width === nextProps.event.layout.width &&
    prevProps.event.layout.height === nextProps.event.layout.height &&
    prevProps.dayWidth === nextProps.dayWidth
  )
})

OptimizedEventItem.displayName = 'OptimizedEventItem'

// 仮想スクロール用のビューポート情報
interface ViewportInfo {
  startIndex: number
  endIndex: number
  offsetY: number
}

// 仮想スクロールのためのイベント分割
function useVirtualizedEvents(
  layoutedEvents: LayoutedEvent[],
  viewportHeight: number,
  scrollTop: number
): LayoutedEvent[] {
  return useMemo(() => {
    // スクロール位置から表示範囲を計算
    const viewportTop = scrollTop
    const viewportBottom = scrollTop + viewportHeight + 100 // バッファを追加

    // 表示範囲内のイベントのみをフィルタ
    return layoutedEvents.filter(event => {
      const eventTop = event.layout.top
      const eventBottom = event.layout.top + event.layout.height
      
      return eventBottom >= viewportTop && eventTop <= viewportBottom
    })
  }, [layoutedEvents, viewportHeight, scrollTop])
}

// メインのイベントレンダラー
interface OptimizedEventRendererProps {
  events: CalendarEvent[]
  dates: Date[]
  onEventClick?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  containerRef?: React.RefObject<HTMLElement>
  dayStartHour?: number
  dayEndHour?: number
}

export const OptimizedEventRenderer = memo<OptimizedEventRendererProps>(({
  events,
  dates,
  onEventClick,
  onDeleteEvent,
  containerRef,
  dayStartHour = 0,
  dayEndHour = 24
}) => {
  const [viewportInfo, setViewportInfo] = useState({ height: 0, scrollTop: 0 })
  const dayWidth = 100 / dates.length // パーセンテージベースの幅

  // スクロール監視
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    const updateViewport = () => {
      setViewportInfo({
        height: container.clientHeight,
        scrollTop: container.scrollTop
      })
    }

    updateViewport()
    container.addEventListener('scroll', updateViewport, { passive: true })
    
    const resizeObserver = new ResizeObserver(updateViewport)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', updateViewport)
      resizeObserver.disconnect()
    }
  }, [containerRef])

  // 日付別にイベントをグループ化
  const eventsByDate = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>()
    
    dates.forEach(date => {
      const dateKey = date.toDateString()
      groups.set(dateKey, [])
    })

    events.forEach(event => {
      const eventDate = event.startDate
      const dateKey = eventDate.toDateString()
      
      if (groups.has(dateKey)) {
        groups.get(dateKey)!.push(event)
      }
    })

    return groups
  }, [events, dates])

  // 各日のレイアウト計算をメモ化
  const layoutedEventsByDate = useMemo(() => {
    const layouts = new Map<string, LayoutedEvent[]>()
    
    eventsByDate.forEach((dayEvents, dateKey) => {
      if (dayEvents.length > 0) {
        const layouted = applyEventLayout(
          dayEvents,
          dayStartHour,
          dayEndHour,
          HOUR_HEIGHT
        )
        layouts.set(dateKey, layouted)
      } else {
        layouts.set(dateKey, [])
      }
    })

    return layouts
  }, [eventsByDate, dayStartHour, dayEndHour])

  // 全てのレイアウト済みイベントを統合
  const allLayoutedEvents = useMemo(() => {
    const allEvents: LayoutedEvent[] = []
    let dayIndex = 0

    dates.forEach(date => {
      const dateKey = date.toDateString()
      const dayEvents = layoutedEventsByDate.get(dateKey) || []
      
      // 各イベントに日付のオフセットを適用
      dayEvents.forEach(event => {
        const adjustedEvent = {
          ...event,
          layout: {
            ...event.layout,
            left: event.layout.left + (dayIndex * 100) // 日付のオフセットを追加
          }
        }
        allEvents.push(adjustedEvent)
      })
      
      dayIndex++
    })

    return allEvents
  }, [dates, layoutedEventsByDate])

  // 仮想スクロール適用
  const visibleEvents = useVirtualizedEvents(
    allLayoutedEvents,
    viewportInfo.height,
    viewportInfo.scrollTop
  )

  // デバッグ情報（開発時のみ）
  const debugInfo = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      return {
        totalEvents: events.length,
        visibleEvents: visibleEvents.length,
        layoutGroups: layoutedEventsByDate.size,
        maxColumns: Math.max(...Array.from(layoutedEventsByDate.values()).flat().map(e => e.layout.totalColumns))
      }
    }
    return null
  }, [events.length, visibleEvents.length, layoutedEventsByDate])

  return (
    <>
      {/* デバッグ情報（開発時のみ） */}
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50">
          <div>Total: {debugInfo.totalEvents}</div>
          <div>Visible: {debugInfo.visibleEvents}</div>
          <div>Groups: {debugInfo.layoutGroups}</div>
          <div>Max Cols: {debugInfo.maxColumns}</div>
        </div>
      )}

      {/* イベントレンダリング */}
      {visibleEvents.map(event => (
        <OptimizedEventItem
          key={event.id}
          event={event}
          onEventClick={onEventClick}
          onDeleteEvent={onDeleteEvent}
          dayWidth={dayWidth}
        />
      ))}
    </>
  )
})

OptimizedEventRenderer.displayName = 'OptimizedEventRenderer'

// パフォーマンス測定用のカスタムフック
export function usePerformanceMonitor(events: CalendarEvent[]) {
  const renderTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  
  useEffect(() => {
    const startTime = performance.now()
    
    const measureEnd = () => {
      const endTime = performance.now()
      renderTimeRef.current = endTime - startTime
      frameCountRef.current++
      
      if (process.env.NODE_ENV === 'development' && events.length > 50) {
        console.log(`🚀 レンダリング時間: ${renderTimeRef.current.toFixed(2)}ms (${events.length}イベント)`)
        
        if (renderTimeRef.current > 50) {
          console.warn('⚠️ レンダリングが遅い可能性があります')
        }
      }
    }
    
    // 次のフレームで測定
    requestAnimationFrame(measureEnd)
  })
  
  return {
    lastRenderTime: renderTimeRef.current,
    frameCount: frameCountRef.current
  }
}