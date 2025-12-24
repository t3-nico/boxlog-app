'use client'

import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { KanbanBoard } from '@/features/board'
import { useBoardStatusFilterStore } from '@/features/board/stores/useBoardStatusFilterStore'
import type { PlanStatus } from '@/features/plans/types/plan'
import { TableNavigation, type TableNavigationConfig } from '@/features/table'
import { Plus } from 'lucide-react'

import { useInboxData } from '../hooks/useInboxData'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { DisplayModeSwitcher } from './DisplayModeSwitcher'
import { InboxBoardFilterContent } from './board/InboxBoardFilterContent'
import { InboxBoardSettingsContent } from './board/InboxBoardSettingsContent'

/**
 * Inbox Board View コンポーネント
 *
 * 既存のKanbanBoardをInbox用にラップし、
 * - useInboxData でデータ取得
 * - useInboxBoardFilterStore でフィルタ管理
 *
 * @example
 * ```tsx
 * <InboxBoardView />
 * ```
 */
export function InboxBoardView() {
  const filters = useInboxFilterStore()
  const { reset: resetFilters } = useInboxFilterStore()
  const { resetFilters: resetStatusFilters } = useBoardStatusFilterStore()

  const { items, isPending, error } = useInboxData({
    status: filters.status[0] as PlanStatus | undefined,
    search: filters.search,
    tags: filters.tags,
    dueDate: filters.dueDate,
  })

  // フィルター数をカウント
  const filterCount = filters.tags.length + (filters.dueDate !== 'all' ? 1 : 0)

  // TableNavigation設定（Boardはソート機能なし）
  const navigationConfig: TableNavigationConfig = useMemo(
    () => ({
      search: filters.search,
      onSearchChange: filters.setSearch,
      sortField: null,
      sortDirection: null,
      onSortChange: () => {},
      onSortClear: () => {},
      sortFieldOptions: [],
      filterContent: <InboxBoardFilterContent />,
      filterCount,
      hasActiveFilters: filterCount > 0,
      onFilterReset: resetFilters,
      settingsContent: <InboxBoardSettingsContent />,
      hasActiveSettings: false,
      onSettingsReset: resetStatusFilters,
    }),
    [filters.search, filters.setSearch, filterCount, resetFilters, resetStatusFilters]
  )

  // エラー表示
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-destructive bg-destructive/12 text-destructive rounded-xl border p-4">
          <p className="font-medium">エラーが発生しました</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div id="inbox-view-panel" role="tabpanel" className="flex h-full flex-col">
      {/* ツールバー: 高さ48px固定（8px + 32px + 8px） */}
      <div className="flex h-12 shrink-0 items-center gap-2 px-4 py-2">
        {/* 左端: 表示モード切替（モバイル・デスクトップ共通） */}
        <DisplayModeSwitcher />

        {/* スペーサー */}
        <div className="flex-1" />

        {/* Notion風アイコンナビゲーション（検索・ソート・設定）- PC・モバイル共通 */}
        <TableNavigation config={navigationConfig} />

        {/* 作成ボタン: 固定位置（モバイル: アイコンのみ、PC: テキスト付き） */}
        <Button size="icon" className="shrink-0 md:hidden">
          <Plus className="size-4" />
        </Button>
        <Button className="hidden shrink-0 md:inline-flex">
          <Plus className="size-4" />
          新規作成
        </Button>
      </div>

      {/* Kanbanボード: 残りのスペース */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {isPending ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-muted-foreground text-sm">読み込み中...</p>
            </div>
          </div>
        ) : (
          <KanbanBoard items={items} />
        )}
      </div>
    </div>
  )
}
