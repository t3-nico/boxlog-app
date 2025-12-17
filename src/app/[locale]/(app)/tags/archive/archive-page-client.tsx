'use client'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DEFAULT_TAG_COLOR } from '@/config/ui/colors'
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog'
import { TagSelectionActions } from '@/features/tags/components/TagSelectionActions'
import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { TagsSelectionBar } from '@/features/tags/components/TagsSelectionBar'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useTags, useUpdateTag } from '@/features/tags/hooks/use-tags'
import type { Tag } from '@/features/tags/types'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

type SortField = 'name' | 'created_at'
type SortDirection = 'asc' | 'desc'

export function ArchivePageClient() {
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true)
  const { tags, setTags, setIsLoading } = useTagsPageContext()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<Tag | null>(null)
  const [restoreConfirmTag, setRestoreConfirmTag] = useState<Tag | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const { handleDeleteTag, handleEditTag } = useTagOperations(tags)

  const updateTagMutation = useUpdateTag()

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

  // 復元ダイアログを開く
  const handleOpenRestoreConfirm = useCallback((tag: Tag) => {
    setRestoreConfirmTag(tag)
  }, [])

  // 復元確認ハンドラー（is_active = true）
  const handleConfirmRestore = useCallback(async () => {
    if (!restoreConfirmTag) return

    try {
      await updateTagMutation.mutateAsync({
        id: restoreConfirmTag.id,
        data: { is_active: true },
      })
      toast.success(t('tag.archive.restoreSuccess', { name: restoreConfirmTag.name }))
      setRestoreConfirmTag(null)
    } catch (error) {
      console.error('Failed to restore tag:', error)
      toast.error(t('tag.archive.restoreFailed'))
    }
  }, [restoreConfirmTag, updateTagMutation, t])

  // 削除確認ダイアログを開く
  const handleOpenDeleteConfirm = useCallback((tag: Tag) => {
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
      toast.success(t('tag.archive.deleteSuccess', { name: deleteConfirmTag.name }))
      setDeleteConfirmTag(null)
    } catch (error) {
      console.error('Failed to delete tag:', error)
      toast.error(t('tag.archive.deleteFailed'))
    }
  }, [deleteConfirmTag, handleDeleteTag, t])

  // アーカイブされたタグのみを取得（is_active = false）
  const baseTags = tags.filter((tag) => !tag.is_active)

  // ソート適用
  const sortedTags = useMemo(() => {
    const sorted = [...baseTags].sort((a, b) => {
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
  }, [baseTags, sortField, sortDirection])

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

  // 一括削除ダイアログを開く
  const handleOpenBulkDeleteDialog = useCallback(() => {
    if (selectedTagIds.length === 0) return
    setBulkDeleteDialogOpen(true)
  }, [selectedTagIds])

  // 一括削除確認ハンドラー
  const handleBulkDeleteConfirm = useCallback(async () => {
    if (selectedTagIds.length === 0) return

    setIsBulkDeleting(true)
    try {
      for (const tagId of selectedTagIds) {
        const tag = displayTags.find((t) => t.id === tagId)
        if (tag) {
          await handleDeleteTag(tag)
        }
      }
      setSelectedTagIds([])
    } finally {
      setIsBulkDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
  }, [selectedTagIds, displayTags, handleDeleteTag])

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
      <TagsPageHeader title={t('tag.sidebar.archive')} count={baseTags.length} />

      {/* 選択バー（Googleドライブ風） */}
      <TagsSelectionBar
        selectedCount={selectedTagIds.length}
        onClearSelection={() => setSelectedTagIds([])}
        actions={
          <TagSelectionActions
            selectedTagIds={selectedTagIds}
            tags={tags}
            groups={[]}
            onMoveToGroup={() => {}}
            onDelete={handleOpenBulkDeleteDialog}
            onEdit={handleEditTag}
            onView={(tag) => {
              const locale = pathname?.split('/')[1] || 'ja'
              router.push(`/${locale}/tags/t-${tag.tag_number}`)
            }}
            onClearSelection={() => setSelectedTagIds([])}
            t={t}
          />
        }
      />

      {/* テーブル */}
      <div className="flex flex-1 flex-col overflow-hidden px-4">
        {displayTags.length === 0 ? (
          <div className="border-border flex h-64 items-center justify-center rounded-xl border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{t('tag.archive.noArchivedTags')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* テーブル部分: 枠で囲む */}
            <div className="border-border flex-1 overflow-hidden rounded-xl border">
              {/* ヘッダー: 固定 */}
              <div className="overflow-x-auto">
                <Table className="min-w-full" style={{ tableLayout: 'fixed' }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: '48px' }}>
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label={t('tag.page.selectAll')}
                        />
                      </TableHead>
                      <TableHead style={{ width: '80px' }}>ID</TableHead>
                      <TableHead style={{ width: '32px' }}></TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="-ml-3">
                          {t('tag.page.name')}
                          {sortField === 'name' &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            ))}
                          {sortField !== 'name' && <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />}
                        </Button>
                      </TableHead>
                      <TableHead>{t('tag.page.description')}</TableHead>
                      <TableHead style={{ width: '160px' }}>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="-ml-3">
                          {t('tag.page.createdAt')}
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
              <div className="h-full overflow-x-auto overflow-y-auto" style={{ height: 'calc(100% - 41px)' }}>
                <Table className="min-w-full" style={{ tableLayout: 'fixed' }}>
                  <TableBody>
                    {displayTags.map((tag) => (
                      <TableRow
                        key={tag.id}
                        className="hover:bg-state-hover cursor-pointer"
                        onClick={() => {
                          const locale = pathname?.split('/')[1] || 'ja'
                          router.push(`/${locale}/tags/t-${tag.tag_number}`)
                        }}
                      >
                        <TableCell style={{ width: '48px' }} onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedTagIds.includes(tag.id)}
                            onCheckedChange={() => handleSelectTag(tag.id)}
                            aria-label={t('tag.page.selectTag', { name: tag.name })}
                          />
                        </TableCell>
                        <TableCell style={{ width: '80px' }} className="text-muted-foreground font-mono text-sm">
                          t-{tag.tag_number}
                        </TableCell>
                        <TableCell style={{ width: '32px' }} className="pr-1" onClick={(e) => e.stopPropagation()}>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                className="hover:ring-offset-background focus-visible:ring-ring h-3 w-3 cursor-pointer rounded-full transition-all hover:ring-2 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                style={{ backgroundColor: tag.color || DEFAULT_TAG_COLOR }}
                                aria-label={t('tag.page.changeColor')}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3" align="start">
                              <ColorPalettePicker
                                selectedColor={tag.color || DEFAULT_TAG_COLOR}
                                onColorSelect={(color) => handleColorChange(tag.id, color)}
                              />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell
                          className="pl-1 font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(tag.id, 'name', tag.name)
                          }}
                        >
                          {editingTagId === tag.id && editingField === 'name' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveInlineEdit(tag.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveInlineEdit(tag.id)
                                } else if (e.key === 'Escape') {
                                  cancelEditing()
                                }
                              }}
                              autoFocus
                              className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          ) : (
                            <div className="flex h-3 items-center">
                              <span className="cursor-text">{tag.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(tag.id, 'description', tag.description || '')
                          }}
                        >
                          {editingTagId === tag.id && editingField === 'description' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveInlineEdit(tag.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveInlineEdit(tag.id)
                                } else if (e.key === 'Escape') {
                                  cancelEditing()
                                }
                              }}
                              autoFocus
                              className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          ) : (
                            <div className="flex h-3 items-center">
                              <span className="cursor-text truncate">{tag.description || '-'}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell style={{ width: '160px' }} className="text-muted-foreground text-xs">
                          {formatDate(tag.created_at)}
                        </TableCell>
                        <TableCell style={{ width: '192px' }} className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
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
                                {t('tag.archive.view')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenRestoreConfirm(tag)
                                }}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {t('tag.archive.restore')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenDeleteConfirm(tag)
                                }}
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('tag.archive.permanentDelete')}
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
              <div className="flex items-center justify-between px-4 py-4">
                {/* 左側: 表示件数選択 */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{t('tag.page.rowsPerPage')}</span>
                  <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="h-8 w-16">
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
                    ? t('tag.archive.showing', {
                        start: startIndex + 1,
                        end: Math.min(endIndex, sortedTags.length),
                        total: sortedTags.length,
                      })
                    : t('tag.archive.noItems')}
                </div>

                {/* 右側: ページ移動ボタン */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="sr-only">{t('tag.archive.previousPage')}</span>
                  </Button>
                  <div className="text-muted-foreground flex h-8 items-center px-3 text-sm">
                    {t('tag.archive.pageOf', { current: currentPage, total: totalPages || 1 })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="size-4" />
                    <span className="sr-only">{t('tag.archive.nextPage')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      <TagDeleteDialog tag={deleteConfirmTag} onClose={handleCloseDeleteConfirm} onConfirm={handleConfirmDelete} />

      {/* 復元確認ダイアログ */}
      <AlertDialogConfirm
        open={!!restoreConfirmTag}
        onOpenChange={(open) => !open && setRestoreConfirmTag(null)}
        onConfirm={handleConfirmRestore}
        title={t('tag.archive.restoreConfirmTitle', { name: restoreConfirmTag?.name || '' })}
        description={t('tag.archive.restoreConfirmDescription')}
        confirmText={t('tag.archive.restore')}
        cancelText={t('actions.cancel')}
      />

      {/* 一括削除確認ダイアログ */}
      <AlertDialogConfirm
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDeleteConfirm}
        title={t('tag.archive.bulkDeleteConfirmTitle', { count: selectedTagIds.length })}
        description={t('tag.archive.bulkDeleteConfirmDescription', { count: selectedTagIds.length })}
        confirmText={isBulkDeleting ? t('common.plan.delete.deleting') : t('common.plan.delete.confirm')}
        cancelText={t('actions.cancel')}
        isLoading={isBulkDeleting}
        variant="destructive"
      />
    </div>
  )
}
