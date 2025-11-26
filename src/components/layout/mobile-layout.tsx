'use client'

import { usePathname } from 'next/navigation'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { CalendarSidebar } from '@/features/calendar/components/sidebar/CalendarSidebar'
import { InboxSidebar } from '@/features/inbox/components/InboxSidebar'
import { MobileHeader } from '@/features/navigation/components/mobile/MobileHeader'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'
import { useMobileHeaderStore } from '@/features/navigation/stores/useMobileHeaderStore'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { StatsSidebar } from '@/features/stats'
import { TagsSidebarWrapper } from '@/features/tags/components/TagsSidebarWrapper'

import { MainContentWrapper } from './main-content-wrapper'

interface MobileLayoutProps {
  children: React.ReactNode
  locale: 'ja' | 'en'
}

/**
 * モバイル用レイアウト
 *
 * **構成**:
 * - MobileHeader（48px、ページごとのタイトルとアクション）
 * - Sheet（オーバーレイ）でサイドバーを表示
 * - MainContent
 *
 * **デザイン仕様**:
 * - 8pxグリッドシステム準拠
 * - セマンティックトークン使用
 */
export function MobileLayout({ children, locale }: MobileLayoutProps) {
  const { isOpen, toggle } = useSidebarStore()
  const { config: headerConfig } = useMobileHeaderStore()
  const pathname = usePathname()

  // ページごとにSidebarを切り替え
  const isCalendarPage = pathname?.startsWith(`/${locale}/calendar`) ?? false
  const isInboxPage = pathname?.startsWith(`/${locale}/inbox`) ?? false
  const isTagsPage = pathname?.startsWith(`/${locale}/tags`) ?? false
  const isStatsPage = pathname?.startsWith(`/${locale}/stats`) ?? false

  // サイドバーコンポーネントを決定
  const renderSidebar = () => {
    if (isCalendarPage) return <CalendarSidebar />
    if (isInboxPage) return <InboxSidebar />
    if (isTagsPage) return <TagsSidebarWrapper />
    if (isStatsPage) return <StatsSidebar />
    return <AppSidebar />
  }

  return (
    <>
      {/* モバイル: Sheet（オーバーレイ）でSidebarを表示 */}
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          {renderSidebar()}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex h-full flex-1 flex-col">
        {/* Mobile Header */}
        {headerConfig.title && (
          <MobileHeader
            title={headerConfig.title}
            actions={headerConfig.actions}
            showMenuButton={headerConfig.showMenuButton}
          />
        )}

        <MainContentWrapper>{children}</MainContentWrapper>
      </div>
    </>
  )
}
