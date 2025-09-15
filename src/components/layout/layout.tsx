'use client'

import React from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { Search } from 'lucide-react'

import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { colors, rounded, animations, icons } from '@/config/theme'
import { AIPanelProvider, useAIPanel } from '@/contexts/ai-panel-context'
import { ChatProvider } from '@/contexts/chat-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'
import { NotificationModalProvider } from '@/features/notifications'
import { useGlobalSearch, GlobalSearchProvider } from '@/features/search'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

import { Header } from './header'
import { InspectorToggle } from './header/inspector-toggle'
import { PageTitle } from './header/page-title'
import { SidebarToggle } from './header/sidebar-toggle'
import { Inspector } from './inspector'
import { useCreateEventInspector } from './inspector/hooks/useCreateEventInspector'
import { MobileBottomNavigation } from './mobile/MobileBottomNavigation'
import { Navigation as SecondaryNavigation, SecondaryNavToggle } from './navigation'
import { Sidebar } from './sidebar'
import { useNavigationStore } from './sidebar/stores/navigation.store'


interface DashboardLayoutProps {
  events?: any
  reviews?: any
  children: React.ReactNode
}

// カレンダー設定用のカスタムフック
const useCalendarProviderProps = (pathname: string, searchParams: URLSearchParams) => {
  const isCalendarPage = pathname.startsWith('/calendar')
  
  if (!isCalendarPage) return { isCalendarPage, calendarProviderProps: null }
  
  const pathSegments = pathname.split('/')
  const view = pathSegments[pathSegments.length - 1] as CalendarViewType
  const dateParam = searchParams.get('date')
  
  let initialDate: Date | undefined
  if (dateParam) {
    const parsedDate = new Date(dateParam)
    if (!isNaN(parsedDate.getTime())) {
      initialDate = parsedDate
    }
  }
  
  return {
    isCalendarPage,
    calendarProviderProps: {
      initialDate: initialDate || new Date(),
      initialView: view || 'week' as CalendarViewType
    }
  }
}

const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isSecondaryNavCollapsed, isSidebarOpen } = useNavigationStore()
  const { isOpen: isAIPanelOpen, panelHeight, isMinimized } = useAIPanel()
  const { open: openGlobalSearch } = useGlobalSearch()
  const { openCreateInspector } = useCreateEventInspector()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const { sm } = icons.size
  const _effectivePanelHeight = isAIPanelOpen && !isMinimized ? panelHeight : 0
  const { isCalendarPage, calendarProviderProps } = useCalendarProviderProps(pathname, searchParams)

  const content = (
    <div className="flex flex-col h-screen">
      {/* メインレイアウト - 3カラム構成 */}
      <div className="flex flex-1 overflow-hidden">
        {/* L1: Primary Sidebar - モバイル: 常に表示（画面外可能）、デスクトップ: 条件付き表示 */}
        <Sidebar />
        
        {/* L2: Navigation + Main Content Area - 中央、Headerで覆われる */}
        <div className="flex-1 flex flex-col">
          {/* Header Area - Navigation + Main Content のみ */}
          <Header>
            {/* Mobile Layout */}
            <div className="md:hidden flex items-center justify-center w-full">
              {/* Center: Page Title */}
              <PageTitle />
            </div>
            
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center w-full">
              {/* Left side buttons */}
              <div className="flex items-center gap-2">
                {!isSidebarOpen && <SidebarToggle />}
                {!isCalendarPage && <SecondaryNavToggle />}
              </div>
              
              {/* Center: Page Title */}
              <div className="flex-1 flex justify-start">
                <PageTitle />
              </div>
              
              {/* Right side: Search & Inspector Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log('Search button clicked')
                    openGlobalSearch()
                  }}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center',
                    colors.hover.subtle,
                    rounded.component.button.sm,
                    animations.transition.fast,
                    'flex-shrink-0'
                  )}
                >
                  <Search className={sm} />
                </button>
                <InspectorToggle />
              </div>
            </div>
          </Header>
          
          {/* Navigation + Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Secondary Navigation (240px) - Collapsible - Hidden on Calendar pages */}
            {!isSecondaryNavCollapsed && !isCalendarPage && (
              <SecondaryNavigation />
            )}
            
            {/* Main Content Area */}
            <div className={`flex-1 relative z-10 flex ${colors.background.base}`}>
              {/* Main Content with AI Panel */}
              <div className="flex-1 relative overflow-hidden">
                {children}
                
              </div>
            </div>
          </div>
        </div>
        
        {/* L3: Inspector - 右端独立 */}
        <Inspector />
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => openCreateInspector({
          context: {
            source: 'fab'
          }
        })}
        size="sm"
        aria-label="新しいイベントを作成"
      />
      
      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNavigation />}
      
    </div>
  )

  // カレンダーページの場合はCalendarNavigationProviderでラップ
  if (calendarProviderProps) {
    return (
      <CalendarNavigationProvider 
        initialDate={calendarProviderProps.initialDate}
        initialView={calendarProviderProps.initialView}
      >
        {content}
      </CalendarNavigationProvider>
    )
  }

  return content
}

export const DashboardLayout = ({ 
  events, 
  reviews, 
  children 
}: DashboardLayoutProps) => {
  return (
    <ThemeProvider>
      <GlobalSearchProvider>
        <NotificationModalProvider>
          <AIPanelProvider>
            <ChatProvider>
              <DashboardLayoutContent>
                {children}
              </DashboardLayoutContent>
            </ChatProvider>
          </AIPanelProvider>
        </NotificationModalProvider>
      </GlobalSearchProvider>
    </ThemeProvider>
  )
}