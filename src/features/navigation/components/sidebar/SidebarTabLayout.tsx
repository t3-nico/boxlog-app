'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { SidebarTabLayoutProps } from './types'

/**
 * Sidebarタブレイアウトコンポーネント
 *
 * ページ固有のSidebarコンテンツを表示するための汎用レイアウト。
 * 2〜4タブまで柔軟に対応。
 *
 * **デザイン仕様**:
 * - 8pxグリッドシステム準拠（py-2, px-4）
 * - Slack風アンダーラインタブ（選択時のみ下部ボーダー表示）
 * - セマンティックトークン使用（globals.css）
 * - AppBarとの視覚的一貫性
 *
 * @example
 * ```tsx
 * <SidebarTabLayout
 *   tabs={[
 *     { value: 'events', label: 'Events', content: <EventsList /> },
 *     { value: 'tasks', label: 'Tasks', content: <TasksList /> },
 *     { value: 'view', label: 'View', content: <ViewSettings /> },
 *   ]}
 *   defaultTab="events"
 * />
 * ```
 */
export function SidebarTabLayout({ tabs, defaultTab }: SidebarTabLayoutProps) {
  const initialTab = defaultTab || tabs[0]?.value || tabs[0]?.value || ''
  return (
    <aside className="flex h-full w-full flex-col pt-2">
      {/* Tabs */}
      <Tabs defaultValue={initialTab} className="flex flex-1 flex-col overflow-hidden">
        {/* TabsList - Slack風アンダーラインデザイン */}
        <TabsList
          className="border-border grid h-10 w-full shrink-0 rounded-none border-b bg-transparent p-0 px-4"
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          }}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:border-primary hover:border-primary/50 h-10 rounded-none border-b-2 border-transparent p-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TabsContent - スクロール可能 */}
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0 min-h-0 flex-1">
            <ScrollArea className="h-full">{tab.content}</ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </aside>
  )
}
