'use client'

import { memo, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CalendarHeader } from './Header'
// import { Sidebar } from './Sidebar' // 削除: showSidebar={false}で使用していない
import { Button } from '@/components/shadcn-ui/button'
import { Menu } from 'lucide-react'
import type { CalendarViewType } from '../../types/calendar.types'
// import type { SidebarProps } from './Sidebar' // 削除: Sidebarコンポーネントを使用しなくなったため

interface CalendarLayoutProps {
  children: React.ReactNode
  className?: string
  
  // Header props
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void
  
  // Header actions
  onSettings?: () => void
  onExport?: () => void
  onImport?: () => void
  showHeaderActions?: boolean
  
  // Sidebar props - SidebarPropsから継承
  showSidebar?: boolean
  sidebarCollapsed?: boolean
  onSidebarCollapsedChange?: (collapsed: boolean) => void
  
  // SidebarProps の全プロパティを含める
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  highlightedDates?: Date[]
  
  calendars?: any[] // SidebarPropsから分離
  selectedCalendarIds?: string[]
  onCalendarToggle?: (calendarId: string, enabled: boolean) => void
  onCalendarSelect?: (calendarId: string) => void
  onCalendarCreate?: () => void
  onCalendarEdit?: (calendarId: string) => void
  onCalendarDelete?: (calendarId: string) => void
  
  tags?: any[] // SidebarPropsから分離
  selectedTagIds?: string[]
  onTagToggle?: (tagId: string, enabled: boolean) => void
  onTagCreate?: () => void
  onTagClearAll?: () => void
  
  onCreateEvent?: () => void
  onCreateTask?: () => void
  onCreateLog?: () => void
  onOpenSettings?: () => void
  onSyncCalendars?: () => void
  onGoToToday?: () => void
  
  showMiniCalendar?: boolean
  showCalendarList?: boolean
  showTagFilter?: boolean
  showQuickActions?: boolean
  
  // Layout options
  initialSidebarCollapsed?: boolean
  persistSidebarState?: boolean
  sidebarStorageKey?: string
}

/**
 * カレンダー最上位レイアウトコンポーネント
 * ヘッダー、サイドバー、メインコンテンツを統合管理
 */
export const CalendarLayout = memo<CalendarLayoutProps>(({
  children,
  className,
  
  // Header
  viewType,
  currentDate,
  onNavigate,
  onViewChange,
  onSettings,
  onExport,
  onImport,
  showHeaderActions = false,
  
  // Sidebar
  showSidebar = true,
  sidebarCollapsed: propSidebarCollapsed,
  onSidebarCollapsedChange,
  
  // Sidebar data & handlers
  selectedDate,
  onDateSelect,
  highlightedDates = [],
  calendars = [],
  selectedCalendarIds = [],
  onCalendarToggle,
  onCalendarSelect,
  onCalendarCreate,
  onCalendarEdit,
  onCalendarDelete,
  tags = [],
  selectedTagIds = [],
  onTagToggle,
  onTagCreate,
  onTagClearAll,
  onCreateEvent,
  onCreateTask,
  onCreateLog,
  onOpenSettings,
  onSyncCalendars,
  onGoToToday,
  showMiniCalendar = true,
  showCalendarList = true,
  showTagFilter = true,
  showQuickActions = true,
  
  // Layout options
  initialSidebarCollapsed = false,
  persistSidebarState = true,
  sidebarStorageKey = 'calendar-sidebar-collapsed'
}) => {
  // サイドバーの折りたたみ状態管理
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(() => {
    if (typeof propSidebarCollapsed !== 'undefined') {
      return propSidebarCollapsed
    }
    
    if (persistSidebarState && typeof window !== 'undefined') {
      const stored = localStorage.getItem(sidebarStorageKey)
      return stored ? JSON.parse(stored) : initialSidebarCollapsed
    }
    
    return initialSidebarCollapsed
  })

  const sidebarCollapsed = propSidebarCollapsed ?? internalSidebarCollapsed
  
  // サイドバー状態の永続化
  useEffect(() => {
    if (persistSidebarState && typeof window !== 'undefined') {
      localStorage.setItem(sidebarStorageKey, JSON.stringify(sidebarCollapsed))
    }
  }, [sidebarCollapsed, persistSidebarState, sidebarStorageKey])

  const handleSidebarCollapsedChange = useCallback((collapsed: boolean) => {
    if (onSidebarCollapsedChange) {
      onSidebarCollapsedChange(collapsed)
    } else {
      setInternalSidebarCollapsed(collapsed)
    }
  }, [onSidebarCollapsedChange])

  // モバイルでのサイドバートグル用ボタン表示フラグ
  const [showMobileMenuButton, setShowMobileMenuButton] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setShowMobileMenuButton(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = useCallback(() => {
    handleSidebarCollapsedChange(!sidebarCollapsed)
  }, [sidebarCollapsed, handleSidebarCollapsedChange])

  return (
    <div className={cn(
      'calendar-layout flex flex-col h-full bg-background',
      className
    )}>
      {/* ヘッダー */}
      <CalendarHeader
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={onNavigate}
        onViewChange={onViewChange}
        onSettings={onSettings}
        onExport={onExport}
        onImport={onImport}
        showActions={showHeaderActions}
        // モバイル用メニューボタン
        leftSlot={showSidebar && showMobileMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden h-8 w-8 p-0"
            aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex min-h-0">
        {/* サイドバー - 削除: showSidebar={false}のため使用していない */}
        {/* {showSidebar && (
          ... Sidebar component removed ...
        )} */}

        {/* モバイルでサイドバー展開時の背景オーバーレイ - 削除: サイドバー使用しないため */}
        {/* {showSidebar && showMobileMenuButton && !sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => handleSidebarCollapsedChange(true)}
            aria-hidden="true"
          />
        )} */}

        {/* メインコンテンツ */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
})

CalendarLayout.displayName = 'CalendarLayout'