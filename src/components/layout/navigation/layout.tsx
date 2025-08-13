'use client'

import React from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeProvider } from '@/contexts/theme-context'
import { PrimaryNavigation } from './primary-nav'
import { SecondaryNavigation, SecondaryNavToggle } from './secondary-nav'
import { RightPanel } from '../right-panel'
import { useNavigationStore } from '@/store/navigation.store'

interface DashboardLayoutProps {
  events?: any
  reviews?: any
  children: React.ReactNode
}

export function DashboardLayout({ 
  events, 
  reviews, 
  children 
}: DashboardLayoutProps) {
  const { isSecondaryNavCollapsed, isRightPanelHidden } = useNavigationStore()

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex h-screen">
          {/* L1: Primary Navigation (60px) */}
          <PrimaryNavigation />
          
          {/* L2: Secondary Navigation (240px) - Collapsible */}
          {!isSecondaryNavCollapsed && (
            <SecondaryNavigation />
          )}
          
          {/* Main Content Area - Flexible */}
          <div className="flex-1 relative z-10">
            {/* Secondary Nav Toggle Button */}
            <SecondaryNavToggle />
            
            <ScrollArea className="h-full">
              <div className="h-full w-full">
                {children}
              </div>
            </ScrollArea>
          </div>
          
          {/* R1: Right Panel - Collapsible */}
          <RightPanel />
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}