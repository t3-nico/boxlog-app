'use client'

import { KanbanToolbar } from '@/features/board/components/KanbanToolbar'

import { useInboxViewStore } from '../stores/useInboxViewStore'

/**
 * Inboxツールバー
 *
 * 表示モードに応じて適切なツールを表示:
 * - Board: KanbanToolbar（フィルター・検索）
 * - Table: SavedViewsSelector + GroupBySelector
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - 上下パディング: 8px（py-2）
 * - コンテナ: 32px（h-8）
 * - 8pxグリッドシステム準拠
 */
export function InboxToolbar() {
  const { displayMode } = useInboxViewStore()

  return (
    <div className="bg-background flex h-12 shrink-0 items-center px-4 py-2">
      {displayMode === 'board' ? <KanbanToolbar /> : null}
    </div>
  )
}
