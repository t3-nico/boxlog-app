// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
'use client'

import React, { useCallback } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { Search } from 'lucide-react'

import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { AIPanelProvider, useAIPanel } from '@/contexts/ai-panel-context'
import { ChatProvider } from '@/contexts/chat-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'
import { NotificationModalProvider } from '@/features/notifications'
import { GlobalSearchProvider, useGlobalSearch } from '@/features/search'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { Event } from '@/types/unified'

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
  events?: Event[]
  reviews?: unknown[]
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
      initialView: view || ('week' as CalendarViewType),
    },
  }
}

const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isSecondaryNavCollapsed, isSidebarOpen } = useNavigationStore()
  const { isOpen: isAIPanelOpen, panelHeight, isMinimized } = useAIPanel()
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
        Skip to main content
      </a>

      {/* メインレイアウト - 3カラム構成 */}
      <div className="flex flex-1 overflow-hidden">
        {/* L1: Primary Sidebar - モバイル: 常に表示（画面外可能）、デスクトップ: 条件付き表示 */}
        <Sidebar />

        {/* L2: Navigation + Main Content Area - 中央、Headerで覆われる */}
        <div className="flex flex-1 flex-col">
          {/* Header Area - Navigation + Main Content のみ */}
          <Header>
            {/* Mobile Layout */}
            <div className="flex w-full items-center justify-center md:hidden">
              {/* Center: Page Title */}
              <PageTitle />
            </div>

            {/* Desktop Layout */}
            <div className="hidden w-full items-center md:flex">
              {/* Left side buttons */}
              <div className="flex items-center gap-2">
                {!isSidebarOpen ? <SidebarToggle /> : null}
                {!isCalendarPage ? <SecondaryNavToggle /> : null}
              </div>

              {/* Center: Page Title */}
              <div className="flex flex-1 justify-start">
                <PageTitle />
              </div>

              {/* Right side: Language Switcher, Search & Inspector Toggle */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher variant="compact" />
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

          {/* Navigation + Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Secondary Navigation (240px) - Collapsible - Hidden on Calendar pages */}
            {!isSecondaryNavCollapsed && !isCalendarPage ? <SecondaryNavigation /> : null}

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-1 bg-neutral-100 dark:bg-neutral-900">
              {/* Main Content with AI Panel */}
              <main id="main-content" className="relative flex-1 overflow-hidden" role="main">
                {children}
              </main>
            </div>
          </div>
        </div>

        {/* L3: Inspector - 右端独立 */}
        <Inspector />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreateEventClick} size="sm" aria-label="新しいイベントを作成" />

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

export const DashboardLayout = ({ events: _events, reviews: _reviews, children }: DashboardLayoutProps) => {
  return (
    <ThemeProvider>
      <GlobalSearchProvider>
        <NotificationModalProvider>
          <AIPanelProvider>
            <ChatProvider>
              <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </ChatProvider>
          </AIPanelProvider>
        </NotificationModalProvider>
      </GlobalSearchProvider>
    </ThemeProvider>
  )
}
