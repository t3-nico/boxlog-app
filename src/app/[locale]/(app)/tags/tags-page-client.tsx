'use client'

import { ChevronDown, Filter, Hash, Plus, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { ResizableTableHead, TablePagination } from '@/components/common/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/features/i18n/lib/hooks'
import { TagCreateModal } from '@/features/tags/components/tag-create-modal'
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog'
import { TagBulkMergeDialog } from '@/features/tags/components/TagBulkMergeDialog'
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog'
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions'
import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar'
import { TagTableRow, TagTableRowCreate, type TagTableRowCreateHandle } from '@/features/tags/components/table'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useTags, useUpdateTag } from '@/features/tags/hooks/use-tags'
import { useTagColumnStore, type TagColumnId } from '@/features/tags/stores/useTagColumnStore'
import { useTagPaginationStore } from '@/features/tags/stores/useTagPaginationStore'
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore'
import { useTagSortStore, type TagSortField } from '@/features/tags/stores/useTagSortStore'
import { api } from '@/lib/trpc'
import type { TagGroup, TagWithChildren } from '@/types/tags'
import { toast } from 'sonner'
import { useState } from 'react'

interface TagsPageClientProps {
  initialGroupNumber?: string
  showUncategorizedOnly?: boolean
}

export function TagsPageClient({ initialGroupNumber, showUncategorizedOnly = false }: TagsPageClientProps = {}) {
  const { t } = useI18n()
  const pathname = usePathname()

  // データ取得
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true)
  const { data: groups = [] as TagGroup[] } = useTagGroups()
  const { data: tagPlanCounts = {} } = api.plans.getTagPlanCounts.useQuery()
  const { data: tagLastUsed = {} } = api.plans.getTagLastUsed.useQuery()

  // コンテキスト
  const { tags, setTags, setIsLoading } = useTagsPageContext()

  // Zustand stores
  const { selectedIds, toggleSelection, toggleAll, clearSelection, getSelectedIds, getSelectedCount } =
    useTagSelectionStore()
  const { sortField, sortDirection, setSortField } = useTagSortStore()
  const { currentPage, pageSize, setCurrentPage, setPageSize } = useTagPaginationStore()
  const { getVisibleColumns, setColumnWidth, setColumnVisibility, getColumnWidth } = useTagColumnStore()

  // タグ操作
  const updateTagMutation = useUpdateTag()
  const { showCreateModal, handleSaveNewTag, handleDeleteTag, handleCloseModals } = useTagOperations(tags)

  // ローカル状態
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<TagWithChildren | null>(null)
  const [archiveConfirmTag, setArchiveConfirmTag] = useState<TagWithChildren | null>(null)
  const [bulkMergeTags, setBulkMergeTags] = useState<TagWithChildren[]>([])
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

  // タグデータをContextに同期
  useEffect(() => {
    setTags(fetchedTags)
    setIsLoading(isFetching)
  }, [fetchedTags, isFetching, setTags, setIsLoading])

  // アクティブなタグ数を計算
  const activeTagsCount = useMemo(() => {
    return tags.filter((tag) => tag.level === 0 && tag.is_active).length
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

  // すべてのLevel 0タグ（ルートタグ）を直接取得
  const baseTags = useMemo(() => {
    return tags.filter((tag) => tag.level === 0 && tag.is_active)
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
          const lastUsedA = tagLastUsed[a.id] ? new Date(tagLastUsed[a.id]).getTime() : 0
          const lastUsedB = tagLastUsed[b.id] ? new Date(tagLastUsed[b.id]).getTime() : 0
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

  // ページネーション
  const totalPages = Math.ceil(sortedTags.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const displayTags = sortedTags.slice(startIndex, endIndex)

  // ソート変更時にページ1に戻る
  useEffect(() => {
    setCurrentPage(1)
  }, [sortField, sortDirection, pageSize, setCurrentPage])

  // 全選択状態
  const currentPageIds = useMemo(() => displayTags.map((tag) => tag.id), [displayTags])
  const selectedCountInPage = useMemo(
    () => currentPageIds.filter((id) => selectedIds.has(id)).length,
    [currentPageIds, selectedIds]
  )
  const allSelected = selectedCountInPage === currentPageIds.length && currentPageIds.length > 0
  const someSelected = selectedCountInPage > 0 && selectedCountInPage < currentPageIds.length

  // 全選択ハンドラー
  const handleToggleAll = useCallback(() => {
    toggleAll(currentPageIds)
  }, [toggleAll, currentPageIds])

  // ハンドラー: グループ移動
  const handleMoveToGroup = useCallback(
    async (tag: TagWithChildren, groupId: string | null) => {
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

  // ハンドラー: 一括削除
  const handleBulkDelete = useCallback(async () => {
    const ids = selectedTagIds
    if (ids.length === 0) return
    if (!confirm(t('tags.page.bulkDeleteConfirm', { count: ids.length }))) return

    for (const tagId of ids) {
      const tag = displayTags.find((t) => t.id === tagId)
      if (tag) {
        await handleDeleteTag(tag)
      }
    }
    clearSelection()
  }, [selectedTagIds, displayTags, handleDeleteTag, clearSelection, t])

  // ハンドラー: 一括マージダイアログを開く
  const handleOpenBulkMerge = useCallback(() => {
    const ids = selectedTagIds
    if (ids.length < 2) return
    const selectedTags = tags.filter((t) => ids.includes(t.id))
    setBulkMergeTags(selectedTags)
  }, [selectedTagIds, tags])

  // ハンドラー: 一括マージダイアログを閉じる
  const handleCloseBulkMerge = useCallback(() => {
    setBulkMergeTags([])
    clearSelection()
  }, [clearSelection])

  // ハンドラー: アーカイブ確認ダイアログ
  const handleOpenArchiveConfirm = useCallback((tag: TagWithChildren) => {
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
  const handleOpenDeleteConfirm = useCallback((tag: TagWithChildren) => {
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

  // ソートハンドラー
  const handleSort = useCallback(
    (field: TagSortField) => {
      setSortField(field)
    },
    [setSortField]
  )

  // ローディング表示
  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  // 列の表示設定用
  const columnSettings: { id: TagColumnId; label: string }[] = [
    { id: 'id', label: 'ID' },
    { id: 'description', label: t('tags.page.description') },
    { id: 'group', label: t('tags.sidebar.groups') },
    { id: 'created_at', label: t('tags.page.createdAt') },
    { id: 'last_used', label: t('tags.page.lastUsed') },
  ]

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
              selectedTagIds={selectedTagIds}
              tags={tags}
              groups={groups}
              onMoveToGroup={handleMoveToGroup}
              onArchive={handleBulkArchive}
              onDelete={handleBulkDelete}
              onMerge={handleOpenBulkMerge}
              onClearSelection={clearSelection}
              t={t}
            />
          }
        />
      ) : (
        <div className="flex h-12 shrink-0 items-center justify-between px-6 py-2">
          <div className="flex h-8 items-center gap-2">
            {/* フィルタータイプドロップダウン */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>{t('tags.page.filter.type')}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>{t('tags.page.filter.all')}</DropdownMenuItem>
                <DropdownMenuItem>{t('tags.page.filter.unused')}</DropdownMenuItem>
                <DropdownMenuItem>{t('tags.page.filter.frequentlyUsed')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 列設定ドロップダウン */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>{t('tags.page.columns')}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{t('tags.page.columnSettings')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columnSettings.map((col) => {
                  const column = visibleColumns.find((c) => c.id === col.id)
                  const isVisible = !!column
                  return (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={isVisible}
                      onCheckedChange={(checked) => setColumnVisibility(col.id, checked)}
                    >
                      {col.label}
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex h-8 items-center">
            <Button onClick={() => createRowRef.current?.startCreate()} size="sm" className="h-8">
              <Plus className="mr-2 size-4" />
              {t('tags.page.createTag')}
            </Button>
          </div>
        </div>
      )}

      {/* テーブル */}
      <div
        className="flex flex-1 flex-col overflow-auto px-6 pt-4 pb-2"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            clearSelection()
          }
        }}
      >
        {displayTags.length === 0 && !createRowRef.current?.isCreating ? (
          <div className="border-border flex h-64 items-center justify-center rounded-xl border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{t('tags.page.noTags')}</p>
              <Button onClick={() => createRowRef.current?.startCreate()}>
                <Plus className="mr-2 h-4 w-4" />
                {t('tags.page.addFirstTag')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-border overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleColumns.map((column) => {
                      if (column.id === 'selection') {
                        return (
                          <TableHead key={column.id} style={{ width: `${column.width}px` }}>
                            <Checkbox
                              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                              onCheckedChange={handleToggleAll}
                              aria-label={t('tags.page.selectAll')}
                            />
                          </TableHead>
                        )
                      }

                      // ソート可能な列
                      const sortFieldMap: Record<string, TagSortField> = {
                        id: 'tag_number',
                        name: 'name',
                        group: 'group',
                        created_at: 'created_at',
                        last_used: 'last_used',
                      }
                      const columnSortField = sortFieldMap[column.id]
                      const isSorting = sortField === columnSortField

                      return (
                        <ResizableTableHead
                          key={column.id}
                          width={column.width}
                          resizable={column.resizable}
                          sortable={!!columnSortField}
                          isSorting={isSorting}
                          sortDirection={isSorting ? sortDirection : undefined}
                          onSort={columnSortField ? () => handleSort(columnSortField) : undefined}
                          onResize={(newWidth) => setColumnWidth(column.id, newWidth)}
                          icon={column.id === 'name' ? Hash : undefined}
                        >
                          {column.label}
                        </ResizableTableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTags.map((tag) => (
                    <TagTableRow
                      key={tag.id}
                      tag={tag}
                      groups={groups}
                      allTags={tags}
                      planCounts={tagPlanCounts}
                      lastUsed={tagLastUsed}
                      onMoveToGroup={handleMoveToGroup}
                      onArchiveConfirm={handleOpenArchiveConfirm}
                      onDeleteConfirm={handleOpenDeleteConfirm}
                    />
                  ))}
                  <TagTableRowCreate
                    ref={createRowRef}
                    selectedGroupId={selectedGroupId}
                    groups={groups}
                    allTags={tags}
                  />
                </TableBody>
              </Table>
            </div>

            {/* ページネーション */}
            <TablePagination
              totalItems={sortedTags.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50, 100]}
              showFirstLastButtons={false}
            />
          </>
        )}
      </div>

      {/* モーダル */}
      <TagCreateModal isOpen={showCreateModal} onClose={handleCloseModals} onSave={handleSaveNewTag} />

      {/* アーカイブ確認ダイアログ */}
      <TagArchiveDialog tag={archiveConfirmTag} onClose={handleCloseArchiveConfirm} onConfirm={handleConfirmArchive} />

      {/* 削除確認ダイアログ */}
      <TagDeleteDialog tag={deleteConfirmTag} onClose={handleCloseDeleteConfirm} onConfirm={handleConfirmDelete} />

      {/* 一括マージダイアログ */}
      <TagBulkMergeDialog sourceTags={bulkMergeTags} onClose={handleCloseBulkMerge} />
    </div>
  )
}
