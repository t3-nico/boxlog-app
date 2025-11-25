'use client'

import { usePathname } from 'next/navigation'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { CalendarSidebar } from '@/features/calendar/components/sidebar/CalendarSidebar'
import { AppBar } from '@/features/navigation/components/appbar'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { StatsSidebar } from '@/features/stats'
import { TagsSidebarWrapper } from '@/features/tags/components/TagsSidebarWrapper'

import { MainContentWrapper } from './main-content-wrapper'

interface DesktopLayoutProps {
  children: React.ReactNode
  locale: 'ja' | 'en'
}

/**
 * デスクトップ用レイアウト
 *
 * 3カラムレイアウト:
 * - AppBar（64px、常に表示）
 * - Sidebar（240px、開閉可能）← ページごとに動的切り替え
 * - MainContent + Inspector
 */
export function DesktopLayout({ children, locale }: DesktopLayoutProps) {
  const { isOpen } = useSidebarStore()
  const pathname = usePathname()

  // ページごとにSidebarを切り替え
  const isCalendarPage = pathname?.startsWith(`/${locale}/calendar`) ?? false
  const isInboxPage = pathname?.startsWith(`/${locale}/inbox`) ?? false
  const isTagsPage = pathname?.startsWith(`/${locale}/tags`) ?? false
  const isStatsPage = pathname?.startsWith(`/${locale}/stats`) ?? false

  // サイドバーコンポーネントを決定
  const renderSidebar = () => {
    if (isCalendarPage) return <CalendarSidebar />
    if (isTagsPage) return <TagsSidebarWrapper />
    if (isStatsPage) return <StatsSidebar />
    return <AppSidebar />
  }

  return (
    <div className="flex h-full">
      {/* AppBar（64px、固定幅、常に表示） */}
      <div className="w-16 shrink-0">
        <AppBar />
      </div>

      {/* 元のレイアウト（ResizablePanel） */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Sidebar（240px、開閉可能）← ページごとに動的切り替え */}
        {/* Inboxページでは非表示 */}
        {isOpen && !isInboxPage && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} collapsible={false}>
              {renderSidebar()}
            </ResizablePanel>
            <ResizableHandle className="border-border hover:bg-accent/50 w-1 border-r transition-colors" />
          </>
        )}

        {/* Main Content + Inspector（自動的に残りのスペースを使用） */}
        <ResizablePanel>
          <div className="relative flex h-full flex-col">
            <MainContentWrapper>{children}</MainContentWrapper>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
