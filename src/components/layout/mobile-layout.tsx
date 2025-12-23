'use client'

import { usePathname } from 'next/navigation'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { CalendarSidebar } from '@/features/calendar/components/sidebar/CalendarSidebar'
import { InboxSidebar } from '@/features/inbox/components/InboxSidebar'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'
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
 * - Sheet（左オーバーレイ）でサイドバーを表示
 * - MainContent
 *
 * **ドロワー仕様**:
 * - モーダル動作（オーバーレイシェードで親要素を覆う）
 * - オーバーレイまたはハンバーガーメニューで開閉
 * - エレベーション付き
 */
export function MobileLayout({ children, locale }: MobileLayoutProps) {
  // selector化: 必要な値だけ監視（他の状態変更時の再レンダリングを防止）
  const isOpen = useSidebarStore((state) => state.isOpen)
  const toggle = useSidebarStore((state) => state.toggle)
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
      {/* モバイル: Sheet（左オーバーレイ）でSidebarを表示 */}
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetContent side="left" className="p-0" showCloseButton={false}>
          {renderSidebar()}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex h-full flex-1 flex-col">
        <MainContentWrapper>{children}</MainContentWrapper>
      </div>
    </>
  )
}
