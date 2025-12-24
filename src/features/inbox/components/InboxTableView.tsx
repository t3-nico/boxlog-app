'use client'

import type { PlanStatus } from '@/features/plans/types/plan'
import { ChevronDown, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { MEDIA_QUERIES } from '@/config/ui/breakpoints'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { TablePagination } from '@/features/table'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useTranslations } from 'next-intl'
import type { InboxItem } from '../hooks/useInboxData'
import { useInboxData } from '../hooks/useInboxData'
import { useInboxFilterStore } from '../stores/useInboxFilterStore'
import { useInboxGroupStore } from '../stores/useInboxGroupStore'
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore'
import { useInboxSelectionStore } from '../stores/useInboxSelectionStore'
import { useInboxSortStore } from '../stores/useInboxSortStore'
import { useInboxViewStore } from '../stores/useInboxViewStore'
import { DisplayModeSwitcher } from './DisplayModeSwitcher'
import { BulkDatePickerDialog } from './table/BulkDatePickerDialog'
import { BulkTagSelectDialog } from './table/BulkTagSelectDialog'
import { GroupBySelector } from './table/GroupBySelector'
import { InboxSelectionActions } from './table/InboxSelectionActions'
import { InboxSelectionBar } from './table/InboxSelectionBar'
import { InboxTableContent } from './table/InboxTableContent'
import { type InboxTableRowCreateHandle } from './table/InboxTableRowCreate'
import { MobileTableSettingsSheet } from './table/MobileTableSettingsSheet'
import { TableToolbar } from './table/TableToolbar'

/**
 * Inbox Table View コンポーネント
 *
 * テーブル形式でプランを表示
 * - useInboxData でデータ取得
 * - useInboxFilterStore でフィルタ管理
 * - 行クリックで Inspector 表示
 *
 * パフォーマンス最適化:
 * - Store監視をselectorで必要な値のみに限定
 * - テーブル本体はInboxTableContentに委譲（担当制）
 * - 各子コンポーネントはmemo化済み
 *
 * @example
 * ```tsx
 * <InboxTableView />
 * ```
 */
export function InboxTableView() {
  const t = useTranslations()
  const { bulkUpdatePlan, bulkDeletePlan, createPlan } = usePlanMutations()

  // フィルター関連：必要な値のみselectorで取得
  const filterStatus = useInboxFilterStore((state) => state.status)
  const filterSearch = useInboxFilterStore((state) => state.search)
  const filterTags = useInboxFilterStore((state) => state.tags)
  const filterDueDate = useInboxFilterStore((state) => state.dueDate)
  const setStatus = useInboxFilterStore((state) => state.setStatus)
  const setSearch = useInboxFilterStore((state) => state.setSearch)

  // ソート関連
  const setSort = useInboxSortStore((state) => state.setSort)

  // ページネーション関連
  const currentPage = useInboxPaginationStore((state) => state.currentPage)
  const pageSize = useInboxPaginationStore((state) => state.pageSize)
  const setCurrentPage = useInboxPaginationStore((state) => state.setCurrentPage)
  const setPageSize = useInboxPaginationStore((state) => state.setPageSize)

  // 選択関連
  const selectedIds = useInboxSelectionStore((state) => state.selectedIds)
  const clearSelection = useInboxSelectionStore((state) => state.clearSelection)

  // ビュー関連
  const getActiveView = useInboxViewStore((state) => state.getActiveView)

  // グループ化関連（ページネーション表示判定用）
  const groupBy = useInboxGroupStore((state) => state.groupBy)

  // モバイル判定
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile)

  // モバイル用「もっと見る」の表示件数（初期50件、クリックで50件追加）
  const MOBILE_INITIAL_LIMIT = 50
  const MOBILE_LOAD_MORE_COUNT = 50
  const [mobileDisplayLimit, setMobileDisplayLimit] = useState(MOBILE_INITIAL_LIMIT)

  // 期限一括変更ダイアログの状態
  const [showDateDialog, setShowDateDialog] = useState(false)
  // タグ一括追加ダイアログの状態
  const [showTagDialog, setShowTagDialog] = useState(false)
  // モバイル用シート状態
  const [showSearchSheet, setShowSearchSheet] = useState(false)
  const [showSortSheet, setShowSortSheet] = useState(false)
  const [showSettingsSheet, setShowSettingsSheet] = useState(false)

  // データ取得
  const { items, isPending, error } = useInboxData({
    status: filterStatus[0] as PlanStatus | undefined,
    search: filterSearch,
    tags: filterTags,
    dueDate: filterDueDate,
  })

  // 新規作成行のref
  const createRowRef = useRef<InboxTableRowCreateHandle>(null)

  // 選択数
  const selectedCount = selectedIds.size

  // アクションハンドラー: アーカイブ（status を 'done' に変更）
  const handleArchive = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    try {
      await bulkUpdatePlan.mutateAsync({
        ids,
        data: { status: 'done' },
      })
      clearSelection()
    } catch (error) {
      console.error('Archive error:', error)
    }
  }

  // アクションハンドラー: 削除（確認ダイアログ付き）
  const handleDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    // 確認ダイアログ
    if (!window.confirm(t('common.inbox.deleteConfirm', { count: ids.length }))) {
      return
    }

    try {
      await bulkDeletePlan.mutateAsync({ ids })
      clearSelection()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // アクションハンドラー: 編集（Inspectorを開く）
  const handleEdit = (item: InboxItem) => {
    usePlanInspectorStore.getState().openInspector(item.id)
  }

  // アクションハンドラー: 複製
  const handleDuplicate = async (item: InboxItem) => {
    try {
      await createPlan.mutateAsync({
        title: `${item.title} (copy)`,
        status: item.status,
        description: item.description || undefined,
        due_date: item.due_date || undefined,
      })
    } catch (error) {
      console.error('Duplicate error:', error)
    }
  }

  // アクションハンドラー: タグ一括追加（ダイアログを開く）
  const handleAddTags = () => {
    setShowTagDialog(true)
  }

  // アクションハンドラー: 期限一括変更（ダイアログを開く）
  const handleChangeDueDate = () => {
    setShowDateDialog(true)
  }

  // アクティブなビューを取得
  const activeView = getActiveView()

  // アクティブビュー変更時にフィルター・ソート・ページサイズを適用
  useEffect(() => {
    if (!activeView) return

    // フィルター適用
    if (activeView.filters.status) {
      setStatus(activeView.filters.status as PlanStatus[])
    }
    if (activeView.filters.search) {
      setSearch(activeView.filters.search)
    }

    // ソート適用
    if (activeView.sorting) {
      setSort(activeView.sorting.field, activeView.sorting.direction)
    }

    // ページサイズ適用
    if (activeView.pageSize) {
      setPageSize(activeView.pageSize)
    }
  }, [activeView, setStatus, setSearch, setSort, setPageSize])

  // フィルター変更時にページ1に戻る＆モバイル表示件数リセット
  useEffect(() => {
    setCurrentPage(1)
    setMobileDisplayLimit(MOBILE_INITIAL_LIMIT)
  }, [filterStatus, filterSearch, setCurrentPage])

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

  // ローディング表示
  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div id="inbox-table-view-panel" role="tabpanel" className="flex h-full flex-col">
      {/* ツールバー または 選択バー（Googleドライブ風） */}
      {selectedCount > 0 ? (
        <InboxSelectionBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          actions={
            <InboxSelectionActions
              selectedCount={selectedCount}
              selectedIds={Array.from(selectedIds)}
              items={items}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onAddTags={handleAddTags}
              onChangeDueDate={handleChangeDueDate}
              onClearSelection={clearSelection}
            />
          }
        />
      ) : (
        <div className="flex h-12 shrink-0 items-center gap-2 px-4 py-2">
          {/* 左端: 表示モード切替（モバイル・デスクトップ共通） */}
          <DisplayModeSwitcher />

          {/* デスクトップ: グループ・フィルター等のツールバー */}
          <div className="hidden h-8 flex-1 items-center gap-2 overflow-x-auto md:flex">
            <GroupBySelector />
            <TableToolbar />
          </div>

          {/* モバイル: スペーサー */}
          <div className="flex-1 md:hidden" />

          {/* モバイル: 設定シートボタン（作成ボタンの左隣） */}
          <div className="md:hidden">
            <MobileTableSettingsSheet />
          </div>

          {/* 作成ボタン: 固定位置（モバイル: アイコンのみ、PC: テキスト付き） */}
          <Button onClick={() => createRowRef.current?.startCreate()} size="sm" className="shrink-0 md:hidden">
            <Plus className="size-4" />
          </Button>
          <Button onClick={() => createRowRef.current?.startCreate()} className="hidden shrink-0 md:inline-flex">
            <Plus className="size-4" />
            {t('common.inbox.createNew')}
          </Button>
        </div>
      )}

      {/* テーブル - InboxTableContentに委譲（担当制） */}
      <div
        className="flex flex-1 flex-col overflow-hidden px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            useInboxSelectionStore.getState().clearSelection()
          }
        }}
      >
        <div className="border-border flex flex-1 flex-col overflow-auto rounded-xl border [&::-webkit-scrollbar-corner]:rounded-xl [&::-webkit-scrollbar-track]:rounded-xl">
          <InboxTableContent
            items={items}
            createRowRef={createRowRef}
            mobileDisplayLimit={isMobile ? mobileDisplayLimit : undefined}
          />
        </div>

        {/* フッター */}
        {!groupBy && (
          <>
            {/* モバイル: もっと見るボタン（件数が超えている場合のみ） */}
            {isMobile && items.length > mobileDisplayLimit && (
              <div className="flex shrink-0 justify-center py-4">
                <Button
                  variant="outline"
                  onClick={() => setMobileDisplayLimit((prev) => prev + MOBILE_LOAD_MORE_COUNT)}
                  className="gap-2"
                >
                  <ChevronDown className="size-4" />
                  {t('table.loadMore', { count: Math.min(MOBILE_LOAD_MORE_COUNT, items.length - mobileDisplayLimit) })}
                </Button>
              </div>
            )}
            {/* デスクトップ: ページネーション */}
            <div className="hidden shrink-0 md:block">
              <TablePagination
                totalItems={items.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </>
        )}
      </div>

      {/* 期限一括設定ダイアログ */}
      <BulkDatePickerDialog
        open={showDateDialog}
        onOpenChange={setShowDateDialog}
        selectedIds={Array.from(selectedIds)}
        onSuccess={() => {
          clearSelection()
          setShowDateDialog(false)
        }}
      />

      {/* タグ一括追加ダイアログ */}
      <BulkTagSelectDialog
        open={showTagDialog}
        onOpenChange={setShowTagDialog}
        selectedPlanIds={Array.from(selectedIds)}
        onSuccess={() => {
          clearSelection()
          setShowTagDialog(false)
        }}
      />
    </div>
  )
}
