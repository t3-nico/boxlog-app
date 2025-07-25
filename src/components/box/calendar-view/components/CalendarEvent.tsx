'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { CalendarEvent } from '@/types/events'
import { cn } from '@/lib/utils'

interface CalendarEventProps {
  event: CalendarEvent
  className?: string
  style?: React.CSSProperties
  onClick?: (event: CalendarEvent) => void
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
  showTime?: boolean
  compact?: boolean
}

export function CalendarEventComponent({
  event,
  className,
  style,
  onClick,
  onEdit,
  onDelete,
  showTime = true,
  compact = false
}: CalendarEventProps) {
  // イベントの表示テキストを決定
  const displayText = useMemo(() => {
    if (compact) {
      return event.title.length > 20 ? `${event.title.slice(0, 20)}...` : event.title
    }
    return event.title
  }, [event.title, compact])

  // 時間表示のフォーマット
  const timeDisplay = useMemo(() => {
    if (!showTime) {
      return ''
    }

    const startTime = format(event.displayStartDate, 'HH:mm')
    
    if (event.isMultiDay) {
      return `${startTime}〜`
    }
    
    const endTime = format(event.displayEndDate, 'HH:mm')
    return `${startTime}-${endTime}`
  }, [event, showTime])

  // 優先度に基づくアイコン
  const getPriorityIcon = () => {
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
  }

  // ステータスに基づくスタイル
  const getStatusStyles = () => {
    switch (event.status) {
      case 'cancelled':
        return 'opacity-50 line-through'
      case 'completed':
        return 'opacity-75'
      case 'in_progress':
        return 'border-2 border-yellow-400'
      case 'planned':
        return 'border border-blue-400'
      case 'inbox':
      default:
        return 'border border-gray-300'
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick?.(event)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(event)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(event.id)
  }

  return (
    <div
      className={cn(
        'group relative rounded-sm border-l-4 px-2 py-1 text-sm cursor-pointer transition-all duration-200',
        'hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]',
        'bg-white dark:bg-gray-800 shadow-sm',
        getStatusStyles(),
        compact && 'px-1 py-0.5 text-xs',
        className
      )}
      style={{
        borderLeftColor: event.color,
        backgroundColor: `${event.color}10`, // 10% opacity background
        ...style
      }}
      onClick={handleClick}
      title={`${event.title}${event.description ? `\n${event.description}` : ''}${event.location ? `\n📍 ${event.location}` : ''}`}
    >
      {/* メインコンテンツ */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* タイトル行 */}
          <div className="flex items-center gap-1">
            {event.priority && (
              <span className="text-xs">{getPriorityIcon()}</span>
            )}
            <span 
              className={cn(
                'font-medium truncate',
                compact ? 'text-xs' : 'text-sm'
              )}
              style={{ color: event.color }}
            >
              {displayText}
            </span>
            {event.items && event.items.length > 0 && (
              <span className="text-xs opacity-60">
                ({event.items.filter(item => item.completed).length}/{event.items.length})
              </span>
            )}
          </div>
          
          {/* 時間表示 */}
          {timeDisplay && (
            <div className={cn('text-xs text-gray-500 dark:text-gray-400 mt-0.5')}>
              {timeDisplay}
            </div>
          )}
          
          {/* 場所表示（コンパクトモードでない場合） */}
          {!compact && event.location && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              📍 {event.location}
            </div>
          )}
          
          {/* タグ表示（コンパクトモードでない場合） */}
          {!compact && event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {event.tags.slice(0, 3).map(tag => (
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
              {event.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{event.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* アクションボタン（ホバー時に表示） */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="w-4 h-4 rounded text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
              title="編集"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="w-4 h-4 rounded text-xs bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 flex items-center justify-center"
              title="削除"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 繰り返しアイコン */}
      {event.isRecurring && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <span className="text-xs text-blue-600 dark:text-blue-400">🔄</span>
        </div>
      )}

      {/* マルチデイインジケーター */}
      {event.isMultiDay && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
      )}
    </div>
  )
}