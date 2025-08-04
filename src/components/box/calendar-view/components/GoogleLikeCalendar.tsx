'use client'

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// FullCalendar v6ではCSSが自動的に含まれる

// import styles from './GoogleLikeCalendar.module.css' // 一時的に無効化
import type { 
  EventInput, 
  DateSelectArg, 
  EventChangeArg,
  EventClickArg,
  CalendarApi 
} from '@fullcalendar/core'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { CalendarEvent } from '../types'

interface GoogleLikeCalendarProps {
  events: CalendarEvent[]
  currentDate: Date
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onUpdateEvent?: (event: CalendarEvent) => void
  onDateSelect?: (date: Date) => void
  initialView?: 'timeGridWeek' | 'timeGridDay'
  planRecordMode?: 'plan' | 'record' | 'both' // BoxLog独自機能
  tasks?: any[] // Task配列（Record表示用）
}

export function GoogleLikeCalendar({
  events,
  currentDate,
  onEventClick,
  onCreateEvent,
  onUpdateEvent,
  onDateSelect,
  initialView = 'timeGridWeek',
  planRecordMode = 'plan',
  tasks = []
}: GoogleLikeCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [currentView, setCurrentView] = useState(initialView)
  const [isLoading, setIsLoading] = useState(false)

  // CalendarEventとTaskをFullCalendar形式に変換
  const fullCalendarEvents: EventInput[] = useMemo(() => {
    const eventItems: EventInput[] = []
    
    // Planイベントを追加
    if (planRecordMode === 'plan' || planRecordMode === 'both') {
      events.forEach(event => {
        eventItems.push({
          id: `event-${event.id}`,
          title: event.title,
          start: event.startDate,
          end: event.endDate,
          backgroundColor: event.color || '#3b82f6',
          borderColor: event.color || '#3b82f6',
          textColor: '#ffffff',
          extendedProps: {
            type: 'plan',
            description: event.description,
            location: event.location,
            url: event.url,
            priority: event.priority,
            status: event.status,
            originalEvent: event
          }
        })
      })
    }
    
    // Recordタスクを追加
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      tasks.forEach(task => {
        if (task.actual_start && task.actual_end) {
          eventItems.push({
            id: `task-${task.id}`,
            title: `📝 ${task.title}`,
            start: new Date(task.actual_start),
            end: new Date(task.actual_end),
            backgroundColor: '#10b981', // green for records
            borderColor: '#10b981',
            textColor: '#ffffff',
            extendedProps: {
              type: 'record',
              satisfaction: task.satisfaction,
              focus_level: task.focus_level,
              energy_level: task.energy_level,
              memo: task.memo,
              originalTask: task
            }
          })
        }
      })
    }
    
    return eventItems
  }, [events, tasks, planRecordMode])

  // イベントクリック処理
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const eventType = clickInfo.event.extendedProps.type
    if (eventType === 'plan') {
      const originalEvent = clickInfo.event.extendedProps.originalEvent as CalendarEvent
      if (onEventClick && originalEvent) {
        onEventClick(originalEvent)
      }
    } else if (eventType === 'record') {
      const originalTask = clickInfo.event.extendedProps.originalTask
      console.log('📝 Record clicked:', originalTask)
      // TODO: Record専用のクリックハンドラーを実装
    }
  }, [onEventClick])

  // 日付/時間選択処理（ドラッグで範囲選択）
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (onCreateEvent) {
      const startTime = selectInfo.allDay 
        ? undefined 
        : format(selectInfo.start, 'HH:mm')
      const endTime = selectInfo.allDay 
        ? undefined 
        : format(selectInfo.end, 'HH:mm')
      
      const timeRange = startTime && endTime ? `${startTime}-${endTime}` : startTime
      onCreateEvent(selectInfo.start, timeRange)
    }
    
    // 選択をクリア
    const calendarApi = selectInfo.view.calendar
    calendarApi.unselect()
  }, [onCreateEvent])

  // イベント変更処理（ドラッグ&ドロップ、リサイズ）
  const handleEventChange = useCallback(async (changeInfo: EventChangeArg) => {
    if (onUpdateEvent) {
      setIsLoading(true)
      try {
        const originalEvent = changeInfo.event.extendedProps.originalEvent as CalendarEvent
        const updatedEvent: CalendarEvent = {
          ...originalEvent,
          startDate: changeInfo.event.start!,
          endDate: changeInfo.event.end || changeInfo.event.start!,
        }
        await onUpdateEvent(updatedEvent)
        console.log('✅ FullCalendar: Event updated successfully')
      } catch (error) {
        console.error('❌ FullCalendar: Failed to update event:', error)
        // 失敗時は元の位置に戻す
        changeInfo.revert()
      } finally {
        setIsLoading(false)
      }
    }
  }, [onUpdateEvent])

  // 日付クリック処理
  const handleDateClick = useCallback((dateInfo: any) => {
    if (onDateSelect) {
      onDateSelect(dateInfo.date)
    }
  }, [onDateSelect])

  // カレンダーAPI取得
  const getCalendarApi = (): CalendarApi | null => {
    return calendarRef.current?.getApi() || null
  }

  // ビュー変更
  const changeView = (view: string) => {
    const api = getCalendarApi()
    if (api) {
      api.changeView(view)
      setCurrentView(view as any)
    }
  }

  // ナビゲーション
  const navigatePrev = () => {
    const api = getCalendarApi()
    if (api) api.prev()
  }

  const navigateNext = () => {
    const api = getCalendarApi()
    if (api) api.next()
  }

  const navigateToday = () => {
    const api = getCalendarApi()
    if (api) api.today()
  }

  const navigateToDate = (date: Date) => {
    const api = getCalendarApi()
    if (api) api.gotoDate(date)
  }

  // ダークモード検出
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }
    
    checkDarkMode()
    
    // DOMの変更を監視してダークモード切り替えを検出
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })
    
    return () => observer.disconnect()
  }, [])
  
  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const api = getCalendarApi()
      if (!api) return
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            // 新しいイベント作成（現在時刻）
            if (onCreateEvent) {
              onCreateEvent(new Date())
            }
            break
          case 't':
            e.preventDefault()
            api.today()
            break
          case 'ArrowLeft':
            e.preventDefault()
            api.prev()
            break
          case 'ArrowRight':
            e.preventDefault()
            api.next()
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onCreateEvent])

  return (
    <div 
      className="h-full flex flex-col bg-white dark:bg-gray-900"
      data-theme={isDarkMode ? 'dark' : 'light'}
      data-mode={planRecordMode}
    >
      {/* ローディング表示 */}
      {isLoading && (
        <div className="absolute top-2 right-2 z-50">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* カスタムヘッダー（Googleカレンダー風） */}
      {(
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={navigateToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Today
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrev}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              ←
            </button>
            <button
              onClick={navigateNext}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              →
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentView === 'timeGridDay' 
              ? format(currentDate, 'yyyy年M月d日（E）', { locale: ja })
              : format(currentDate, 'MMMM yyyy', { locale: ja })
            }
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentView}
            onChange={(e) => changeView(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="timeGridDay">Day</option>
            <option value="timeGridWeek">Week</option>
            <option value="dayGridMonth">Month</option>
            <option value="multiMonthYear">Year</option>
          </select>
        </div>
      </div>
      )}

      {/* FullCalendar - 終日スロットなし */}
      <div style={{ padding: '16px', height: '600px' }}>
        <FullCalendar
          plugins={[timeGridPlugin]}
          initialView="timeGridDay"
          height={500}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay'
          }}
          events={[
            { title: 'テストイベント', start: '2025-08-04T10:00:00', end: '2025-08-04T11:00:00' }
          ]}
          allDaySlot={false}
        />
      </div>
    </div>
  )
}

// 外部から使用できるAPIを提供
export type { GoogleLikeCalendarProps }