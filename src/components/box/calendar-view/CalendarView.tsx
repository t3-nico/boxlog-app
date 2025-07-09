'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { CalendarHeader } from './CalendarHeader'
import { DayView } from './views/DayView'
import { ThreeDayView } from './views/ThreeDayView'
import { WeekView } from './views/WeekView'
import { TwoWeekView } from './views/TwoWeekView'
import { 
  calculateViewDateRange, 
  getNextPeriod, 
  getPreviousPeriod,
  filterTasksForDateRange,
  isValidViewType
} from './utils/calendar-helpers'
import type { CalendarViewType, CalendarViewProps, Task } from './types'

export function CalendarView({ className }: CalendarViewProps) {
  const [viewType, setViewType] = useState<CalendarViewType>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // LocalStorageからビュータイプを復元
  useEffect(() => {
    const saved = localStorage.getItem('calendar-view-type')
    if (saved && isValidViewType(saved)) {
      setViewType(saved as CalendarViewType)
    }
  }, [])

  // ビュータイプをLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('calendar-view-type', viewType)
  }, [viewType])

  // ビューに応じた期間計算
  const viewDateRange = useMemo(() => {
    return calculateViewDateRange(viewType, currentDate)
  }, [viewType, currentDate])
  
  // タスク取得（一時的にモックデータを使用）
  const tasks: Task[] = useMemo(() => [
    {
      id: '1',
      title: 'サンプルタスク1',
      planned_start: new Date().toISOString(),
      planned_end: new Date(Date.now() + 3600000).toISOString(),
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      title: 'サンプルタスク2',
      planned_start: new Date(Date.now() + 86400000).toISOString(),
      planned_end: new Date(Date.now() + 90000000).toISOString(),
      status: 'in_progress',
      priority: 'medium'
    }
  ], [])

  const filteredTasks = useMemo(() => {
    return filterTasksForDateRange(tasks, viewDateRange)
  }, [tasks, viewDateRange])
  
  // ナビゲーション関数
  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    switch (direction) {
      case 'prev':
        setCurrentDate(prev => getPreviousPeriod(viewType, prev))
        break
      case 'next':
        setCurrentDate(prev => getNextPeriod(viewType, prev))
        break
      case 'today':
        setCurrentDate(new Date())
        break
    }
  }, [viewType])
  
  // ビュー切り替え
  const handleViewChange = useCallback((newView: CalendarViewType) => {
    setViewType(newView)
  }, [])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault()
            handleNavigate('prev')
            break
          case 'ArrowRight':
            e.preventDefault()
            handleNavigate('next')
            break
          case 't':
            e.preventDefault()
            handleNavigate('today')
            break
          case '1':
            e.preventDefault()
            handleViewChange('day')
            break
          case '3':
            e.preventDefault()
            handleViewChange('3day')
            break
          case '7':
            e.preventDefault()
            handleViewChange('week')
            break
          case '5':
            e.preventDefault()
            handleViewChange('week-no-weekend')
            break
          case '14':
            e.preventDefault()
            handleViewChange('2week')
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [viewType, handleNavigate, handleViewChange])

  // ビューコンポーネントのレンダリング
  const renderView = () => {
    const commonProps = {
      dateRange: viewDateRange,
      tasks: filteredTasks,
      currentDate
    }

    switch (viewType) {
      case 'day':
        return <DayView {...commonProps} />
      case '3day':
        return <ThreeDayView {...commonProps} />
      case 'week':
        return <WeekView {...commonProps} />
      case 'week-no-weekend':
        return <WeekView {...commonProps} showWeekends={false} />
      case '2week':
        return <TwoWeekView {...commonProps} />
      default:
        return <DayView {...commonProps} />
    }
  }
  
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <CalendarHeader
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onViewChange={handleViewChange}
      />
      
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
    </div>
  )
}