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
  X,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TagArchiveDialog } from '@/features/tags/components/TagArchiveDialog'
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog'
import { TagCreateModal } from '@/features/tags/components/tag-create-modal'
import { TagEditModal } from '@/features/tags/components/tag-edit-modal'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useTags, useUpdateTag } from '@/features/tags/hooks/use-tags'
import { useToast } from '@/lib/toast/use-toast'
import type { TagWithChildren } from '@/types/tags'

type SortField = 'name' | 'created_at'
type SortDirection = 'asc' | 'desc'

interface TagsPageClientProps {
  initialGroupNumber?: string
  showUncategorizedOnly?: boolean
}

export function TagsPageClient({ initialGroupNumber, showUncategorizedOnly = false }: TagsPageClientProps = {}) {
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true)
  const { data: groups = [] } = useTagGroups()
  const { tags, setTags, setIsLoading, setIsCreatingGroup } = useTagsPageContext()
  const router = useRouter()
  const pathname = usePathname()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<TagWithChildren | null>(null)
  const [archiveConfirmTag, setArchiveConfirmTag] = useState<TagWithChildren | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
  const toast = useToast()

  // 選択されたグループ情報を取得
  const selectedGroup = useMemo(() => {
    return selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : null
  }, [selectedGroupId, groups])

  // initialGroup が解決されたら selectedGroupId を更新
  useEffect(() => {
    if (initialGroup) {
      setSelectedGroupId(initialGroup.id)
    }
  }, [initialGroup])

  // タグデータをContextに同期
  useEffect(() => {
    setTags(fetchedTags)
    setIsLoading(isFetching)
  }, [fetchedTags, isFetching, setTags, setIsLoading])

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
      toast.success(`タグ「${archiveConfirmTag.name}」をアーカイブしました`)
      setArchiveConfirmTag(null)
    } catch (error) {
      console.error('Failed to archive tag:', error)
      toast.error('タグのアーカイブに失敗しました')
    }
  }, [archiveConfirmTag, updateTagMutation, toast])

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
      toast.success(`タグ「${deleteConfirmTag.name}」を完全に削除しました`)
      setDeleteConfirmTag(null)
    } catch (error) {
      console.error('Failed to delete tag:', error)
      toast.error('タグの削除に失敗しました')
    }
  }, [deleteConfirmTag, handleDeleteTag, toast])

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
        const groupName = groupId ? groups.find((g) => g.id === groupId)?.name : 'グループなし'
        toast.success(`タグ「${tag.name}」を${groupName}に移動しました`)
      } catch (error) {
        console.error('Failed to move tag to group:', error)
        toast.error('タグの移動に失敗しました')
      }
    },
    [updateTagMutation, toast, groups]
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
  const handleSort = (field: SortField) => {
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
      {/* ツールバー */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          {/* 検索 */}
          <Input
            placeholder="タグを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-[150px] lg:w-[250px]"
          />

          {/* グループフィルタバッジ（未分類ページでは非表示） */}
          {!showUncategorizedOnly && selectedGroup && (
            <div className="bg-accent text-accent-foreground flex items-center gap-1 rounded-md px-2 py-1 text-sm">
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: selectedGroup.color || '#6B7280' }}
              />
              <span>{selectedGroup.name}</span>
              <button
                onClick={() => setSelectedGroupId(null)}
                className="hover:bg-accent-foreground/20 ml-1 rounded-sm p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* 一括削除ボタン（選択時のみ表示） */}
          {selectedTagIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-9">
              <Trash2 className="mr-2 size-4" />
              削除 ({selectedTagIds.length})
            </Button>
          )}
        </div>

        {/* 右側: ボタン群 */}
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreatingGroup(true)} size="sm" variant="outline" className="h-9">
            <Plus className="mr-2 size-4" />
            グループを作成
          </Button>
          <Button onClick={() => handleCreateTag()} size="sm" className="h-9">
            <Plus className="mr-2 size-4" />
            タグを作成
          </Button>
        </div>
      </div>

      {/* テーブル */}
      <div className="flex flex-1 flex-col overflow-hidden px-4 md:px-6">
        {displayTags.length === 0 ? (
          <div className="border-border flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">タグがありません</p>
              <Button onClick={() => handleCreateTag()}>
                <Plus className="mr-2 h-4 w-4" />
                最初のタグを追加
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* テーブル部分: 枠で囲む */}
            <div className="border-border flex-1 rounded-lg border" style={{ overflow: 'clip' }}>
              {/* ヘッダー: 固定 */}
              <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                <Table className="min-w-full" style={{ tableLayout: 'fixed' }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: '48px' }}>
                        <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} aria-label="すべて選択" />
                      </TableHead>
                      <TableHead style={{ width: '80px' }}>ID</TableHead>
                      <TableHead style={{ width: '32px' }}></TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="-ml-3">
                          名前
                          {sortField === 'name' &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                          {sortField !== 'name' && <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />}
                        </Button>
                      </TableHead>
                      <TableHead>説明</TableHead>
                      <TableHead style={{ width: '160px' }}>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="-ml-3">
                          作成日時
                          {sortField === 'created_at' &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                          {sortField !== 'created_at' && <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />}
                        </Button>
                      </TableHead>
                      <TableHead style={{ width: '192px' }} className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              {/* ボディ: スクロール可能 */}
              <div
                className="h-full"
                style={{ height: 'calc(100% - 41px)', overflowX: 'auto', overflowY: 'auto', overflowClipMargin: '0px' }}
              >
                <Table className="min-w-full" style={{ tableLayout: 'fixed' }}>
                  <TableBody>
                    {displayTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell style={{ width: '48px' }} onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedTagIds.includes(tag.id)}
                            onCheckedChange={() => handleSelectTag(tag.id)}
                            aria-label={`${tag.name}を選択`}
                          />
                        </TableCell>
                        <TableCell style={{ width: '80px' }} className="text-muted-foreground font-mono text-sm">
                          t-{tag.tag_number}
                        </TableCell>
                        <TableCell style={{ width: '32px' }} className="pr-1">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color || '#3B82F6' }}
                            aria-label="タグカラー"
                          />
                        </TableCell>
                        <TableCell className="pl-1 font-medium">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => {
                              const locale = pathname?.split('/')[1] || 'ja'
                              router.push(`/${locale}/tags/t-${tag.tag_number}`)
                            }}
                          >
                            {tag.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <span className="truncate">{tag.description || '-'}</span>
                        </TableCell>
                        <TableCell style={{ width: '160px' }} className="text-muted-foreground text-xs">
                          {formatDate(tag.created_at)}
                        </TableCell>
                        <TableCell style={{ width: '192px' }} className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const locale = pathname?.split('/')[1] || 'ja'
                                  router.push(`/${locale}/tags/t-${tag.tag_number}`)
                                }}
                              >
                                表示
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditTag(tag)
                                }}
                              >
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Folder className="mr-2 h-4 w-4" />
                                  グループに移動
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMoveToGroup(tag, null)
                                    }}
                                  >
                                    グループなし
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
                                アーカイブ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenDeleteConfirm(tag)
                                }}
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                完全に削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* フッター: テーブルの外側に配置 */}
            <div className="shrink-0">
              <div className="flex items-center justify-between px-4 py-4 md:px-6">
                {/* 左側: 表示件数選択 */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">表示件数</span>
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
                    ? `${startIndex + 1}〜${Math.min(endIndex, sortedTags.length)}件 / 全${sortedTags.length}件`
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
                    <span className="sr-only">前のページ</span>
                  </Button>
                  <div className="text-muted-foreground flex h-9 items-center px-3 text-sm">
                    ページ {currentPage} / {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="size-4" />
                    <span className="sr-only">次のページ</span>
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
