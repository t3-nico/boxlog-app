'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { format, startOfDay, isToday, addDays, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { colors, typography, spacing } from '@/config/theme'
import { CalendarViewAnimation } from '../../animations/ViewTransition'
import { ScheduleDateSection } from './components/ScheduleDateSection'
import { ChevronLeftIcon, ChevronRightIcon } from './components/ChevronIcons'
import { groupEventsByDate, findNextEvent, getTodayRemainingEvents } from './utils/dateGrouping'
import type { ScheduleViewProps, ScheduleEvent, ScheduleLoadingState, ScheduleErrorState } from './ScheduleView.types'

/**
 * ScheduleView - Google Calendar風のスケジュール表示
 * アジェンダビューとしてイベントを時系列で表示
 */
export function ScheduleView({
  events = [],
  dateRange,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onDateClick,
  onNavigate,
  onDateRangeChange,
  groupBy = 'day',
  showWeekends = true,
  timezone,
  currentDate = new Date(),
  displayDays = 14,
  isLoading = false,
  className
}: ScheduleViewProps) {
  // 内部状態管理
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [loadingState, setLoadingState] = useState<ScheduleLoadingState>({ isLoading: false })
  const [errorState, setErrorState] = useState<ScheduleErrorState | null>(null)
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null)
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const dateRefsMap = useRef<Map<string, HTMLElement>>(new Map())
  
  // 表示期間の生成（currentDateから指定日数分）
  const displayDateRange = useMemo(() => {
    const startDate = startOfDay(currentDate)
    const dates: Date[] = []
    
    for (let i = 0; i < displayDays; i++) {
      const date = addDays(startDate, i)
      // 週末表示がOFFの場合は土日をスキップ
      if (!showWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        continue
      }
      dates.push(date)
    }
    
    return {
      start: dates[0] || startDate,
      end: dates[dates.length - 1] || startDate,
      dates
    }
  }, [currentDate, displayDays, showWeekends])

  // イベントグループ化（表示期間でフィルタ）
  const eventGroups = useMemo(() => {
    try {
      // 表示期間内のイベントのみをフィルタ
      const filteredEvents = events.filter(event => {
        const eventDate = startOfDay(event.startDate)
        return displayDateRange.dates.some(date => isSameDay(eventDate, date))
      })
      
      const groups = groupEventsByDate(filteredEvents, {
        showWeekends,
        currentDate,
        groupBy,
        displayDates: displayDateRange.dates // 表示する日付を明示的に渡す
      })
      
      setErrorState(null)
      return groups
    } catch (error) {
      console.error('Failed to group events:', error)
      setErrorState({
        type: 'load_error',
        message: 'イベントの読み込みに失敗しました',
        retry: () => window.location.reload()
      })
      return []
    }
  }, [events, showWeekends, currentDate, groupBy, displayDateRange])
  
  // 今日の残り予定数
  const todayRemainingCount = useMemo(() => 
    getTodayRemainingEvents(events, new Date()), [events]
  )
  
  // 次の予定
  const nextEvent = useMemo(() => 
    findNextEvent(events, new Date()), [events]
  )
  
  // イベント展開/折りたたみトグル
  const handleToggleEventExpand = useCallback((eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }, [])
  
  // ナビゲーションハンドラー
  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    if (onNavigate) {
      onNavigate(direction)
    }
  }, [onNavigate])
  
  // 今日へスクロール（表示範囲内でのみ）
  const scrollToToday = useCallback(() => {
    if (onNavigate) {
      onNavigate('today')
      return
    }
    
    const todayKey = format(new Date(), 'yyyy-MM-dd')
    const todayElement = dateRefsMap.current.get(todayKey)
    
    if (todayElement) {
      todayElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }, [onNavigate])
  
  // 次の予定へスクロール
  const scrollToNextEvent = useCallback(() => {
    if (!nextEvent) return
    
    const eventDateKey = format(nextEvent.startDate, 'yyyy-MM-dd')
    const eventElement = dateRefsMap.current.get(eventDateKey)
    
    if (eventElement) {
      eventElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      setFocusedEventId(nextEvent.id)
      
      // フォーカス解除（3秒後）
      setTimeout(() => setFocusedEventId(null), 3000)
    }
  }, [nextEvent])
  
  // 初期スクロール位置設定（今日の日付にスクロール）
  useEffect(() => {
    if (eventGroups.length === 0) return
    
    const timer = setTimeout(() => {
      const todayKey = format(new Date(), 'yyyy-MM-dd')
      const todayElement = dateRefsMap.current.get(todayKey)
      
      if (todayElement) {
        todayElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100) // DOM更新後に実行
    
    return () => clearTimeout(timer)
  }, [eventGroups.length])
  
  // エラー状態の表示
  if (errorState) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-64 p-8', className)}>
        <div className="text-center">
          <div className="mb-4">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          </div>
          <h3 className={cn(typography.heading.h3, 'text-gray-900 dark:text-gray-100 mb-2')}>
            エラーが発生しました
          </h3>
          <p className={cn(typography.body.DEFAULT, 'text-gray-600 dark:text-gray-400 mb-4')}>
            {errorState.message}
          </p>
          {errorState.retry && (
            <button
              onClick={errorState.retry}
              className={cn(
                'px-4 py-2 bg-blue-600 text-white rounded-md',
                'hover:bg-blue-700 transition-colors'
              )}
            >
              再試行
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <CalendarViewAnimation viewType="schedule">
      <div 
        className={cn('flex flex-col h-full bg-background', className)}
        role="main"
        aria-label="スケジュール表示"
      >
        {/* ナビゲーションヘッダー */}
        <div className={cn(
          'sticky top-0 z-20',
          'bg-white dark:bg-gray-900',
          'border-b border-gray-200 dark:border-gray-700',
          'shadow-sm'
        )}>
          <div className={cn(spacing.component.card, 'py-4')}>
            <div className="flex items-center justify-between">
              {/* 左側: ナビゲーション */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleNavigate('prev')}
                    className={cn(
                      'p-2 rounded-md',
                      'text-gray-600 dark:text-gray-400',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      'hover:text-gray-900 dark:hover:text-gray-100',
                      'transition-colors'
                    )}
                    aria-label="前の期間"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleNavigate('next')}
                    className={cn(
                      'p-2 rounded-md',
                      'text-gray-600 dark:text-gray-400',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      'hover:text-gray-900 dark:hover:text-gray-100',
                      'transition-colors'
                    )}
                    aria-label="次の期間"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {/* 期間表示 */}
                <div className={cn(typography.body.DEFAULT, 'text-gray-900 dark:text-gray-100')}>
                  {format(displayDateRange.start, 'M月d日', { locale: ja })} - {format(displayDateRange.end, 'M月d日', { locale: ja })}
                </div>
              </div>
              
              {/* 右側: アクション */}
              <div className="flex items-center gap-4">
                {/* 今日の残り件数 */}
                {todayRemainingCount > 0 && (
                  <span className={cn(
                    typography.body.small,
                    'text-blue-600 dark:text-blue-400'
                  )}>
                    今日あと{todayRemainingCount}件
                  </span>
                )}
                
                {/* 今日ボタン */}
                <button
                  onClick={() => handleNavigate('today')}
                  className={cn(
                    'px-3 py-1.5 text-sm',
                    'bg-blue-600 text-white rounded-md',
                    'hover:bg-blue-700 transition-colors'
                  )}
                  aria-label="今日の日付を表示"
                >
                  今日
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* メインコンテンツ */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto"
          role="feed"
          aria-label="スケジュールフィード"
        >
          {eventGroups.length > 0 ? (
            <div className="pb-8">
              {eventGroups.map((dateGroup, index) => (
                <div
                  key={format(dateGroup.date, 'yyyy-MM-dd')}
                  ref={(el) => {
                    if (el) {
                      dateRefsMap.current.set(format(dateGroup.date, 'yyyy-MM-dd'), el)
                    }
                  }}
                >
                  <ScheduleDateSection
                    dateGroup={dateGroup}
                    expandedEvents={expandedEvents}
                    onEventClick={onEventClick}
                    onEventEdit={onEventEdit}
                    onEventDelete={onEventDelete}
                    onDateClick={onDateClick}
                    onToggleEventExpand={handleToggleEventExpand}
                    showFreeSlots={isToday(dateGroup.date)} // 今日のみ空き時間表示
                  />
                </div>
              ))}
            </div>
          ) : !isLoading ? (
            /* 空状態 */
            <div className="flex flex-col items-center justify-center h-64 p-8">
              <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className={cn(typography.heading.h3, 'text-gray-900 dark:text-gray-100 mb-2')}>
                予定がありません
              </h3>
              <p className={cn(typography.body.DEFAULT, 'text-gray-600 dark:text-gray-400 mb-4')}>
                新しい予定を作成してスケジュールを管理しましょう
              </p>
              <button
                onClick={() => onDateClick?.(new Date())}
                className={cn(
                  'px-6 py-3 bg-blue-600 text-white rounded-md',
                  'hover:bg-blue-700 transition-colors',
                  'flex items-center gap-2'
                )}
              >
                <PlusIcon className="w-5 h-5" />
                予定を作成
              </button>
            </div>
          ) : null}
          
          {/* ローディング表示 */}
          {(isLoading || loadingState.isLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <LoadingSpinner className="w-5 h-5 text-blue-600" />
                <span className={cn(typography.body.DEFAULT, 'text-gray-600 dark:text-gray-400')}>
                  {loadingState.loadingText || '読み込み中...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </CalendarViewAnimation>
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

function ExclamationCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg 
      className={cn('animate-spin', className)} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}