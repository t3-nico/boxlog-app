'use client'

import { Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm'
import { Button } from '@/components/ui/button'
import { DataTable, type SortState } from '@/features/table'
import { TagRowWrapper, TagTableRowCreate, type TagTableRowCreateHandle } from '@/features/tags/components/table'
import { TagCreateModal } from '@/features/tags/components/tag-create-modal'
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog'
import { TagBulkMergeDialog } from '@/features/tags/components/TagBulkMergeDialog'
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog'
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions'
import { TagsFilterBar } from '@/features/tags/components/TagsFilterBar'
import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useTags, useUpdateTag } from '@/features/tags/hooks/use-tags'
import { getTagColumnSettings, useTagTableColumns } from '@/features/tags/hooks/useTagTableColumns'
import { useTagColumnStore, type TagColumnId } from '@/features/tags/stores/useTagColumnStore'
import { useTagPaginationStore } from '@/features/tags/stores/useTagPaginationStore'
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore'
import { useTagSortStore } from '@/features/tags/stores/useTagSortStore'
import type { Tag, TagGroup } from '@/features/tags/types'
import { api } from '@/lib/trpc'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface TagsPageClientProps {
  initialGroupNumber?: string
  showUncategorizedOnly?: boolean
}

export function TagsPageClient({ initialGroupNumber, showUncategorizedOnly = false }: TagsPageClientProps = {}) {
  const t = useTranslations()
  const pathname = usePathname()

  // データ取得
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true)
  const { data: groups = [] as TagGroup[] } = useTagGroups()
  // 最適化: 2つのクエリを1つに統合（DB側でGROUP BY集計）
  const { data: tagStats } = api.plans.getTagStats.useQuery()
  const tagPlanCounts = tagStats?.counts ?? {}
  const tagLastUsed = tagStats?.lastUsed ?? {}

  // コンテキスト
  const { tags, setTags, setIsLoading } = useTagsPageContext()

  // Zustand stores
  const { selectedIds, setSelectedIds, clearSelection, getSelectedIds, getSelectedCount } = useTagSelectionStore()
  const { sortField, sortDirection, setSort } = useTagSortStore()
  const { currentPage, pageSize, setCurrentPage, setPageSize } = useTagPaginationStore()
  const { getVisibleColumns, setColumnWidth, setColumnVisibility } = useTagColumnStore()

  // タグ操作
  const updateTagMutation = useUpdateTag()
  const { showCreateModal, handleSaveNewTag, handleDeleteTag, handleCloseModals } = useTagOperations(tags)

  // ローカル状態
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<Tag | null>(null)
  const [archiveConfirmTag, setArchiveConfirmTag] = useState<Tag | null>(null)
  const [bulkMergeTags, setBulkMergeTags] = useState<Tag[]>([])
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const createRowRef = useRef<TagTableRowCreateHandle>(null)

  // 表示列
  const visibleColumns = getVisibleColumns()
  const selectedTagIds = getSelectedIds()
  const selectedCount = getSelectedCount()

  // initialGroupNumber からグループIDを解決
  const initialGroup = useMemo(() => {
    if (!initialGroupNumber) return null
    return groups.find((g) => g.group_number === Number(initialGroupNumber)) ?? null
  }, [initialGroupNumber, groups])

  // 選択されたグループ情報を取得
  const selectedGroup = useMemo(() => {
    return selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null
  }, [selectedGroupId, groups])

  // ページタイトルを決定
  const pageTitle = useMemo(() => {
    if (showUncategorizedOnly) {
      return t('tags.sidebar.uncategorized')
    }
    if (pathname?.includes('/archive')) {
      return t('tags.sidebar.archive')
    }
    if (selectedGroup) {
      return selectedGroup.name
    }
    return t('tags.sidebar.allTags')
  }, [showUncategorizedOnly, pathname, selectedGroup, t])

  // initialGroup が解決されたら selectedGroupId を更新
  useEffect(() => {
    if (initialGroup && selectedGroupId !== initialGroup.id) {
      setSelectedGroupId(initialGroup.id)
    }
  }, [initialGroup, selectedGroupId])

  // タグデータをContextに同期（setTags/setIsLoadingは安定した関数なので依存配列から除外）
  useEffect(() => {
    setTags(fetchedTags)
    setIsLoading(isFetching)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedTags, isFetching])

  // アクティブなタグ数を計算
  const activeTagsCount = useMemo(() => {
    return tags.filter((tag) => tag.is_active).length
  }, [tags])

  // ページタイトルにタグ数を表示
  useEffect(() => {
    if (!showUncategorizedOnly && !initialGroupNumber) {
      document.title = `${t('tags.page.title')} (${activeTagsCount})`
    }
    return () => {
      document.title = t('tags.page.title')
    }
  }, [activeTagsCount, showUncategorizedOnly, initialGroupNumber, t])

  // すべてのアクティブなタグを取得
  const baseTags = useMemo(() => {
    return tags.filter((tag) => tag.is_active)
  }, [tags])

  // 検索とグループフィルタ適用
  const filteredTags = useMemo(() => {
    let filtered = baseTags
    if (showUncategorizedOnly) {
      filtered = filtered.filter((tag) => !tag.group_id)
    } else if (selectedGroupId) {
      filtered = filtered.filter((tag) => tag.group_id === selectedGroupId)
    }
    return filtered
  }, [baseTags, selectedGroupId, showUncategorizedOnly])

  // ソート適用
  const sortedTags = useMemo(() => {
    const sorted = [...filteredTags].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'tag_number':
          comparison = a.tag_number - b.tag_number
          break
        case 'group': {
          const groupA = a.group_id ? groups.find((g) => g.id === a.group_id)?.name || '' : ''
          const groupB = b.group_id ? groups.find((g) => g.id === b.group_id)?.name || '' : ''
          if (!groupA && groupB) return 1
          if (groupA && !groupB) return -1
          comparison = groupA.localeCompare(groupB)
          break
        }
        case 'last_used': {
          const lastUsedStrA = tagLastUsed[a.id]
          const lastUsedStrB = tagLastUsed[b.id]
          const lastUsedA = lastUsedStrA ? new Date(lastUsedStrA).getTime() : 0
          const lastUsedB = lastUsedStrB ? new Date(lastUsedStrB).getTime() : 0
          if (!lastUsedA && lastUsedB) return 1
          if (lastUsedA && !lastUsedB) return -1
          comparison = lastUsedA - lastUsedB
          break
        }
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredTags, sortField, sortDirection, groups, tagLastUsed])

  // ソート変更時にページ1に戻る
  useEffect(() => {
    setCurrentPage(1)
  }, [sortField, sortDirection, pageSize, setCurrentPage])

  // DataTable用のソート状態
  const sortState: SortState = useMemo(
    () => ({
      field: sortField,
      direction: sortDirection,
    }),
    [sortField, sortDirection]
  )

  // DataTable用のソート変更ハンドラー
  const handleSortChange = useCallback(
    (newSortState: SortState) => {
      if (newSortState.field) {
        setSort(newSortState.field as typeof sortField, newSortState.direction)
      }
    },
    [setSort]
  )

  // DataTable用の選択変更ハンドラー
  const handleSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedIds(Array.from(newSelectedIds))
    },
    [setSelectedIds]
  )

  // DataTable用のページネーション変更ハンドラー
  const handlePaginationChange = useCallback(
    (state: { currentPage: number; pageSize: number }) => {
      setCurrentPage(state.currentPage)
      setPageSize(state.pageSize)
    },
    [setCurrentPage, setPageSize]
  )

  // ハンドラー: グループ移動
  const handleMoveToGroup = useCallback(
    async (tag: Tag, groupId: string | null) => {
      try {
        await updateTagMutation.mutateAsync({
          id: tag.id,
          data: { group_id: groupId },
        })
        const group = groupId ? groups.find((g) => g.id === groupId) : null
        const groupName = group?.name ?? t('tags.page.noGroup')
        toast.success(t('tags.page.tagMoved', { name: tag.name, group: groupName }))
      } catch (error) {
        console.error('Failed to move tag to group:', error)
        toast.error(t('tags.page.tagMoveFailed'))
      }
    },
    [updateTagMutation, groups, t]
  )

  // ハンドラー: 一括アーカイブ
  const handleBulkArchive = useCallback(
    async (tagIds: string[]) => {
      try {
        for (const tagId of tagIds) {
          const tag = tags.find((t) => t.id === tagId)
          if (tag) {
            await updateTagMutation.mutateAsync({
              id: tag.id,
              data: { is_active: false },
            })
          }
        }
        toast.success(t('tags.page.bulkArchived', { count: tagIds.length }))
      } catch (error) {
        console.error('Failed to archive tags:', error)
        toast.error(t('tags.page.bulkArchiveFailed'))
      }
    },
    [tags, updateTagMutation, t]
  )

  // ハンドラー: 一括削除ダイアログを開く
  const handleOpenBulkDeleteDialog = useCallback(() => {
    const ids = selectedTagIds
    if (ids.size === 0) return
    setBulkDeleteDialogOpen(true)
  }, [selectedTagIds])

  // ハンドラー: 一括削除確認
  const handleBulkDeleteConfirm = useCallback(async () => {
    const ids = selectedTagIds
    if (ids.size === 0) return

    setIsBulkDeleting(true)
    try {
      for (const tagId of ids) {
        const tag = sortedTags.find((item) => item.id === tagId)
        if (tag) {
          await handleDeleteTag(tag)
        }
      }
      clearSelection()
    } finally {
      setIsBulkDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
  }, [selectedTagIds, sortedTags, handleDeleteTag, clearSelection])

  // ハンドラー: 一括マージダイアログを開く
  const handleOpenBulkMerge = useCallback(() => {
    const ids = selectedTagIds
    if (ids.size < 2) return
    const selectedTags = tags.filter((t) => ids.has(t.id))
    setBulkMergeTags(selectedTags)
  }, [selectedTagIds, tags])

  // ハンドラー: 一括マージダイアログを閉じる
  const handleCloseBulkMerge = useCallback(() => {
    setBulkMergeTags([])
    clearSelection()
  }, [clearSelection])

  // ハンドラー: アーカイブ確認ダイアログ
  const handleOpenArchiveConfirm = useCallback((tag: Tag) => {
    setArchiveConfirmTag(tag)
  }, [])

  const handleCloseArchiveConfirm = useCallback(() => {
    setArchiveConfirmTag(null)
  }, [])

  const handleConfirmArchive = useCallback(async () => {
    if (!archiveConfirmTag) return
    try {
      await updateTagMutation.mutateAsync({
        id: archiveConfirmTag.id,
        data: { is_active: false },
      })
      toast.success(t('tags.page.tagArchived', { name: archiveConfirmTag.name }))
      setArchiveConfirmTag(null)
    } catch (error) {
      console.error('Failed to archive tag:', error)
      toast.error(t('tags.page.tagArchiveFailed'))
    }
  }, [archiveConfirmTag, updateTagMutation, t])

  // ハンドラー: 削除確認ダイアログ
  const handleOpenDeleteConfirm = useCallback((tag: Tag) => {
    setDeleteConfirmTag(tag)
  }, [])

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirmTag(null)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmTag) return
    try {
      await handleDeleteTag(deleteConfirmTag)
      toast.success(t('tags.page.tagDeleted', { name: deleteConfirmTag.name }))
      setDeleteConfirmTag(null)
    } catch (error) {
      console.error('Failed to delete tag:', error)
      toast.error(t('tags.page.tagDeleteFailed'))
    }
  }, [deleteConfirmTag, handleDeleteTag, t])

  // ハンドラー: 列幅変更（stringをTagColumnIdにキャスト）
  const handleColumnWidthChange = useCallback(
    (columnId: string, width: number) => {
      setColumnWidth(columnId as TagColumnId, width)
    },
    [setColumnWidth]
  )

  // DataTable用の列定義 (extracted to hook)
  const columns = useTagTableColumns({
    groups,
    allTags: tags,
    planCounts: tagPlanCounts,
    lastUsed: tagLastUsed,
    visibleColumns,
    t,
  })

  // 列の表示設定用
  const columnSettings = useMemo(() => getTagColumnSettings(t), [t])

  // DataTable用の列幅マップ
  const columnWidths = useMemo(() => {
    const widths: Record<string, number> = {}
    visibleColumns.forEach((col) => {
      widths[col.id] = col.width
    })
    return widths
  }, [visibleColumns])

  // 行ラッパー
  const rowWrapper = useCallback(
    ({ item, children, isSelected }: { item: Tag; children: ReactNode; isSelected: boolean }) => (
      <TagRowWrapper
        key={item.id}
        tag={item}
        isSelected={isSelected}
        groups={groups}
        onMoveToGroup={handleMoveToGroup}
        onArchiveConfirm={handleOpenArchiveConfirm}
        onDeleteConfirm={handleOpenDeleteConfirm}
      >
        {children}
      </TagRowWrapper>
    ),
    [groups, handleMoveToGroup, handleOpenArchiveConfirm, handleOpenDeleteConfirm]
  )

  // ローディング表示
  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <TagsPageHeader title={pageTitle} count={filteredTags.length} />

      {/* フィルターバー または 選択バー */}
      {selectedCount > 0 ? (
        <TagsSelectionBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          actions={
            <TagSelectionActions
              selectedTagIds={Array.from(selectedTagIds)}
              tags={tags}
              groups={groups}
              onMoveToGroup={handleMoveToGroup}
              onArchive={handleBulkArchive}
              onDelete={handleOpenBulkDeleteDialog}
              onMerge={handleOpenBulkMerge}
              onClearSelection={clearSelection}
              t={t}
            />
          }
        />
      ) : (
        <TagsFilterBar
          columnSettings={columnSettings}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={setColumnVisibility}
          onCreateClick={() => createRowRef.current?.startCreate()}
          t={t}
        />
      )}

      {/* テーブル */}
      <div className="flex flex-1 flex-col overflow-auto px-6 pt-4 pb-2">
        <DataTable
          data={sortedTags}
          columns={columns}
          getRowKey={(tag) => tag.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          sortState={sortState}
          onSortChange={handleSortChange}
          showPagination
          paginationState={{ currentPage, pageSize }}
          onPaginationChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50, 100]}
          columnWidths={columnWidths}
          onColumnWidthChange={handleColumnWidthChange}
          rowWrapper={rowWrapper}
          onOutsideClick={clearSelection}
          selectAllLabel={t('tags.page.selectAll')}
          getSelectLabel={(tag) => t('tags.page.selectTag', { name: tag.name })}
          extraRows={
            <TagTableRowCreate ref={createRowRef} selectedGroupId={selectedGroupId} groups={groups} allTags={tags} />
          }
          emptyState={
            <div className="border-border flex h-64 items-center justify-center rounded-xl border-2 border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">{t('tags.page.noTags')}</p>
                <Button onClick={() => createRowRef.current?.startCreate()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('tags.page.addFirstTag')}
                </Button>
              </div>
            </div>
          }
        />
      </div>

      {/* モーダル */}
      <TagCreateModal isOpen={showCreateModal} onClose={handleCloseModals} onSave={handleSaveNewTag} />

      {/* アーカイブ確認ダイアログ */}
      <TagArchiveDialog tag={archiveConfirmTag} onClose={handleCloseArchiveConfirm} onConfirm={handleConfirmArchive} />

      {/* 削除確認ダイアログ */}
      <TagDeleteDialog tag={deleteConfirmTag} onClose={handleCloseDeleteConfirm} onConfirm={handleConfirmDelete} />

      {/* 一括マージダイアログ */}
      <TagBulkMergeDialog sourceTags={bulkMergeTags} onClose={handleCloseBulkMerge} />

      {/* 一括削除確認ダイアログ */}
      <AlertDialogConfirm
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDeleteConfirm}
        title={t('tags.page.bulkDeleteConfirmTitle', { count: selectedTagIds.size })}
        description={t('tags.page.bulkDeleteConfirmDescription', { count: selectedTagIds.size })}
        confirmText={isBulkDeleting ? t('common.plan.delete.deleting') : t('common.plan.delete.confirm')}
        cancelText={t('actions.cancel')}
        isLoading={isBulkDeleting}
        variant="destructive"
      />
    </div>
  )
}
