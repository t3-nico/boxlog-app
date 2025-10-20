'use client'

import { SiteHeader } from '@/components/site-header'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useI18n } from '@/features/i18n/lib/hooks'
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
 * Resizableなサイドバーとメインコンテンツエリアを管理
 */
export function DesktopLayout({ children, locale }: DesktopLayoutProps) {
  const { t } = useI18n(locale)
  const { isOpen } = useSidebarStore()

  return (
    <ResizablePanelGroup direction="horizontal">
      {/* デスクトップ: Resizable Sidebar */}
      {isOpen && (
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} collapsible={false}>
          <AppSidebar />
        </ResizablePanel>
      )}

      {isOpen && (
        <ResizableHandle
          className="border-border hover:border-primary w-0 border-r transition-colors"
          aria-label={t('sidebar.resize')}
        />
      )}

      {/* Main Content + Inspector */}
      <ResizablePanel>
        <div className="relative flex h-full flex-col shadow-lg">
          {/* Site Header */}
          <SiteHeader />

          <MainContentWrapper>{children}</MainContentWrapper>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
