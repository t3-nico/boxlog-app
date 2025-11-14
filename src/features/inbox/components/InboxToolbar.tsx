'use client'

import { KanbanToolbar } from '@/features/board/components/KanbanToolbar'

import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore'
import { useInboxSortStore } from '../stores/useInboxSortStore'
import { useInboxViewStore } from '../stores/useInboxViewStore'
import { GroupBySelector } from './table/GroupBySelector'
import { SavedViewsSelector } from './table/SavedViewsSelector'

/**
 * Inboxツールバー
 *
 * 表示モードに応じて適切なツールを表示:
 * - Board: KanbanToolbar（フィルター・検索）
 * - Table: SavedViewsSelector + GroupBySelector
 */
export function InboxToolbar() {
  const { displayMode } = useInboxViewStore()
  const filters = useInboxFilterStore()
  const { sortField, sortDirection } = useInboxSortStore()
  const { pageSize } = useInboxPaginationStore()

  return (
    <div className="bg-background flex shrink-0 items-center px-4 py-4 md:px-6">
      {displayMode === 'board' ? (
        <KanbanToolbar />
      ) : (
        <div className="flex items-center gap-2">
          <SavedViewsSelector
            currentState={{
              filters: {
                status: filters.status,
                search: filters.search,
              },
              sorting: sortField && sortDirection ? { field: sortField, direction: sortDirection } : undefined,
              pageSize,
            }}
          />
          <GroupBySelector />
        </div>
      )}
    </div>
  )
}
