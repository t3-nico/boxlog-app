'use client'

import React, { useCallback } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { CalendarNavigationProvider } from '@/features/calendar/contexts/CalendarNavigationContext'
import { useCalendarProviderProps } from '@/features/calendar/hooks/useCalendarProviderProps'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// TODO(#621): Inspector削除後の一時的な型エラー回避
// import { Inspector } from '@/features/inspector'
// import { useCreateEventInspector } from '@/features/inspector/hooks/useCreateEventInspector'
import { MobileBottomNavigation } from '@/features/navigation/components/mobile/MobileBottomNavigation'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'

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
  // const { openCreateInspector } = useCreateEventInspector()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()

  // TODO(#621): Inspector削除後、plans/Sessions統合後に再実装
  // jsx-no-bind optimization: Create event handler
  const handleCreateEventClick = useCallback(() => {
    // openCreateInspector({
    //   context: {
    //     source: 'fab',
    //   },
    // })
    console.log('TODO: Sessions統合後に実装')
  }, [])

  const { isCalendarPage, calendarProviderProps } = useCalendarProviderProps(
    pathname,
    searchParams || new URLSearchParams()
  )

  const content = (
    <div className="flex h-screen flex-col">
      {/* アクセシビリティ: スキップリンク */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        {t('common.skipToMainContent')}
      </a>

      {/* メインレイアウト - Inset方式 */}
      <div className="bg-secondary flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* L1: Sidebar - Resizable */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <AppSidebar />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* L2: Main Content + Inspector - Floating */}
          <ResizablePanel defaultSize={80}>
            <div className="bg-muted m-2 ml-0 flex h-[calc(100%-1rem)] flex-1 flex-col overflow-hidden rounded-xl shadow-lg">
              {/* Main Content Area */}
              <div className="flex flex-1 overflow-hidden">
                <div className="relative z-10 flex flex-1">
                  {/* Main Content */}
                  <main id="main-content" className="relative flex-1 overflow-hidden" role="main">
                    {children}
                  </main>
                </div>

                {/* TODO(#621): Inspector削除後、plans/Sessions統合後に再実装 */}
                {/* <Inspector /> */}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={handleCreateEventClick}
        size="icon"
        aria-label={t('common.createNewEvent')}
        className="fixed right-4 bottom-20 z-50 h-14 w-14 rounded-2xl shadow-lg md:right-6 md:bottom-6 md:h-16 md:w-16 lg:hidden"
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
