'use client'

import React, { createContext, useContext, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import type { CalendarViewType } from '../types/calendar.types'

interface CalendarNavigationContextValue {
  currentDate: Date
  viewType: CalendarViewType
  navigateToDate: (date: Date) => void
  changeView: (view: CalendarViewType) => void
  navigateRelative: (direction: 'prev' | 'next' | 'today') => void
}

const CalendarNavigationContext = createContext<CalendarNavigationContextValue | null>(null)

export function CalendarNavigationProvider({ 
  children,
  initialDate = new Date(),
  initialView = 'week' as CalendarViewType
}: { 
  children: React.ReactNode
  initialDate?: Date
  initialView?: CalendarViewType
}) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [viewType, setViewType] = useState<CalendarViewType>(initialView)
  
  // 初期値の変更を検知して状態を更新（一度だけ）
  const [isInitialized, setIsInitialized] = React.useState(false)
  
  React.useEffect(() => {
    if (!isInitialized) {
      console.log('🏁 CalendarNavigationContext: Initial setup', { initialDate, initialView })
      setCurrentDate(initialDate)
      setViewType(initialView)
      setIsInitialized(true)
    }
  }, [initialDate, initialView, isInitialized])

  const navigateToDate = useCallback((date: Date) => {
    console.log('🔄 navigateToDate called:', { date, viewType, currentDate })
    setCurrentDate(date)
    const dateString = format(date, 'yyyy-MM-dd')
    const newUrl = `/calendar/${viewType}?date=${dateString}`
    console.log('🚀 Pushing to:', newUrl)
    
    // router.push の代わりに window.location を試す
    try {
      router.push(newUrl)
      console.log('✅ router.push executed')
    } catch (error) {
      console.error('❌ router.push failed:', error)
      // フォールバック
      window.location.href = newUrl
    }
  }, [router, viewType, currentDate])

  const changeView = useCallback((view: CalendarViewType) => {
    setViewType(view)
    const dateString = format(currentDate, 'yyyy-MM-dd')
    router.push(`/calendar/${view}?date=${dateString}`)
  }, [router, currentDate])

  const navigateRelative = useCallback((direction: 'prev' | 'next' | 'today') => {
    console.log('🧭 NavigateRelative called:', { direction, viewType, currentDate })
    let newDate: Date

    if (direction === 'today') {
      newDate = new Date()
    } else {
      const multiplier = direction === 'next' ? 1 : -1
      newDate = new Date(currentDate)
      
      switch (viewType) {
        case 'day':
        case 'split-day':
          newDate.setDate(currentDate.getDate() + (1 * multiplier))
          break
        case '3day':
          newDate.setDate(currentDate.getDate() + (3 * multiplier))
          break
        case 'week':
        case 'week-no-weekend':
          newDate.setDate(currentDate.getDate() + (7 * multiplier))
          break
        case '2week':
          newDate.setDate(currentDate.getDate() + (14 * multiplier))
          break
        case 'month':
          newDate.setMonth(currentDate.getMonth() + multiplier)
          break
        default:
          newDate.setDate(currentDate.getDate() + (7 * multiplier))
      }
    }
    
    console.log('🧭 NavigateRelative computed new date:', newDate)
    navigateToDate(newDate)
  }, [currentDate, viewType, navigateToDate])

  return (
    <CalendarNavigationContext.Provider value={{
      currentDate,
      viewType,
      navigateToDate,
      changeView,
      navigateRelative
    }}>
      {children}
    </CalendarNavigationContext.Provider>
  )
}

export function useCalendarNavigation() {
  const context = useContext(CalendarNavigationContext)
  if (!context) {
    // カレンダーページ以外ではnullを返す
    return null
  }
  return context
}