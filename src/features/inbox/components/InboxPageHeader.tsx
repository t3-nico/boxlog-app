'use client'

import { useInboxViewStore } from '../stores/useInboxViewStore'
import { DisplayModeSwitcher } from './DisplayModeSwitcher'

/**
 * Inboxページヘッダー
 *
 * SidebarHeaderと同じ仕様:
 * - 高さ: 48px固定（8px top padding + 40px container）
 * - 横幅パディング: 16px
 * - 背景: bg-background
 *
 * 現在選択中のビュー名 + DisplayModeSwitcher（Board/Table切り替え）
 */
export function InboxPageHeader() {
  const { getActiveView } = useInboxViewStore()
  const activeView = getActiveView()

  return (
    <div className="bg-background flex h-12 shrink-0 items-end pt-2 pr-4 pl-4">
      {/* タイトル + ビュースイッチャー */}
      <div className="flex h-10 items-center gap-4">
        <h1 className="text-base font-semibold">{activeView?.name || 'Inbox'}</h1>
        <DisplayModeSwitcher />
      </div>
    </div>
  )
}
