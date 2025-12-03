'use client'

import { ArrowDown, ArrowUp, ArrowUpDown, Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import { useI18n } from '@/features/i18n/lib/hooks'
import { TagCreateModal } from '@/features/tags/components/tag-create-modal'
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog'
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog'
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions'
import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useCreateTag, useTags, useUpdateTag } from '@/features/tags/hooks/use-tags'
import type { TagGroup, TagWithChildren } from '@/features/tags/types'
import { api } from '@/lib/trpc'
import { toast } from 'sonner'

import { InlineCreateRow, ResizeHandle, TagRow, TagsFilterBar, TagsPagination } from './components'

interface TagsPageClientProps {
  initialGroupNumber?: string
  showUncategorizedOnly?: boolean
}

export function TagsPageClient({ initialGroupNumber, showUncategorizedOnly = false }: TagsPageClientProps = {}) {
  const { t } = useI18n()
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true)
  const { data: groups = [] as TagGroup[] } = useTagGroups()
  const { tags, setTags, setIsLoading, isCreatingTag, setIsCreatingTag } = useTagsPageContext()
  const router = useRouter()
  const pathname = usePathname()

  // 状態管理
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<'name' | 'created_at'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [columnWidths, setColumnWidths] = useState({
    select: 48,
    id: 80,
    color: 32,
    name: 200,
    description: 300,
    group: 120,
    created_at: 160,
    actions: 192,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<TagWithChildren | null>(null)
  const [archiveConfirmTag, setArchiveConfirmTag] = useState<TagWithChildren | null>(null)

  // インライン作成用の状態
  const inlineFormRef = useRef<HTMLTableRowElement>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [newTagColor, setNewTagColor] = useState<string>(DEFAULT_TAG_COLOR)

  // タグごとのプラン数を取得
  const { data: tagplanCounts = {} } = api.plans.getTagPlanCounts.useQuery()

  // initialGroupNumber からグループIDを解決
  const initialGroup = useMemo(() => {
    if (!initialGroupNumber) return null
    return groups.find((g) => g.group_number === Number(initialGroupNumber)) || null
  }, [initialGroupNumber, groups])

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroup?.id || null)

  const { showCreateModal, handleSaveNewTag, handleDeleteTag, handleCloseModals } = useTagOperations(tags)

  const updateTagMutation = useUpdateTag()
  const createTagMutation = useCreateTag()

  // 選択されたグループ情報を取得
  const selectedGroup = useMemo(() => {
    return selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null
  }, [selectedGroupId, groups])

  // ページタイトルを決定
  const pageTitle = useMemo(() => {
    if (showUncategorizedOnly) return t('tags.sidebar.uncategorized')
    if (pathname?.includes('/archive')) return t('tags.sidebar.archive')
    if (selectedGroup) return selectedGroup.name
    return t('tags.sidebar.allTags')
  }, [showUncategorizedOnly, pathname, selectedGroup, t])

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

  // フィルタリングとソート
  const baseTags = tags.filter((tag) => tag.level === 0 && tag.is_active)

  const filteredTags = useMemo(() => {
    let filtered = baseTags
    if (showUncategorizedOnly) {
      filtered = filtered.filter((tag) => !tag.group_id)
    } else if (selectedGroupId) {
      filtered = filtered.filter((tag) => tag.group_id === selectedGroupId)
    }
    return filtered
  }, [baseTags, selectedGroupId, showUncategorizedOnly])

  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => {
      let comparison = 0
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredTags, sortField, sortDirection])

  // ページネーション
  const totalPages = Math.ceil(sortedTags.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const displayTags = sortedTags.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [sortField, sortDirection, pageSize])

  // ハンドラー
  const handleSort = (field: 'name' | 'created_at') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleColumnResize = useCallback((columnId: string, newWidth: number) => {
    setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }))
  }, [])

  const handleStartInlineCreation = useCallback(() => {
    setIsCreatingTag(true)
    setNewTagName('')
    setNewTagDescription('')
    setNewTagColor(DEFAULT_TAG_COLOR)
  }, [setIsCreatingTag])

  const handleCancelInlineCreation = useCallback(() => {
    setIsCreatingTag(false)
    setNewTagName('')
    setNewTagDescription('')
    setNewTagColor(DEFAULT_TAG_COLOR)
  }, [setIsCreatingTag])

  const handleSaveInlineTag = useCallback(async () => {
    if (newTagName.trim() === '') {
      handleCancelInlineCreation()
      return
    }

    try {
      await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        description: newTagDescription.trim() || null,
        color: newTagColor,
        group_id: selectedGroupId,
        level: 0 as const,
      })
      toast.success(t('tags.page.tagCreated', { name: newTagName }))
      handleCancelInlineCreation()
    } catch (error) {
      console.error('Failed to create tag:', error)
      toast.error(t('tags.page.tagCreateFailed'))
    }
  }, [newTagName, newTagDescription, newTagColor, selectedGroupId, createTagMutation, handleCancelInlineCreation, t])

  // クリックアウトサイド検出
  useEffect(() => {
    if (!isCreatingTag) return

    const handleClickOutside = (event: MouseEvent) => {
      if (inlineFormRef.current && !inlineFormRef.current.contains(event.target as Node)) {
        handleCancelInlineCreation()
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCreatingTag, handleCancelInlineCreation])

  const handleEditTag = useCallback((tag: TagWithChildren) => {
    setEditingTagId(tag.id)
    setEditingField('name')
    setEditValue(tag.name)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingTagId(null)
    setEditingField(null)
    setEditValue('')
  }, [])

  const saveInlineEdit = useCallback(
    async (tagId: string) => {
      if (!editingField || editValue.trim() === '') {
        cancelEditing()
        return
      }

      try {
        await updateTagMutation.mutateAsync({
          id: tagId,
          data: { [editingField]: editValue.trim() },
        })
        cancelEditing()
      } catch (error) {
        console.error('Failed to update tag:', error)
      }
    },
    [editingField, editValue, updateTagMutation, cancelEditing]
  )

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

  const handleColorChange = useCallback(
    (tagId: string, color: string) => {
      updateTagMutation.mutate({ id: tagId, data: { color } })
    },
    [updateTagMutation]
  )

  const handleViewTag = useCallback(
    (tag: TagWithChildren) => {
      const locale = pathname?.split('/')[1] || 'ja'
      router.push(`/${locale}/tags/t-${tag.tag_number}`)
    },
    [pathname, router]
  )

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

  const handleBulkDelete = async () => {
    if (selectedTagIds.length === 0) return
    if (!confirm(t('tags.page.bulkDeleteConfirm', { count: selectedTagIds.length }))) return

    for (const tagId of selectedTagIds) {
      const tag = displayTags.find((t) => t.id === tagId)
      if (tag) await handleDeleteTag(tag)
    }
    setSelectedTagIds([])
  }

  // 選択状態
  const getCheckboxState = (): boolean | 'indeterminate' => {
    if (displayTags.length === 0) return false
    if (selectedTagIds.length === 0) return false
    if (selectedTagIds.length === displayTags.length) return true
    return 'indeterminate'
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  }

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TagsPageHeader title={pageTitle} count={filteredTags.length} />

      {selectedTagIds.length > 0 ? (
        <TagsSelectionBar
          selectedCount={selectedTagIds.length}
          onClearSelection={() => setSelectedTagIds([])}
          actions={
            <TagSelectionActions
              selectedTagIds={selectedTagIds}
              tags={tags}
              groups={groups}
              onMoveToGroup={handleMoveToGroup}
              onArchive={async (tagIds) => {
                try {
                  for (const tagId of tagIds) {
                    const tag = tags.find((t) => t.id === tagId)
                    if (tag) {
                      await updateTagMutation.mutateAsync({ id: tag.id, data: { is_active: false } })
                    }
                  }
                  toast.success(t('tags.page.bulkArchived', { count: tagIds.length }))
                } catch (error) {
                  console.error('Failed to archive tags:', error)
                  toast.error(t('tags.page.bulkArchiveFailed'))
                }
              }}
              onDelete={handleBulkDelete}
              onEdit={handleEditTag}
              onView={handleViewTag}
              onClearSelection={() => setSelectedTagIds([])}
              t={t}
            />
          }
        />
      ) : (
        <TagsFilterBar onCreateTag={handleStartInlineCreation} t={t} />
      )}

      <div
        className="flex flex-1 flex-col overflow-auto px-6 pt-4 pb-2"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedTagIds([])
        }}
      >
        {displayTags.length === 0 ? (
          <div className="border-border flex h-64 items-center justify-center rounded-xl border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{t('tags.page.noTags')}</p>
              <Button onClick={handleStartInlineCreation}>
                <Plus className="mr-2 h-4 w-4" />
                {t('tags.page.addFirstTag')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-border overflow-x-auto rounded-xl border">
              <Table
                style={{
                  minWidth: `${Object.values(columnWidths).reduce((sum, width) => sum + width, 0)}px`,
                }}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="relative" style={{ width: `${columnWidths.select}px` }}>
                      <Checkbox
                        checked={getCheckboxState()}
                        onCheckedChange={() => {
                          if (selectedTagIds.length === displayTags.length) {
                            setSelectedTagIds([])
                          } else {
                            setSelectedTagIds(displayTags.map((tag) => tag.id))
                          }
                        }}
                        aria-label={t('tags.page.selectAll')}
                      />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.id}px` }}>
                      ID
                      <ResizeHandle columnId="id" currentWidth={columnWidths.id} onResize={handleColumnResize} />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.color + columnWidths.name}px` }}>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="-ml-3">
                        {t('tags.page.name')}
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />
                        )}
                      </Button>
                      <ResizeHandle columnId="name" currentWidth={columnWidths.name} onResize={handleColumnResize} />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.description}px` }}>
                      {t('tags.page.description')}
                      <ResizeHandle
                        columnId="description"
                        currentWidth={columnWidths.description}
                        onResize={handleColumnResize}
                      />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.group}px` }}>
                      {t('tags.sidebar.groups')}
                      <ResizeHandle columnId="group" currentWidth={columnWidths.group} onResize={handleColumnResize} />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.created_at}px` }}>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="-ml-3">
                        {t('tags.page.createdAt')}
                        {sortField === 'created_at' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />
                        )}
                      </Button>
                      <ResizeHandle
                        columnId="created_at"
                        currentWidth={columnWidths.created_at}
                        onResize={handleColumnResize}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayTags.map((tag) => (
                    <TagRow
                      key={tag.id}
                      tag={tag}
                      groups={groups}
                      tags={tags}
                      columnWidths={columnWidths}
                      isSelected={selectedTagIds.includes(tag.id)}
                      isEditing={editingTagId === tag.id}
                      editingField={editingField}
                      editValue={editValue}
                      planCount={tagplanCounts[tag.id] || 0}
                      onSelect={(tagId) => {
                        setSelectedTagIds((prev) =>
                          prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
                        )
                      }}
                      onContextSelect={(tagId) => {
                        if (!selectedTagIds.includes(tagId)) {
                          setSelectedTagIds([tagId])
                        }
                      }}
                      onColorChange={handleColorChange}
                      onEditStart={handleEditTag}
                      onEditChange={setEditValue}
                      onEditSave={saveInlineEdit}
                      onEditCancel={cancelEditing}
                      onView={handleViewTag}
                      onMoveToGroup={handleMoveToGroup}
                      onArchive={setArchiveConfirmTag}
                      onDelete={setDeleteConfirmTag}
                      formatDate={formatDate}
                      t={t}
                    />
                  ))}
                  {isCreatingTag && (
                    <InlineCreateRow
                      ref={inlineFormRef}
                      columnWidths={columnWidths}
                      newTagName={newTagName}
                      newTagDescription={newTagDescription}
                      newTagColor={newTagColor}
                      selectedGroup={selectedGroup || null}
                      tags={tags}
                      onNameChange={setNewTagName}
                      onDescriptionChange={setNewTagDescription}
                      onColorChange={setNewTagColor}
                      onSave={handleSaveInlineTag}
                      onCancel={handleCancelInlineCreation}
                      t={t}
                    />
                  )}
                </TableBody>
              </Table>
            </div>

            <TagsPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={sortedTags.length}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              t={t}
            />
          </>
        )}
      </div>

      <TagCreateModal isOpen={showCreateModal} onClose={handleCloseModals} onSave={handleSaveNewTag} />
      <TagArchiveDialog
        tag={archiveConfirmTag}
        onClose={() => setArchiveConfirmTag(null)}
        onConfirm={handleConfirmArchive}
      />
      <TagDeleteDialog
        tag={deleteConfirmTag}
        onClose={() => setDeleteConfirmTag(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
