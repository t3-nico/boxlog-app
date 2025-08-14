'use client'

import React, { useState } from 'react'
import { ToastProvider } from '@/components/shadcn-ui/toast'
import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { ThemeProvider } from '@/contexts/theme-context'
import { ChatProvider } from '@/contexts/chat-context'
import { AIPanelProvider, useAIPanel } from '@/contexts/ai-panel-context'
import { PrimaryNavigation } from './primary-nav'
import { SecondaryNavigation, SecondaryNavToggle } from './secondary-nav'
import { useNavigationStore } from '@/features/navigation/stores/navigation.store'
import { DynamicFloatingAIChat } from '@/components/dynamic/DynamicComponents'

interface DashboardLayoutProps {
  events?: any
  reviews?: any
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSecondaryNavCollapsed } = useNavigationStore()
  const { isOpen: isAIPanelOpen, panelHeight, isMinimized } = useAIPanel()

  // Calculate the effective panel height (0 when closed or minimized)
  const effectivePanelHeight = isAIPanelOpen && !isMinimized ? panelHeight : 0

  return (
    <div className="flex h-screen">
      {/* L1: Primary Navigation (60px) */}
      <PrimaryNavigation />
      
      {/* L2: Secondary Navigation (240px) - Collapsible */}
      {!isSecondaryNavCollapsed && (
        <SecondaryNavigation />
      )}
      
      {/* Main Content Area - Flexible */}
      <div className="flex-1 relative z-10 flex flex-col">
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
  )
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