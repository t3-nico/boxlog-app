'use client'

import React, { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { colors, typography, spacing, componentRadius } from '@/config/theme'
import { ScheduleEventCard } from './ScheduleEventCard'
import type { EventDateGroup, ScheduleEvent } from '../ScheduleView.types'

interface ScheduleDateSectionProps {
  dateGroup: EventDateGroup
  expandedEvents: Set<string>
  onEventClick?: (event: ScheduleEvent) => void
  onEventEdit?: (event: ScheduleEvent) => void
  onEventDelete?: (eventId: string) => void
  onDateClick?: (date: Date) => void
  onToggleEventExpand?: (eventId: string) => void
  className?: string
  showQuickActions?: boolean
  showFreeSlots?: boolean
}

export function ScheduleDateSection({
  dateGroup,
  expandedEvents,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onDateClick,
  onToggleEventExpand,
  className,
  showQuickActions = true,
  showFreeSlots = false
}: ScheduleDateSectionProps) {
  const [isHoveringHeader, setIsHoveringHeader] = useState(false)

  // 日付ヘッダークリックハンドラー
  const handleDateClick = useCallback(() => {
    onDateClick?.(dateGroup.date)
  }, [dateGroup.date, onDateClick])

  // 空き時間クリックハンドラー
  const handleFreeSlotClick = useCallback((startTime: Date) => {
    onDateClick?.(startTime)
  }, [onDateClick])

  // 今日かどうかでスタイルを調整
  const isToday = dateGroup.isToday
  const isPast = dateGroup.isPast

  return (
    <section
      className={cn('mb-6', className)}
      role="region"
      aria-label={`${dateGroup.label}の予定`}
      id={`schedule-section-${format(dateGroup.date, 'yyyy-MM-dd')}`}
    >
      {/* 日付ヘッダー */}
      <div
        className={cn(
          'sticky top-0 z-10',
          'bg-white dark:bg-gray-900',
          'border-b border-gray-200 dark:border-gray-700',
          'mb-4',
          'cursor-pointer',
          'transition-colors duration-200',
          isHoveringHeader && 'bg-gray-50 dark:bg-gray-800'
        )}
        onClick={handleDateClick}
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
        role="button"
        tabIndex={0}
        aria-label={`${dateGroup.label}に新しい予定を作成`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleDateClick()
          }
        }}
      >
        <div className={cn(spacing.component.card, 'py-3')}>
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                isToday ? typography.heading.h1 : typography.heading.h3,
                isToday 
                  ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                  : isPast 
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-gray-100'
              )}
            >
              {dateGroup.label}
              {isToday && (
                <span className={cn(
                  'ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                )}>
                  今日
                </span>
              )}
            </h2>
            
            <div className="flex items-center gap-2">
              {/* イベント数 */}
              <span className={cn(
                typography.body.small,
                'text-gray-500 dark:text-gray-400'
              )}>
                {dateGroup.events.length}件
              </span>
              
              {/* 新規作成ヒント（ホバー時） */}
              {isHoveringHeader && (
                <span className={cn(
                  typography.special.caption,
                  'text-gray-400 dark:text-gray-500',
                  'opacity-75'
                )}>
                  クリックで新規作成
                </span>
              )}
              
              {/* 今日マーカー */}
              {isToday && (
                <div
                  className="w-2 h-2 rounded-full bg-blue-500"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* イベント一覧 */}
      <div className={cn(spacing.component.card)}>
        {dateGroup.events.length > 0 ? (
          <div className="space-y-3">
            {dateGroup.events.map((event) => (
              <ScheduleEventCard
                key={event.id}
                event={event}
                isExpanded={expandedEvents.has(event.id)}
                showQuickActions={showQuickActions}
                onEventClick={onEventClick}
                onEventEdit={onEventEdit}
                onEventDelete={onEventDelete}
                onToggleExpand={onToggleEventExpand}
                className={cn(
                  isPast && 'opacity-75'
                )}
              />
            ))}
          </div>
        ) : (
          /* 空状態 */
          <div className={cn(
            'py-8 text-center',
            componentRadius.card.base,
            'bg-gray-50 dark:bg-gray-800/50',
            'border-2 border-dashed border-gray-300 dark:border-gray-600'
          )}>
            <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className={cn(typography.body.DEFAULT, 'text-gray-500 dark:text-gray-400 mb-2')}>
              この日に予定はありません
            </p>
            <button
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                componentRadius.button.md,
                'bg-blue-600 text-white hover:bg-blue-700',
                'dark:bg-blue-500 dark:hover:bg-blue-600',
                'transition-colors duration-200',
                'text-sm font-medium'
              )}
              onClick={handleDateClick}
            >
              <PlusIcon className="w-4 h-4" />
              予定を追加
            </button>
          </div>
        )}

        {/* 空き時間表示（オプション） */}
        {showFreeSlots && dateGroup.freeSlots && dateGroup.freeSlots.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className={cn(
              typography.body.small,
              'text-gray-600 dark:text-gray-400 mb-2 font-medium'
            )}>
              空き時間
            </h3>
            <div className="space-y-2">
              {dateGroup.freeSlots.map((slot, index) => (
                <button
                  key={index}
                  className={cn(
                    'w-full text-left p-3',
                    componentRadius.card.compact,
                    'bg-green-50 dark:bg-green-900/20',
                    'border border-green-200 dark:border-green-800',
                    'hover:bg-green-100 dark:hover:bg-green-900/30',
                    'transition-colors duration-200'
                  )}
                  onClick={() => handleFreeSlotClick(slot.startTime)}
                  aria-label={`${slot.label}に予定を作成`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className={cn(
                      typography.body.small,
                      'text-green-700 dark:text-green-300'
                    )}>
                      {slot.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 週末の場合の装飾 */}
        {dateGroup.isWeekend && !isPast && (
          <div className={cn(
            'mt-4 p-3',
            componentRadius.card.compact,
            'bg-amber-50 dark:bg-amber-900/20',
            'border border-amber-200 dark:border-amber-800'
          )}>
            <div className="flex items-center gap-2">
              <SunIcon className="w-4 h-4 text-amber-500" />
              <span className={cn(
                typography.body.small,
                'text-amber-700 dark:text-amber-300'
              )}>
                週末です
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// アイコンコンポーネント
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}