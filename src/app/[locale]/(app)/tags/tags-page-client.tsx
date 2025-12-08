'use client'

import { Calendar, ChevronDown, FileText, Filter, Folder, Hash, Plus, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, type ColumnDef, type SortState } from '@/features/table'
import {
  TagCellContent,
  TagRowWrapper,
  TagTableRowCreate,
  type TagTableRowCreateHandle,
} from '@/features/tags/components/table'
import { TagCreateModal } from '@/features/tags/components/tag-create-modal'
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog'
import { TagBulkMergeDialog } from '@/features/tags/components/TagBulkMergeDialog'
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog'
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions'
import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useTags, useUpdateTag } from '@/features/tags/hooks/use-tags'
import { useTagColumnStore, type TagColumnId } from '@/features/tags/stores/useTagColumnStore'
import { useTagPaginationStore } from '@/features/tags/stores/useTagPaginationStore'
import { useTagSelectionStore } from '@/features/tags/stores/useTagSelectionStore'
import { useTagSortStore } from '@/features/tags/stores/useTagSortStore'
import { api } from '@/lib/trpc'
import type { TagGroup, TagWithChildren } from '@/types/tags'
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
  const { data: tagPlanCounts = {} } = api.plans.getTagPlanCounts.useQuery()
  const { data: tagLastUsed = {} } = api.plans.getTagLastUsed.useQuery()

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
    if (ids.size === 0) return
    if (!confirm(t('tags.page.bulkDeleteConfirm', { count: ids.size }))) return

    for (const tagId of ids) {
      const tag = sortedTags.find((item) => item.id === tagId)
      if (tag) {
        await handleDeleteTag(tag)
      }
    }
    clearSelection()
  }, [selectedTagIds, sortedTags, handleDeleteTag, clearSelection, t])

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

  // ハンドラー: 列幅変更（stringをTagColumnIdにキャスト）
  const handleColumnWidthChange = useCallback(
    (columnId: string, width: number) => {
      setColumnWidth(columnId as TagColumnId, width)
    },
    [setColumnWidth]
  )

  // DataTable用の列定義
  const columns: ColumnDef<TagWithChildren>[] = useMemo(() => {
    const allColumnDefs: ColumnDef<TagWithChildren>[] = [
      {
        id: 'id',
        label: 'ID',
        width: 80,
        resizable: true,
        sortKey: 'tag_number',
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="id"
            groups={groups}
            allTags={tags}
            planCounts={tagPlanCounts}
            lastUsed={tagLastUsed}
          />
        ),
      },
      {
        id: 'name',
        label: t('tags.page.name'),
        width: 200,
        resizable: true,
        sortKey: 'name',
        icon: Hash,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="name"
            groups={groups}
            allTags={tags}
            planCounts={tagPlanCounts}
            lastUsed={tagLastUsed}
          />
        ),
      },
      {
        id: 'description',
        label: t('tags.page.description'),
        width: 300,
        resizable: true,
        icon: FileText,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="description"
            groups={groups}
            allTags={tags}
            planCounts={tagPlanCounts}
            lastUsed={tagLastUsed}
          />
        ),
      },
      {
        id: 'group',
        label: t('tags.sidebar.groups'),
        width: 150,
        resizable: true,
        sortKey: 'group',
        icon: Folder,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="group"
            groups={groups}
            allTags={tags}
            planCounts={tagPlanCounts}
            lastUsed={tagLastUsed}
          />
        ),
      },
      {
        id: 'created_at',
        label: t('tags.page.createdAt'),
        width: 150,
        resizable: true,
        sortKey: 'created_at',
        icon: Calendar,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="created_at"
            groups={groups}
            allTags={tags}
            planCounts={tagPlanCounts}
            lastUsed={tagLastUsed}
          />
        ),
      },
      {
        id: 'last_used',
        label: t('tags.page.lastUsed'),
        width: 150,
        resizable: true,
        sortKey: 'last_used',
        icon: Calendar,
        render: (tag) => (
          <TagCellContent
            tag={tag}
            columnId="last_used"
            groups={groups}
            allTags={tags}
            planCounts={tagPlanCounts}
            lastUsed={tagLastUsed}
          />
        ),
      },
    ]

    // 表示列のみをフィルタリング
    const visibleColumnIds = visibleColumns.filter((c) => c.id !== 'selection').map((c) => c.id)
    return allColumnDefs.filter((col) => visibleColumnIds.includes(col.id as TagColumnId))
  }, [t, groups, tags, tagPlanCounts, tagLastUsed, visibleColumns])

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
    ({ item, children, isSelected }: { item: TagWithChildren; children: ReactNode; isSelected: boolean }) => (
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
              selectedTagIds={Array.from(selectedTagIds)}
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
    </div>
  )
}
