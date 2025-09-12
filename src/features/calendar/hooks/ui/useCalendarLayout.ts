'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

import type { CalendarViewType } from '../../types/calendar.types'

export type LayoutMode = 'default' | 'compact' | 'fullscreen'
export type SidebarWidth = 'full' | 'collapsed' | 'hidden'
export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

interface CalendarLayoutState {
  sidebarOpen: boolean
  sidebarWidth: SidebarWidth
  layoutMode: LayoutMode
  currentBreakpoint: Breakpoint
  showHeader: boolean
  showSidebar: boolean
  
  // 追加: カレンダー状態
  viewType: CalendarViewType
  currentDate: Date
}

/**
 * カレンダーレイアウト状態管理フック
 * サイドバーの開閉、レスポンシブ対応、レイアウトモード管理、日付・ビューナビゲーション
 */
export function useCalendarLayout(options?: {
  sidebarDefaultOpen?: boolean
  showHeaderDefault?: boolean
  showSidebarDefault?: boolean
  
  // 追加: カレンダー設定
  initialViewType?: CalendarViewType
  initialDate?: Date
  persistSidebarState?: boolean
  sidebarStorageKey?: string
  onViewChange?: (viewType: CalendarViewType) => void
  onDateChange?: (date: Date) => void
}) {
  const {
    sidebarDefaultOpen = true,
    showHeaderDefault = true,
    showSidebarDefault = true,
    
    // カレンダー設定
    initialViewType = 'week',
    initialDate = new Date(),
    persistSidebarState = true,
    sidebarStorageKey = 'calendar-sidebar-collapsed',
    onViewChange,
    onDateChange
  } = options || {}

  // レスポンシブ対応のブレークポイント判定
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('desktop')
  
  // サイドバー状態の永続化対応
  const [state, setState] = useState<CalendarLayoutState>(() => {
    const sidebarOpen = persistSidebarState && typeof window !== 'undefined' 
      ? (() => {
          const stored = localStorage.getItem(sidebarStorageKey)
          return stored ? JSON.parse(stored) : sidebarDefaultOpen
        })()
      : sidebarDefaultOpen

    return {
      sidebarOpen,
      sidebarWidth: 'full',
      layoutMode: 'default',
      currentBreakpoint: 'desktop',
      showHeader: showHeaderDefault,
      showSidebar: showSidebarDefault,
      
      // カレンダー状態
      viewType: initialViewType,
      currentDate: initialDate
    }
  })
  
  // サイドバー状態の永続化
  useEffect(() => {
    if (persistSidebarState && typeof window !== 'undefined') {
      localStorage.setItem(sidebarStorageKey, JSON.stringify(state.sidebarOpen))
    }
  }, [state.sidebarOpen, persistSidebarState, sidebarStorageKey])

  // ブレークポイント判定
  const checkBreakpoint = useCallback((): Breakpoint => {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }, [])

  // サイドバー幅の計算
  const getSidebarWidth = useCallback((
    open: boolean, 
    breakpoint: Breakpoint, 
    showSidebar: boolean
  ): SidebarWidth => {
    if (!showSidebar) return 'hidden'
    
    switch (breakpoint) {
      case 'mobile':
        // モバイルでは常にドロワー形式（hidden扱い）
        return 'hidden'
      case 'tablet':
        // タブレットでは折りたたみ表示
        return open ? 'full' : 'collapsed'
      case 'desktop':
        // デスクトップでは通常表示
        return open ? 'full' : 'collapsed'
      default:
        return 'full'
    }
  }, [])

  // ウィンドウリサイズ対応
  useEffect(() => {
    const handleResize = () => {
      const breakpoint = checkBreakpoint()
      const newSidebarWidth = getSidebarWidth(state.sidebarOpen, breakpoint, state.showSidebar)
      
      setState(prev => ({
        ...prev,
        currentBreakpoint: breakpoint,
        sidebarWidth: newSidebarWidth
      }))
      
      setCurrentBreakpoint(breakpoint)
    }

    // 初回実行
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [state.sidebarOpen, state.showSidebar, checkBreakpoint, getSidebarWidth])

  // サイドバー開閉
  const toggleSidebar = useCallback(() => {
    setState(prev => {
      const newOpen = !prev.sidebarOpen
      const newSidebarWidth = getSidebarWidth(newOpen, prev.currentBreakpoint, prev.showSidebar)
      
      return {
        ...prev,
        sidebarOpen: newOpen,
        sidebarWidth: newSidebarWidth
      }
    })
  }, [getSidebarWidth])

  const setSidebarOpen = useCallback((open: boolean) => {
    setState(prev => {
      const newSidebarWidth = getSidebarWidth(open, prev.currentBreakpoint, prev.showSidebar)
      
      return {
        ...prev,
        sidebarOpen: open,
        sidebarWidth: newSidebarWidth
      }
    })
  }, [getSidebarWidth])

  // レイアウトモード変更
  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setState(prev => ({
      ...prev,
      layoutMode: mode,
      showHeader: mode === 'fullscreen' ? false : showHeaderDefault,
      showSidebar: mode === 'fullscreen' ? false : showSidebarDefault
    }))
  }, [showHeaderDefault, showSidebarDefault])

  // ヘッダー表示/非表示
  const setShowHeader = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showHeader: show }))
  }, [])

  // サイドバー表示/非表示
  const setShowSidebar = useCallback((show: boolean) => {
    setState(prev => {
      const newSidebarWidth = show ? getSidebarWidth(prev.sidebarOpen, prev.currentBreakpoint, true) : 'hidden'
      
      return {
        ...prev,
        showSidebar: show,
        sidebarWidth: newSidebarWidth
      }
    })
  }, [getSidebarWidth])

  // サイドバーの実際の幅（px）を取得
  const getSidebarWidthPx = useCallback((): number => {
    switch (state.sidebarWidth) {
      case 'full': return 256
      case 'collapsed': return 64
      case 'hidden': return 0
      default: return 0
    }
  }, [state.sidebarWidth])

  // カレンダー日付ナビゲーション
  const navigateToDate = useCallback((date: Date) => {
    console.log('📅 navigateToDate called:', date)
    setState(prev => ({ ...prev, currentDate: date }))
    console.log('📅 calling onDateChange with:', date)
    onDateChange?.(date)
  }, [onDateChange])

  const navigateRelative = useCallback((direction: 'prev' | 'next' | 'today') => {
    console.log('📅 navigateRelative called:', { direction, currentViewType: state.viewType, currentDate: state.currentDate })
    let newDate: Date

    if (direction === 'today') {
      newDate = new Date()
    } else {
      const multiplier = direction === 'next' ? 1 : -1
      
      switch (state.viewType) {
        case 'day':
        case 'split-day':
          newDate = new Date(state.currentDate)
          newDate.setDate(state.currentDate.getDate() + (1 * multiplier))
          break
          
        case '3day':
          newDate = new Date(state.currentDate)
          newDate.setDate(state.currentDate.getDate() + (3 * multiplier))
          break
          
        case 'week':
        case 'week-no-weekend':
          newDate = new Date(state.currentDate)
          newDate.setDate(state.currentDate.getDate() + (7 * multiplier))
          break
          
        case '2week':
          newDate = new Date(state.currentDate)
          newDate.setDate(state.currentDate.getDate() + (14 * multiplier))
          break
          
        case 'month':
          newDate = new Date(state.currentDate)
          newDate.setMonth(state.currentDate.getMonth() + multiplier)
          break
          
          
        default:
          newDate = new Date(state.currentDate)
          newDate.setDate(state.currentDate.getDate() + (7 * multiplier))
      }
    }
    
    console.log('📅 navigateRelative computed newDate:', newDate)
    navigateToDate(newDate)
  }, [state.viewType, state.currentDate, navigateToDate])

  // ビュー変更
  const changeView = useCallback((view: CalendarViewType) => {
    setState(prev => ({ ...prev, viewType: view }))
    onViewChange?.(view)
  }, [onViewChange])

  // 日付範囲の計算
  const dateRange = useMemo(() => {
    const start = new Date(state.currentDate)
    const end = new Date(state.currentDate)

    switch (state.viewType) {
      case 'day':
      case 'split-day':
        break

      case '3day': {
        start.setDate(state.currentDate.getDate() - 1)
        end.setDate(state.currentDate.getDate() + 1)
        break
      }

      case 'week':
      case 'week-no-weekend': {
        const dayOfWeek = state.currentDate.getDay()
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        start.setDate(state.currentDate.getDate() - mondayOffset)
        end.setDate(start.getDate() + 6)
        break
      }

      case '2week': {
        const dayOfWeek = state.currentDate.getDay()
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        start.setDate(state.currentDate.getDate() - mondayOffset)
        end.setDate(start.getDate() + 13)
        break
      }

      case 'month': {
        start.setDate(1)
        end.setMonth(state.currentDate.getMonth() + 1)
        end.setDate(0)
        break
      }

      default: {
        const dayOfWeek = state.currentDate.getDay()
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        start.setDate(state.currentDate.getDate() - mondayOffset)
        end.setDate(start.getDate() + 6)
      }
    }

    return { start, end }
  }, [state.currentDate, state.viewType])

  // 今日判定
  const isToday = useMemo(() => {
    const today = new Date()
    return state.currentDate.toDateString() === today.toDateString()
  }, [state.currentDate])

  // 日付範囲表示
  const formattedDateRange = useMemo(() => {
    const { start, end } = dateRange
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }

    if (state.viewType === 'day' || state.viewType === 'split-day') {
      return state.currentDate.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }

    if (state.viewType === 'month') {
      return state.currentDate.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long'
      })
    }

    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('ja-JP', options)} - ${end.getDate()}日`
    } else {
      return `${start.toLocaleDateString('ja-JP', options)} - ${end.toLocaleDateString('ja-JP', options)}`
    }
  }, [state.currentDate, state.viewType, dateRange])

  // モバイル判定（ドロワー表示用）
  const isMobile = currentBreakpoint === 'mobile'

  return {
    // レイアウト状態
    sidebarOpen: state.sidebarOpen,
    sidebarWidth: state.sidebarWidth,
    layoutMode: state.layoutMode,
    currentBreakpoint: state.currentBreakpoint,
    showHeader: state.showHeader,
    showSidebar: state.showSidebar,
    
    // カレンダー状態
    viewType: state.viewType,
    currentDate: state.currentDate,
    dateRange,
    isToday,
    formattedDateRange,
    
    // レイアウトアクション
    toggleSidebar,
    setSidebarOpen,
    setLayoutMode,
    setShowHeader,
    setShowSidebar,
    
    // カレンダーアクション
    navigateToDate,
    navigateRelative,
    changeView,
    
    // 計算値
    sidebarWidthPx: getSidebarWidthPx(),
    isMobile,
    
    // ユーティリティ
    isFullscreen: state.layoutMode === 'fullscreen',
    isCompact: state.layoutMode === 'compact' || currentBreakpoint === 'tablet',
    shouldShowDrawer: isMobile && state.sidebarOpen
  }
}