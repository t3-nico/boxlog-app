'use client'

import { memo, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CalendarHeader } from './Header'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/shadcn-ui/button'
import { Menu } from 'lucide-react'
import type { CalendarViewType } from '../../types/calendar.types'
import type { SidebarProps } from './Sidebar'

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
  
  calendars?: SidebarProps['calendars']
  selectedCalendarIds?: string[]
  onCalendarToggle?: SidebarProps['onCalendarToggle']
  onCalendarSelect?: SidebarProps['onCalendarSelect']
  onCalendarCreate?: () => void
  onCalendarEdit?: SidebarProps['onCalendarEdit']
  onCalendarDelete?: SidebarProps['onCalendarDelete']
  
  tags?: SidebarProps['tags']
  selectedTagIds?: string[]
  onTagToggle?: SidebarProps['onTagToggle']
  onTagCreate?: SidebarProps['onTagCreate']
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
            aria-label={sidebarCollapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex min-h-0">
        {/* サイドバー */}
        {showSidebar && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={handleSidebarCollapsedChange}
            
            // Data & handlers
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            highlightedDates={highlightedDates}
            
            calendars={calendars}
            selectedCalendarIds={selectedCalendarIds}
            onCalendarToggle={onCalendarToggle}
            onCalendarSelect={onCalendarSelect}
            onCalendarCreate={onCalendarCreate}
            onCalendarEdit={onCalendarEdit}
            onCalendarDelete={onCalendarDelete}
            
            tags={tags}
            selectedTagIds={selectedTagIds}
            onTagToggle={onTagToggle}
            onTagCreate={onTagCreate}
            onTagClearAll={onTagClearAll}
            
            onCreateEvent={onCreateEvent}
            onCreateTask={onCreateTask}
            onCreateLog={onCreateLog}
            onOpenSettings={onOpenSettings}
            onExport={onExport}
            onImport={onImport}
            onSyncCalendars={onSyncCalendars}
            onGoToToday={onGoToToday}
            
            // Display options
            showMiniCalendar={showMiniCalendar}
            showCalendarList={showCalendarList}
            showTagFilter={showTagFilter}
            showQuickActions={showQuickActions}
            
            // モバイル対応
            className={cn(
              // モバイルでは絶対位置にしてオーバーレイ表示
              showMobileMenuButton && !sidebarCollapsed && [
                'md:relative md:translate-x-0',
                'absolute left-0 top-0 z-40 h-full',
                'shadow-lg md:shadow-none'
              ]
            )}
          />
        )}

        {/* モバイルでサイドバー展開時の背景オーバーレイ */}
        {showSidebar && showMobileMenuButton && !sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => handleSidebarCollapsedChange(true)}
            aria-hidden="true"
          />
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
})

CalendarLayout.displayName = 'CalendarLayout'