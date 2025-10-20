'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { StatsNavigation } from '@/features/stats/components/stats-navigation'

interface StatsLayoutProps {
  children: React.ReactNode
}

/**
 * 統計ページ専用レイアウト
 *
 * 構造:
 * - 左: StatsNavigation（アンカーリンク集、リサイズ可能）
 * - 右: メインコンテンツエリア
 */
export default function StatsLayout({ children }: StatsLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      {/* StatsNav + Content: リサイズ可能な2カラム */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Stats Navigation */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} collapsible={false}>
            <StatsNavigation />
          </ResizablePanel>

          <ResizableHandle className="border-border hover:border-primary w-0 border-r transition-colors" />

          {/* Main Content */}
          <ResizablePanel>
            <div className="h-full overflow-y-auto">{children}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
