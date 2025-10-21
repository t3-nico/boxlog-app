'use client'

import { SiteHeader } from '@/components/site-header'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { AppBar } from '@/features/navigation/components/appbar'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'

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
 * - Sidebar（240px、開閉可能）← TODO: PageSidebarに置き換え
 * - MainContent + Inspector
 */
export function DesktopLayout({ children }: DesktopLayoutProps) {
  const { isOpen } = useSidebarStore()

  return (
    <div className="flex h-full">
      {/* AppBar（64px、固定幅、常に表示） */}
      <div className="w-16 shrink-0">
        <AppBar />
      </div>

      {/* 元のレイアウト（ResizablePanel） */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Sidebar（240px、開閉可能）← TODO: PageSidebarに置き換え */}
        {isOpen && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} collapsible={false}>
              <AppSidebar />
            </ResizablePanel>
            <ResizableHandle className="border-border hover:border-primary w-0 border-r transition-colors" />
          </>
        )}

        {/* Main Content + Inspector（自動的に残りのスペースを使用） */}
        <ResizablePanel>
          <div className="bg-muted relative flex h-full flex-col shadow-lg">
            {/* Site Header */}
            <SiteHeader />

            <MainContentWrapper>{children}</MainContentWrapper>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
