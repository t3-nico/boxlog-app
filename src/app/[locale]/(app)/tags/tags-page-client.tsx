'use client'

import {
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/features/i18n/lib/hooks'
import { TagCreateModal } from '@/features/tags/components/tag-create-modal'
import { TagEditModal } from '@/features/tags/components/tag-edit-modal'
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog'
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog'
import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useCreateTag, useTags, useUpdateTag } from '@/features/tags/hooks/use-tags'
import { useToast } from '@/lib/toast/use-toast'
import type { TagGroup, TagWithChildren } from '@/types/tags'

interface TagsPageClientProps {
  initialGroupNumber?: string
  showUncategorizedOnly?: boolean
}

export function TagsPageClient({ initialGroupNumber, showUncategorizedOnly = false }: TagsPageClientProps = {}) {
  const { t } = useI18n()
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true)
  const { data: groups = [] as TagGroup[] } = useTagGroups()
  const { tags, setTags, setIsLoading, setIsCreatingGroup, isCreatingTag, setIsCreatingTag } = useTagsPageContext()
  const router = useRouter()
  const pathname = usePathname()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<'name' | 'created_at'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  // カラム幅の状態管理
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
  const [searchQuery, setSearchQuery] = useState('')

  // アクティブなタグ数を計算
  const activeTagsCount = useMemo(() => {
    return tags.filter((tag) => tag.level === 0 && tag.is_active).length
  }, [tags])

  // ページタイトルにタグ数を表示（タグ一覧ページのみ）
  useEffect(() => {
    if (!showUncategorizedOnly && !initialGroupNumber) {
      document.title = `タグ管理 (${activeTagsCount})`
    }
    return () => {
      document.title = 'タグ管理'
    }
  }, [activeTagsCount, showUncategorizedOnly, initialGroupNumber])

  // インライン作成用の状態
  const inlineFormRef = useRef<HTMLTableRowElement>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagDescription, setNewTagDescription] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')

  // initialGroupNumber からグループIDを解決
  const initialGroup = useMemo(() => {
    if (!initialGroupNumber) return null
    const group = groups.find((g) => g.group_number === Number(initialGroupNumber))
    console.log('[TagsPageClient] Resolving group:', {
      initialGroupNumber,
      groups,
      foundGroup: group,
    })
    return group
  }, [initialGroupNumber, groups])

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroup?.id || null)

  const {
    showCreateModal,
    showEditModal,
    selectedTag,
    createParentTag,
    handleCreateTag,
    handleSaveNewTag,
    handleEditTag,
    handleSaveTag,
    handleDeleteTag,
    handleCloseModals,
  } = useTagOperations(tags)

  const updateTagMutation = useUpdateTag()
  const createTagMutation = useCreateTag()
  const toast = useToast()

  // 選択されたグループ情報を取得
  const selectedGroup = useMemo(() => {
    return selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null
  }, [selectedGroupId, groups])

  // ページタイトルを決定（サイドバーの選択状態に基づく）
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

  // initialGroup が解決されたら selectedGroupId を更新（selectedGroupIdが未設定の場合のみ）
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

  // インライン作成開始
  const handleStartInlineCreation = useCallback(() => {
    setIsCreatingTag(true)
    setNewTagName('')
    setNewTagDescription('')
    setNewTagColor('#3B82F6')
  }, [setIsCreatingTag])

  // インライン作成キャンセル
  const handleCancelInlineCreation = useCallback(() => {
    setIsCreatingTag(false)
    setNewTagName('')
    setNewTagDescription('')
    setNewTagColor('#3B82F6')
  }, [setIsCreatingTag])

  // インライン作成保存
  const handleSaveInlineTag = useCallback(async () => {
    if (newTagName.trim() === '') {
      handleCancelInlineCreation()
      return
    }

    try {
      await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        description: newTagDescription.trim() || undefined,
        color: newTagColor,
        group_id: selectedGroupId,
        level: 0,
      })
      toast.success(t('tags.page.tagCreated', { name: newTagName }))
      handleCancelInlineCreation()
    } catch (error) {
      console.error('Failed to create tag:', error)
      toast.error(t('tags.page.tagCreateFailed'))
    }
  }, [
    newTagName,
    newTagDescription,
    newTagColor,
    selectedGroupId,
    createTagMutation,
    toast,
    handleCancelInlineCreation,
  ])

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

  // インライン編集開始
  const startEditing = useCallback((tagId: string, field: 'name' | 'description', currentValue: string) => {
    setEditingTagId(tagId)
    setEditingField(field)
    setEditValue(currentValue || '')
  }, [])

  // インライン編集キャンセル
  const cancelEditing = useCallback(() => {
    setEditingTagId(null)
    setEditingField(null)
    setEditValue('')
  }, [])

  // インライン編集保存
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

  // カラー変更ハンドラー
  const handleColorChange = useCallback(
    async (tagId: string, newColor: string) => {
      try {
        await updateTagMutation.mutateAsync({
          id: tagId,
          data: { color: newColor },
        })
      } catch (error) {
        console.error('Failed to update tag color:', error)
      }
    },
    [updateTagMutation]
  )

  // アーカイブ確認ダイアログを開く
  const handleOpenArchiveConfirm = useCallback((tag: TagWithChildren) => {
    setArchiveConfirmTag(tag)
  }, [])

  // アーカイブ確認ダイアログを閉じる
  const handleCloseArchiveConfirm = useCallback(() => {
    setArchiveConfirmTag(null)
  }, [])

  // アーカイブの実行
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
  }, [archiveConfirmTag, updateTagMutation, toast, t])

  // 削除確認ダイアログを開く
  const handleOpenDeleteConfirm = useCallback((tag: TagWithChildren) => {
    setDeleteConfirmTag(tag)
  }, [])

  // 削除確認ダイアログを閉じる
  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirmTag(null)
  }, [])

  // 物理削除の実行
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
  }, [deleteConfirmTag, handleDeleteTag, toast, t])

  // タグをグループに移動
  const handleMoveToGroup = useCallback(
    async (tag: TagWithChildren, groupId: string | null) => {
      try {
        await updateTagMutation.mutateAsync({
          id: tag.id,
          data: {
            group_id: groupId,
          },
        })
        const group = groupId ? groups.find((g) => g.id === groupId) : null
        const groupName = group?.name ?? t('tags.page.noGroup')
        toast.success(t('tags.page.tagMoved', { name: tag.name, group: groupName }))
      } catch (error) {
        console.error('Failed to move tag to group:', error)
        toast.error(t('tags.page.tagMoveFailed'))
      }
    },
    [updateTagMutation, toast, groups, t]
  )

  // すべてのLevel 0タグ（ルートタグ）を直接取得
  // is_active = true のみをフィルタリング
  const baseTags = tags.filter((tag) => tag.level === 0 && tag.is_active)

  // 検索とグループフィルタ適用
  const filteredTags = useMemo(() => {
    let filtered = baseTags

    // 未分類フィルタ
    if (showUncategorizedOnly) {
      filtered = filtered.filter((tag) => !tag.group_id)
    } else if (selectedGroupId) {
      // グループフィルタ
      console.log('[TagsPageClient] Filtering by group:', {
        selectedGroupId,
        baseTags: baseTags.map((t) => ({ id: t.id, name: t.name, group_id: t.group_id })),
      })
      filtered = filtered.filter((tag) => tag.group_id === selectedGroupId)
      console.log(
        '[TagsPageClient] Filtered tags:',
        filtered.map((t) => ({ id: t.id, name: t.name }))
      )
    }

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tag) =>
          tag.name.toLowerCase().includes(query) ||
          (tag.description && tag.description.toLowerCase().includes(query)) ||
          `t-${tag.tag_number}`.includes(query)
      )
    }

    return filtered
  }, [baseTags, searchQuery, selectedGroupId, showUncategorizedOnly])

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
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredTags, sortField, sortDirection])

  // ページネーション
  const totalPages = Math.ceil(sortedTags.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const displayTags = sortedTags.slice(startIndex, endIndex)

  // ページ変更時にページをリセット
  useEffect(() => {
    setCurrentPage(1)
  }, [sortField, sortDirection, pageSize])

  // ソート変更ハンドラー
  const handleSort = (field: 'name' | 'created_at') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // 一括選択
  const allSelected = displayTags.length > 0 && selectedTagIds.length === displayTags.length
  const someSelected = selectedTagIds.length > 0 && selectedTagIds.length < displayTags.length

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedTagIds([])
    } else {
      setSelectedTagIds(displayTags.map((tag) => tag.id))
    }
  }

  const handleSelectTag = (tagId: string) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleBulkDelete = async () => {
    if (selectedTagIds.length === 0) return
    if (!confirm(`選択した${selectedTagIds.length}件のタグを削除しますか？`)) return

    for (const tagId of selectedTagIds) {
      const tag = displayTags.find((t) => t.id === tagId)
      if (tag) {
        await handleDeleteTag(tag)
      }
    }
    setSelectedTagIds([])
  }

  // カラムリサイズハンドラー
  const handleColumnResize = useCallback((columnId: keyof typeof columnWidths, delta: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnId]: Math.max(50, prev[columnId] + delta), // 最小幅50px
    }))
  }, [])

  // リサイズハンドルコンポーネント
  const ResizeHandle = ({ columnId }: { columnId: keyof typeof columnWidths }) => {
    const [isResizing, setIsResizing] = useState(false)
    const startXRef = useRef<number>(0)
    const startWidthRef = useRef<number>(0)

    const onMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)
        startXRef.current = e.clientX
        startWidthRef.current = columnWidths[columnId]

        const onMouseMove = (moveEvent: MouseEvent) => {
          const delta = moveEvent.clientX - startXRef.current
          setColumnWidths((prev) => ({
            ...prev,
            [columnId]: Math.max(50, startWidthRef.current + delta),
          }))
        }

        const onMouseUp = () => {
          setIsResizing(false)
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      },
      [columnId]
    )

    return (
      <div
        className={`hover:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize ${
          isResizing ? 'bg-primary' : ''
        }`}
        onMouseDown={onMouseDown}
        style={{ userSelect: 'none' }}
      />
    )
  }

  // 日時フォーマット関数
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
      {/* ヘッダー */}
      <TagsPageHeader title={pageTitle} />

      {/* ツールバー */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-4 px-4 pt-2 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          {/* 検索 */}
          <Input
            placeholder={t('tags.page.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-[150px] lg:w-[250px]"
          />
        </div>

        {/* 右側: ボタン群 */}
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreatingGroup(true)} size="sm" variant="outline" className="h-9">
            <Plus className="mr-2 size-4" />
            {t('tags.page.createGroup')}
          </Button>
          <Button onClick={handleStartInlineCreation} size="sm" className="h-9">
            <Plus className="mr-2 size-4" />
            {t('tags.page.createTag')}
          </Button>
        </div>
      </div>

      {/* 一括削除ボタン（選択時のみ表示） */}
      {selectedTagIds.length > 0 && (
        <div className="flex h-12 shrink-0 items-center gap-2 px-4 pt-2 md:px-6">
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-9">
            <Trash2 className="mr-2 size-4" />
            {t('tags.page.delete')} ({selectedTagIds.length})
          </Button>
        </div>
      )}

      {/* テーブル */}
      <div className="flex flex-1 flex-col overflow-auto px-4 pt-4 pb-2 md:px-6">
        {displayTags.length === 0 ? (
          <div className="border-border flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
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
            {/* テーブル部分 */}
            <div className="border-border overflow-x-auto rounded-lg border">
              <Table
                style={{
                  minWidth: `${Object.values(columnWidths).reduce((sum, width) => sum + width, 0)}px`,
                }}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="relative" style={{ width: `${columnWidths.select}px` }}>
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label={t('tags.page.selectAll')}
                      />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.id}px` }}>
                      ID
                      <ResizeHandle columnId="id" />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.color}px` }}></TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.name}px` }}>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="-ml-3">
                        {t('tags.page.name')}
                        {sortField === 'name' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                        {sortField !== 'name' && <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />}
                      </Button>
                      <ResizeHandle columnId="name" />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.description}px` }}>
                      {t('tags.page.description')}
                      <ResizeHandle columnId="description" />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.group}px` }}>
                      {t('tags.sidebar.groups')}
                      <ResizeHandle columnId="group" />
                    </TableHead>
                    <TableHead className="relative" style={{ width: `${columnWidths.created_at}px` }}>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="-ml-3">
                        {t('tags.page.createdAt')}
                        {sortField === 'created_at' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                        {sortField !== 'created_at' && <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />}
                      </Button>
                      <ResizeHandle columnId="created_at" />
                    </TableHead>
                    <TableHead
                      className="relative text-right"
                      style={{ width: `${columnWidths.actions}px` }}
                    ></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* 既存のタグ行 */}
                  {displayTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell style={{ width: `${columnWidths.select}px` }} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTagIds.includes(tag.id)}
                          onCheckedChange={() => handleSelectTag(tag.id)}
                          aria-label={`${tag.name}を選択`}
                        />
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground font-mono text-sm"
                        style={{ width: `${columnWidths.id}px` }}
                      >
                        t-{tag.tag_number}
                      </TableCell>
                      <TableCell className="pr-1" style={{ width: `${columnWidths.color}px` }}>
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#3B82F6' }}
                          aria-label="タグカラー"
                        />
                      </TableCell>
                      <TableCell className="pl-1 font-medium" style={{ width: `${columnWidths.name}px` }}>
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            const locale = pathname?.split('/')[1] || 'ja'
                            router.push(`/${locale}/tags/t-${tag.tag_number}`)
                          }}
                        >
                          {tag.name} <span className="text-muted-foreground">(0)</span>
                        </span>
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground group cursor-pointer"
                        style={{ width: `${columnWidths.description}px` }}
                      >
                        <span className="truncate">
                          {tag.description || (
                            <span className="opacity-0 transition-opacity group-hover:opacity-100">説明を追加...</span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.group}px` }}>
                        {tag.group_id
                          ? (() => {
                              const group = groups.find((g) => g.id === tag.group_id)
                              if (!group) {
                                return null
                              }
                              const groupTagCount = tags.filter(
                                (t) => t.group_id === group.id && t.is_active && t.level === 0
                              ).length
                              return (
                                <div className="flex items-center gap-1">
                                  <div
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: group.color || '#6B7280' }}
                                  />
                                  <span className="text-sm">
                                    {group.name} <span className="text-muted-foreground">({groupTagCount})</span>
                                  </span>
                                </div>
                              )
                            })()
                          : null}
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground text-xs"
                        style={{ width: `${columnWidths.created_at}px` }}
                      >
                        {formatDate(tag.created_at)}
                      </TableCell>
                      <TableCell className="text-right" style={{ width: `${columnWidths.actions}px` }}>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('🔴 DropdownMenuTrigger clicked for tag:', tag.name)
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="bottom" align="end" sideOffset={5} avoidCollisions={true}>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                const locale = pathname?.split('/')[1] || 'ja'
                                router.push(`/${locale}/tags/t-${tag.tag_number}`)
                              }}
                            >
                              {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTag(tag)
                              }}
                            >
                              {t('tags.page.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Folder className="mr-2 h-4 w-4" />
                                {t('tags.page.moveToGroup')}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMoveToGroup(tag, null)
                                  }}
                                >
                                  {t('tags.page.noGroup')}
                                </DropdownMenuItem>
                                {groups.map((group) => (
                                  <DropdownMenuItem
                                    key={group.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMoveToGroup(tag, group.id)
                                    }}
                                  >
                                    <div
                                      className="mr-2 h-3 w-3 rounded-full"
                                      style={{ backgroundColor: group.color || '#6B7280' }}
                                    />
                                    {group.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenArchiveConfirm(tag)
                              }}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              {t('tags.page.archive')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenDeleteConfirm(tag)
                              }}
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('tags.page.permanentDelete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* インライン作成行（最下部） */}
                  {isCreatingTag && (
                    <TableRow ref={inlineFormRef} className="bg-muted/30">
                      <TableCell style={{ width: `${columnWidths.select}px` }}></TableCell>
                      <TableCell
                        className="text-muted-foreground font-mono text-sm"
                        style={{ width: `${columnWidths.id}px` }}
                      >
                        -
                      </TableCell>
                      <TableCell className="pr-1" style={{ width: `${columnWidths.color}px` }}>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="hover:ring-offset-background focus-visible:ring-ring transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-none"
                              aria-label="カラーを変更"
                            >
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: newTagColor }}
                                aria-label="タグカラー"
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3" align="start">
                            <div className="grid grid-cols-5 gap-2">
                              {[
                                '#3B82F6',
                                '#10B981',
                                '#EF4444',
                                '#F59E0B',
                                '#8B5CF6',
                                '#EC4899',
                                '#06B6D4',
                                '#F97316',
                                '#6B7280',
                                '#6366F1',
                              ].map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setNewTagColor(color)}
                                  className={`h-8 w-8 shrink-0 rounded border-2 transition-all ${
                                    newTagColor === color ? 'border-foreground scale-110' : 'border-transparent'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  aria-label={`カラー ${color}`}
                                />
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="pl-1" style={{ width: `${columnWidths.name}px` }}>
                        <Input
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveInlineTag()
                            } else if (e.key === 'Escape') {
                              handleCancelInlineCreation()
                            }
                          }}
                          placeholder={t('tags.page.name')}
                          autoFocus
                          className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                        />
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.description}px` }}>
                        <Input
                          value={newTagDescription}
                          onChange={(e) => setNewTagDescription(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveInlineTag()
                            } else if (e.key === 'Escape') {
                              handleCancelInlineCreation()
                            }
                          }}
                          placeholder={t('tags.page.description')}
                          className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                        />
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.group}px` }}>
                        {selectedGroupId
                          ? (() => {
                              const group = groups.find((g) => g.id === selectedGroupId)
                              if (!group) {
                                return null
                              }
                              const groupTagCount = tags.filter(
                                (t) => t.group_id === group.id && t.is_active && t.level === 0
                              ).length
                              return (
                                <div className="flex items-center gap-1">
                                  <div
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: group.color || '#6B7280' }}
                                  />
                                  <span className="text-sm">
                                    {group.name} <span className="text-muted-foreground">({groupTagCount})</span>
                                  </span>
                                </div>
                              )
                            })()
                          : null}
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground text-xs"
                        style={{ width: `${columnWidths.created_at}px` }}
                      ></TableCell>
                      <TableCell className="text-right" style={{ width: `${columnWidths.actions}px` }}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* フッター: テーブルの外側に配置 */}
            <div className="shrink-0">
              <div className="flex items-center justify-between px-4 py-4 md:px-6">
                {/* 左側: 表示件数選択 */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{t('tags.page.rowsPerPage')}</span>
                  <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="h-9 w-[64px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 中央: ページ情報 */}
                <div className="text-muted-foreground text-sm">
                  {sortedTags.length > 0
                    ? `${startIndex + 1}〜${Math.min(endIndex, sortedTags.length)}件 ${t('tags.page.of')} ${sortedTags.length}件`
                    : '0件'}
                </div>

                {/* 右側: ページ移動ボタン */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="sr-only">{t('tags.page.previous')}</span>
                  </Button>
                  <div className="text-muted-foreground flex h-9 items-center px-3 text-sm">
                    {t('tags.page.page')} {currentPage} {t('tags.page.of')} {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="size-4" />
                    <span className="sr-only">{t('tags.page.next')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* モーダル */}
      <TagCreateModal isOpen={showCreateModal} onClose={handleCloseModals} onSave={handleSaveNewTag} />

      <TagEditModal isOpen={showEditModal} tag={selectedTag} onClose={handleCloseModals} onSave={handleSaveTag} />

      {/* アーカイブ確認ダイアログ */}
      <TagArchiveDialog tag={archiveConfirmTag} onClose={handleCloseArchiveConfirm} onConfirm={handleConfirmArchive} />

      {/* 削除確認ダイアログ */}
      <TagDeleteDialog tag={deleteConfirmTag} onClose={handleCloseDeleteConfirm} onConfirm={handleConfirmDelete} />
    </div>
  )
}
