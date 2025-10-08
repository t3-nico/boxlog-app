'use client'

import React, { useCallback } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAIPanelStore } from '@/features/aichat/stores/useAIPanelStore'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import { useCalendarProviderProps } from '@/features/calendar/hooks/useCalendarProviderProps'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useGlobalSearch } from '@/features/search'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

import { Inspector } from '@/features/inspector'
import { useCreateEventInspector } from '@/features/inspector/hooks/useCreateEventInspector'
import { MobileBottomNavigation } from '@/features/navigation/components/mobile/MobileBottomNavigation'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'
import { useNavigationStore } from '@/features/navigation/stores/navigation.store'

interface BaseLayoutContentProps {
  children: React.ReactNode
}

/**
 * BaseLayoutのClient Component部分
 *
 * hooks（useNavigationStore, useGlobalSearch等）を使用するため、
 * Client Componentとして分離
 */
export function BaseLayoutContent({ children }: BaseLayoutContentProps) {
  const { t } = useI18n()
  const { openCreateInspector } = useCreateEventInspector()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()

  // jsx-no-bind optimization: Create event handler
  const handleCreateEventClick = useCallback(() => {
    openCreateInspector({
      context: {
        source: 'fab',
      },
    })
  }, [openCreateInspector])

  const { isCalendarPage, calendarProviderProps } = useCalendarProviderProps(pathname, searchParams || new URLSearchParams())

  const content = (
    <div className="flex h-screen flex-col">
      {/* アクセシビリティ: スキップリンク */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        {t('common.skipToMainContent')}
      </a>

      {/* メインレイアウト - Inset方式 */}
      <div className="flex flex-1 overflow-hidden bg-secondary">
        {/* L1: Sidebar (256px) */}
        <AppSidebar />

        {/* L2: Main Content + Inspector - Floating */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-muted shadow-lg my-2 mr-2">
          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            <div className="relative z-10 flex flex-1">
              {/* Main Content */}
              <main id="main-content" className="relative flex-1 overflow-hidden" role="main">
                {children}
              </main>
            </div>

            {/* Inspector - 右端 */}
            <Inspector />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={handleCreateEventClick}
        size="icon"
        aria-label={t('common.createNewEvent')}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-2xl shadow-lg md:bottom-6 md:right-6 md:h-16 md:w-16 lg:hidden"
      >
        <Plus className="h-6 w-6 md:h-7 md:w-7" />
      </Button>

      {/* Mobile Bottom Navigation */}
      {isMobile ? <MobileBottomNavigation /> : null}
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
