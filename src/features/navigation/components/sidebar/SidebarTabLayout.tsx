'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, UnderlineTabsTrigger } from '@/components/ui/tabs'

import type { SidebarTabLayoutProps } from './types'

/**
 * Sidebarタブレイアウトコンポーネント
 *
 * ページ固有のSidebarコンテンツを表示するための汎用レイアウト。
 * 2〜4タブまで柔軟に対応。
 * SidebarShellのchildren として使用する。
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - 上下パディング: 8px（py-2）
 * - タブ高さ: 32px（h-8）
 * - 8pxグリッドシステム準拠
 * - Slack風アンダーラインタブ（選択時のみ下部ボーダー表示）
 * - セマンティックトークン使用（globals.css）
 * - AppBarとの視覚的一貫性
 *
 * @example
 * ```tsx
 * <SidebarShell title="カレンダー">
 *   <SidebarTabLayout
 *     tabs={[
 *       { value: 'inbox', label: 'Inbox', content: <InboxList /> },
 *       { value: 'view', label: 'View', content: <ViewSettings /> },
 *     ]}
 *     defaultTab="inbox"
 *   />
 * </SidebarShell>
 * ```
 */
export function SidebarTabLayout({ tabs, defaultTab }: SidebarTabLayoutProps) {
  const initialTab = defaultTab || tabs[0]?.value || ''
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Tabs defaultValue={initialTab} className="flex flex-1 flex-col overflow-hidden">
        {/* TabsList - Slack風アンダーラインデザイン（48px = 8px + 32px + 8px） */}
        <TabsList
          className="grid h-12 w-full shrink-0 rounded-none bg-transparent p-0 py-2"
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <UnderlineTabsTrigger key={tab.value} value={tab.value} className="h-8 gap-1.5">
                {Icon && <Icon className="size-4" />}
                {tab.label}
              </UnderlineTabsTrigger>
            )
          })}
        </TabsList>

        {/* TabsContent - スクロール可能 */}
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0 min-h-0 flex-1">
            <ScrollArea className="h-full">{tab.content}</ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
