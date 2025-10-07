'use client'

import React, { useCallback } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { Search } from 'lucide-react'

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
import { AppBar } from '@/features/navigation/components/appbar'
import { Sidebar } from '@/features/navigation/components/sidebar'
import { CommonSidebar } from '@/features/navigation/components/sidebar/CommonSidebar'
import { MobileBottomNavigation } from '@/features/navigation/components/mobile/MobileBottomNavigation'
import { Header } from '@/features/navigation/components/header'
import { InspectorToggle } from '@/features/navigation/components/header/inspector-toggle'
import { PageTitle } from '@/features/navigation/components/header/page-title'
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
  const { isSidebarOpen } = useNavigationStore()
  const { isOpen: isAIPanelOpen, panelHeight, isMinimized } = useAIPanelStore()
  const { open: openGlobalSearch } = useGlobalSearch()
  const { openCreateInspector } = useCreateEventInspector()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()

  // jsx-no-bind optimization: Search button handler
  const handleSearchButtonClick = useCallback(() => {
    console.log('Search button clicked')
    openGlobalSearch()
  }, [openGlobalSearch])

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

      {/* メインレイアウト - 3カラム構成 */}
      <div className="flex flex-1 overflow-hidden">
        {/* L1: AppBar (64px) - 固定ナビゲーション */}
        <AppBar />

        {/* L2: Sidebar (240px) - ルート可変 */}
        <Sidebar>
          <CommonSidebar />
        </Sidebar>

        {/* L3: Main Content + Inspector */}
        <div className="flex flex-1 flex-col">
          {/* Header Area */}
          <Header>
            {/* Mobile Layout */}
            <div className="flex w-full items-center justify-center md:hidden">
              {/* Center: Page Title */}
              <PageTitle />
            </div>

            {/* Desktop Layout */}
            <div className="hidden w-full items-center md:flex">
              {/* Left side: Page Title */}
              <div className="flex flex-1 justify-start">
                <PageTitle />
              </div>

              {/* Right side: Search & Inspector Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSearchButtonClick}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center',
                    'bg-neutral-200/50 dark:bg-neutral-800/50',
                    'hover:bg-neutral-300 dark:hover:bg-neutral-700',
                    'rounded-sm',
                    'transition-all duration-200',
                    'flex-shrink-0'
                  )}
                >
                  <Search className="h-5 w-5" />
                </button>
                <InspectorToggle />
              </div>
            </div>
          </Header>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            <div className="relative z-10 flex flex-1 bg-neutral-100 dark:bg-neutral-900">
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
