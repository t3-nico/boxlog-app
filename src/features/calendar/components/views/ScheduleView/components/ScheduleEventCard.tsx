'use client'

import React, { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { colors, typography, spacing, componentRadius, elevationPatterns } from '@/config/theme'
import type { ScheduleEvent, QuickAction } from '../ScheduleView.types'

interface ScheduleEventCardProps {
  event: ScheduleEvent
  isExpanded?: boolean
  showQuickActions?: boolean
  onEventClick?: (event: ScheduleEvent) => void
  onEventEdit?: (event: ScheduleEvent) => void
  onEventDelete?: (eventId: string) => void
  onToggleExpand?: (eventId: string) => void
  className?: string
}

export function ScheduleEventCard({
  event,
  isExpanded = false,
  showQuickActions = false,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onToggleExpand,
  className
}: ScheduleEventCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // イベントクリックハンドラー
  const handleEventClick = useCallback(() => {
    onEventClick?.(event)
  }, [event, onEventClick])

  // 展開トグルハンドラー
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpand?.(event.id)
  }, [event.id, onToggleExpand])

  // 編集ハンドラー
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEventEdit?.(event)
  }, [event, onEventEdit])

  // 削除ハンドラー
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEventDelete?.(event.id)
  }, [event.id, onEventDelete])

  // 時間フォーマット
  const getTimeDisplay = () => {
    if (event.isAllDay) {
      return '終日'
    }
    
    const startTime = format(event.startDate, 'H:mm', { locale: ja })
    const endTime = format(event.endDate, 'H:mm', { locale: ja })
    
    return `${startTime} - ${endTime}`
  }

  // イベントの色（カスタム色または既定色）
  const eventColor = event.color || colors.primary.DEFAULT

  // 参加者数の表示
  const getAttendeesDisplay = () => {
    if (!event.attendees || event.attendees.length === 0) return null
    
    const count = event.attendees.length
    return count === 1 ? '1人の参加者' : `${count}人の参加者`
  }

  return (
    <div
      className={cn(
        'group relative',
        componentRadius.card.base,
        elevationPatterns.cardHover,
        'transition-all duration-200',
        'cursor-pointer',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'hover:border-gray-300 dark:hover:border-gray-600',
        isExpanded && 'ring-2 ring-blue-500 ring-opacity-50',
        className
      )}
      onClick={handleEventClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      tabIndex={0}
      aria-label={`${event.title}の予定 ${getTimeDisplay()}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleEventClick()
        }
      }}
    >
      {/* メインコンテンツエリア */}
      <div className={cn(spacing.cardVariants.compact, 'flex items-start gap-3')}>
        {/* 時刻インジケーター */}
        <div className="flex-shrink-0 pt-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: eventColor }}
            aria-hidden="true"
          />
        </div>
        
        {/* イベント情報 */}
        <div className="flex-1 min-w-0">
          {/* 時刻とタイトル */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className={cn(typography.body.small, 'text-gray-600 dark:text-gray-400 mb-1')}>
                {getTimeDisplay()}
              </div>
              <h3 className={cn(
                typography.heading.h4,
                'text-gray-900 dark:text-gray-100',
                'truncate'
              )}>
                {event.title}
              </h3>
            </div>
            
            {/* クイックアクションボタン */}
            {(showQuickActions || isHovered) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className={cn(
                    'p-1.5 rounded-md',
                    'text-gray-500 hover:text-gray-700',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'transition-colors'
                  )}
                  onClick={handleEdit}
                  title="編集"
                  aria-label={`${event.title}を編集`}
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  className={cn(
                    'p-1.5 rounded-md',
                    'text-gray-500 hover:text-red-600',
                    'hover:bg-red-50 dark:hover:bg-red-900/20',
                    'transition-colors'
                  )}
                  onClick={handleDelete}
                  title="削除"
                  aria-label={`${event.title}を削除`}
                >
                  <DeleteIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* 場所 */}
          {event.location && (
            <div className={cn(
              typography.body.small,
              'text-gray-600 dark:text-gray-400',
              'flex items-center gap-1.5 mb-1'
            )}>
              <LocationIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          {/* 参加者 */}
          {getAttendeesDisplay() && (
            <div className={cn(
              typography.body.small,
              'text-gray-600 dark:text-gray-400',
              'flex items-center gap-1.5 mb-1'
            )}>
              <PeopleIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{getAttendeesDisplay()}</span>
            </div>
          )}
          
          {/* ビデオ会議リンク */}
          {event.meetingUrl && (
            <div className={cn(
              typography.body.small,
              'text-blue-600 dark:text-blue-400',
              'flex items-center gap-1.5 mb-1'
            )}>
              <VideoIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>ビデオ会議に参加</span>
            </div>
          )}
          
          {/* 展開可能な詳細情報 */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {/* 説明 */}
              {event.description && (
                <div className="mb-3">
                  <div className={cn(typography.special.caption, 'text-gray-500 mb-1')}>
                    説明
                  </div>
                  <div className={cn(typography.body.small, 'text-gray-700 dark:text-gray-300')}>
                    {event.description}
                  </div>
                </div>
              )}
              
              {/* 参加者詳細 */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="mb-3">
                  <div className={cn(typography.special.caption, 'text-gray-500 mb-2')}>
                    参加者
                  </div>
                  <div className="space-y-1">
                    {event.attendees.slice(0, 5).map(attendee => (
                      <div key={attendee.id} className="flex items-center gap-2">
                        {attendee.avatar ? (
                          <img
                            src={attendee.avatar}
                            alt={attendee.name}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600" />
                        )}
                        <span className={cn(typography.body.small, 'text-gray-700 dark:text-gray-300')}>
                          {attendee.name}
                        </span>
                        {attendee.responseStatus && (
                          <ResponseStatusBadge status={attendee.responseStatus} />
                        )}
                      </div>
                    ))}
                    {event.attendees.length > 5 && (
                      <div className={cn(typography.special.caption, 'text-gray-500')}>
                        他{event.attendees.length - 5}人
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 展開ボタン */}
          {(event.description || (event.attendees && event.attendees.length > 0)) && (
            <button
              className={cn(
                'mt-2 flex items-center gap-1',
                typography.special.caption,
                'text-gray-500 hover:text-gray-700',
                'transition-colors'
              )}
              onClick={handleToggleExpand}
              aria-label={isExpanded ? '詳細を隠す' : '詳細を表示'}
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="w-3 h-3" />
                  <span>詳細を隠す</span>
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-3 h-3" />
                  <span>詳細を表示</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 参加者レスポンス状態のバッジ
function ResponseStatusBadge({ status }: { status: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'accepted':
        return { label: '承諾', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
      case 'declined':
        return { label: '辞退', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
      case 'tentative':
        return { label: '仮', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
      case 'needsAction':
        return { label: '未回答', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' }
      default:
        return { label: '', className: '' }
    }
  }

  const { label, className } = getStatusConfig()
  
  if (!label) return null

  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
      className
    )}>
      {label}
    </span>
  )
}

// アイコンコンポーネント（実際のプロジェクトではLucide Reactなどを使用）
function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}