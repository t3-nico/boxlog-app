'use client'

import React, { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ToastProvider } from '@/components/shadcn-ui/toast'
import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { ThemeProvider } from '@/contexts/theme-context'
import { ChatProvider } from '@/contexts/chat-context'
import { AIPanelProvider, useAIPanel } from '@/contexts/ai-panel-context'
import { AppBar } from './AppBar'
import { Sidebar as SecondaryNavigation, SecondaryNavToggle } from './Sidebar'
import { useNavigationStore } from './stores/navigation.store'
import { DynamicFloatingAIChat } from '@/components/dynamic/DynamicComponents'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import { CreateEventModal } from '@/features/events/components/create/CreateEventModal'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'
import { background } from '@/config/theme/colors'
import { TaskFooter } from '../TaskFooter'

interface DashboardLayoutProps {
  events?: any
  reviews?: any
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSecondaryNavCollapsed } = useNavigationStore()
  const { isOpen: isAIPanelOpen, panelHeight, isMinimized } = useAIPanel()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
      {/* メインコンテンツエリア（AppBar + Sidebar + Content） */}
      <div className="flex flex-1 overflow-hidden">
        {/* L1: App Bar (60px) */}
        <AppBar />
        
        {/* L2: Secondary Navigation (240px) - Collapsible */}
        {!isSecondaryNavCollapsed && (
          <SecondaryNavigation />
        )}
        
        {/* Main Content Area - Flexible */}
        <div className={`flex-1 relative z-10 flex flex-col ${background.surface}`}>
          {/* Secondary Nav Toggle Button */}
          <SecondaryNavToggle />
          
          {/* Main Content with AI Panel */}
          <div className="flex-1 relative overflow-hidden">
            {children}
            
            {/* Floating AI Chat within main area */}
            <DynamicFloatingAIChat />
          </div>
        </div>
      </div>
      
      {/* Task Execution Footer - 全画面幅、最下部 */}
      <TaskFooter />
      
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
      <AIPanelProvider>
        <ChatProvider>
          <ToastProvider>
            <DashboardLayoutContent>
              {children}
            </DashboardLayoutContent>
          </ToastProvider>
        </ChatProvider>
      </AIPanelProvider>
    </ThemeProvider>
  )
}