'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { SidebarHeader } from './SidebarHeader'
import type { SidebarTabLayoutProps } from './types'

/**
 * Sidebarタブレイアウトコンポーネント
 *
 * ページ固有のSidebarコンテンツを表示するための汎用レイアウト。
 * 2〜4タブまで柔軟に対応。
 *
 * **デザイン仕様**:
 * - 8pxグリッドシステム準拠（py-4, gap-4, px-2）
 * - セマンティックトークン使用（globals.css）
 * - AppBarとの視覚的一貫性
 *
 * @example
 * ```tsx
 * <SidebarTabLayout
 *   title="Calendar"
 *   tabs={[
 *     { value: 'events', label: 'Events', content: <EventsList /> },
 *     { value: 'tasks', label: 'Tasks', content: <TasksList /> },
 *     { value: 'view', label: 'View', content: <ViewSettings /> },
 *   ]}
 *   defaultTab="events"
 * />
 * ```
 */
export function SidebarTabLayout({ title, tabs, defaultTab }: SidebarTabLayoutProps) {
  return (
    <aside className="flex h-full w-full flex-col gap-4 py-4">
      {/* Header */}
      <SidebarHeader title={title} />

      {/* Tabs */}
      <Tabs defaultValue={defaultTab || tabs[0]?.value} className="flex flex-1 flex-col overflow-hidden px-2">
        {/* TabsList - タブ数に応じて自動調整 */}
        <TabsList
          className="grid w-full shrink-0"
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          }}
        >
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TabsContent - スクロール可能 */}
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0 flex-1 overflow-y-auto">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </aside>
  )
}
