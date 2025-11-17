'use client'

import { KanbanToolbar } from '@/features/board/components/KanbanToolbar'

import { useInboxViewStore } from '../stores/useInboxViewStore'

/**
 * Inboxツールバー
 *
 * 表示モードに応じて適切なツールを表示:
 * - Board: KanbanToolbar（フィルター・検索）
 * - Table: SavedViewsSelector + GroupBySelector
 */
export function InboxToolbar() {
  const { displayMode } = useInboxViewStore()

  return (
    <div className="bg-background flex shrink-0 items-center px-4 py-4 md:px-6">
      {displayMode === 'board' ? <KanbanToolbar /> : null}
    </div>
  )
}
