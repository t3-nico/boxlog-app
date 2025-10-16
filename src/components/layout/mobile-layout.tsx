'use client'

import { SiteHeader } from '@/components/site-header'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { MainContentWrapper } from './main-content-wrapper'

interface MobileLayoutProps {
  children: React.ReactNode
}

/**
 * モバイル用レイアウト
 *
 * Sheet（オーバーレイ）でサイドバーを表示
 */
export function MobileLayout({ children }: MobileLayoutProps) {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <>
      {/* モバイル: Sheet（オーバーレイ）でSidebarを表示 */}
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <AppSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="bg-muted flex h-full flex-1 flex-col">
        {/* Site Header */}
        <SiteHeader />

        <MainContentWrapper>{children}</MainContentWrapper>
      </div>
    </>
  )
}
