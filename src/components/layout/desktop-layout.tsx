'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { CalendarSidebar } from '@/features/calendar/components/sidebar/CalendarSidebar'
import { AppBar } from '@/features/navigation/components/appbar'
import { AppSidebar } from '@/features/navigation/components/sidebar/app-sidebar'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { StatsSidebar } from '@/features/stats'
import { TagsSidebarWrapper } from '@/features/tags/components/TagsSidebarWrapper'

import { MainContentWrapper } from './main-content-wrapper'
import { StatusBar } from './status-bar'

// LCP改善: StatusBarアイテムを遅延ロード（APIコール・ストア参照を含むため初回レンダリングをブロックしない）
const ScheduleStatusItem = dynamic(
  () => import('./status-bar/items/ScheduleStatusItem').then((mod) => ({ default: mod.ScheduleStatusItem })),
  { ssr: false }
)
const ChronotypeStatusItem = dynamic(
  () => import('./status-bar/items/ChronotypeStatusItem').then((mod) => ({ default: mod.ChronotypeStatusItem })),
  { ssr: false }
)

interface DesktopLayoutProps {
  children: React.ReactNode
  locale: 'ja' | 'en'
}

// StatusBarアイテムのスケルトン（遅延ロード中の表示）
function StatusBarItemSkeleton() {
  return <div className="bg-muted h-3 w-20 animate-pulse rounded" />
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
  // selector化: isOpenのみ監視（toggle変更時の再レンダリングを防止）
  const isOpen = useSidebarStore((state) => state.isOpen)
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = !!user

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

      {/* メインエリア（サイドバー + コンテンツ + ステータスバー） */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* 上部: サイドバー + コンテンツ */}
        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
          {/* Sidebar（240px、開閉可能）← ページごとに動的切り替え */}
          {/* Inboxページでは非表示 */}
          {isOpen && !isInboxPage && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30} collapsible={false}>
                {renderSidebar()}
              </ResizablePanel>
              <ResizableHandle className="border-border hover:bg-foreground/8 w-1 border-r transition-colors" />
            </>
          )}

          {/* Main Content + Inspector（自動的に残りのスペースを使用） */}
          <ResizablePanel className="overflow-hidden">
            <div className="relative flex h-full flex-col">
              <MainContentWrapper>{children}</MainContentWrapper>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* ステータスバー（サイドバー〜コンテンツ全幅、ログイン後のみ表示） */}
        {isAuthenticated ? (
          <StatusBar>
            <StatusBar.Left>
              <Suspense fallback={<StatusBarItemSkeleton />}>
                <ScheduleStatusItem />
              </Suspense>
            </StatusBar.Left>
            <StatusBar.Right>
              <Suspense fallback={<StatusBarItemSkeleton />}>
                <ChronotypeStatusItem />
              </Suspense>
            </StatusBar.Right>
          </StatusBar>
        ) : null}
      </div>
    </div>
  )
}
