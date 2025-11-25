'use client'

import { usePathname } from 'next/navigation'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { CalendarSidebar } from '@/features/calendar/components/sidebar/CalendarSidebar'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { StatsSidebar } from '@/features/stats'

import { MainContentWrapper } from './main-content-wrapper'

interface MobileLayoutProps {
  children: React.ReactNode
  locale: 'ja' | 'en'
}

/**
 * モバイル用レイアウト
 *
 * Sheet（オーバーレイ）でサイドバーを表示
 */
export function MobileLayout({ children, locale }: MobileLayoutProps) {
  const { isOpen, toggle } = useSidebarStore()
  const pathname = usePathname()

  // ページごとにSidebarを切り替え
  const isCalendarPage = pathname?.startsWith(`/${locale}/calendar`) ?? false
  const isStatsPage = pathname?.startsWith(`/${locale}/stats`) ?? false

  // サイドバーコンポーネントを決定
  const renderSidebar = () => {
    if (isCalendarPage) return <CalendarSidebar />
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
        <MainContentWrapper>{children}</MainContentWrapper>
      </div>
    </>
  )
}
