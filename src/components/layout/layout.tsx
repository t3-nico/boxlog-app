'use client'

import React, { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { ThemeProvider } from '@/contexts/theme-context'
import { ChatProvider } from '@/contexts/chat-context'
import { AIPanelProvider, useAIPanel } from '@/contexts/ai-panel-context'
import { Sidebar } from './sidebar'
import { Navigation as SecondaryNavigation, SecondaryNavToggle } from './navigation'
import { useNavigationStore } from './sidebar/stores/navigation.store'
import { DynamicFloatingAIChat } from '@/components/dynamic/DynamicComponents'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import { CreateEventModal } from '@/features/events/components/create/CreateEventModal'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'
import { background } from '@/config/theme/colors'
import { Header } from './header'
import { InspectorToggle } from './header/inspector-toggle'
import { SidebarToggle } from './header/sidebar-toggle'
import { PageTitle } from './header/page-title'
import { useGlobalSearch, GlobalSearchProvider } from '@/features/search'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { componentRadius, animations, icon } from '@/config/theme'
import { Inspector } from './inspector'

interface DashboardLayoutProps {
  events?: any
  reviews?: any
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSecondaryNavCollapsed, isSidebarOpen } = useNavigationStore()
  const { isOpen: isAIPanelOpen, panelHeight, isMinimized } = useAIPanel()
  const { open: openGlobalSearch } = useGlobalSearch()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const { sm } = icon.size

  // Calculate the effective panel height (0 when closed or minimized)
  const effectivePanelHeight = isAIPanelOpen && !isMinimized ? panelHeight : 0
  
  // カレンダーページの検出
  const isCalendarPage = pathname.startsWith('/calendar')
  
  // カレンダーページの場合のProvider設定
  let calendarProviderProps = null
  if (isCalendarPage) {
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
    
    calendarProviderProps = {
      initialDate: initialDate || new Date(),
      initialView: view || 'week' as CalendarViewType
    }
    
  }

  const content = (
    <div className="flex flex-col h-screen">
      {/* メインレイアウト - 3カラム構成 */}
      <div className="flex flex-1 overflow-hidden">
        {/* L1: Primary Sidebar - 左端独立（条件付き表示） */}
        {isSidebarOpen && <Sidebar />}
        
        {/* L2: Navigation + Main Content Area - 中央、Headerで覆われる */}
        <div className="flex-1 flex flex-col">
          {/* Header Area - Navigation + Main Content のみ */}
          <Header>
            {/* Left side buttons */}
            <div className="flex items-center gap-2">
              {/* Sidebar Toggle Button - Sidebarが閉じている時のみ表示 */}
              {!isSidebarOpen && <SidebarToggle />}
              
              {/* Secondary Nav Toggle Button */}
              <SecondaryNavToggle />
            </div>
            
            {/* Left: Page Title */}
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
                  background.hover,
                  componentRadius.button.sm,
                  animations.transition.fast,
                  'flex-shrink-0'
                )}
              >
                <Search className={sm} />
              </button>
              <InspectorToggle />
            </div>
          </Header>
          
          {/* Navigation + Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Secondary Navigation (240px) - Collapsible */}
            {!isSecondaryNavCollapsed && (
              <SecondaryNavigation />
            )}
            
            {/* Main Content Area */}
            <div className={`flex-1 relative z-10 flex ${background.base}`}>
              {/* Main Content with AI Panel */}
              <div className="flex-1 relative overflow-hidden">
                {children}
                
                {/* Floating AI Chat within main area */}
                <DynamicFloatingAIChat />
              </div>
            </div>
          </div>
        </div>
        
        {/* L3: Inspector - 右端独立 */}
        <Inspector />
      </div>
      
      {/* Global Create Event Modal */}
      <CreateEventModal />
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

export function DashboardLayout({ 
  events, 
  reviews, 
  children 
}: DashboardLayoutProps) {
  return (
    <ThemeProvider>
      <GlobalSearchProvider>
        <AIPanelProvider>
          <ChatProvider>
            <DashboardLayoutContent>
              {children}
            </DashboardLayoutContent>
          </ChatProvider>
        </AIPanelProvider>
      </GlobalSearchProvider>
    </ThemeProvider>
  )
}