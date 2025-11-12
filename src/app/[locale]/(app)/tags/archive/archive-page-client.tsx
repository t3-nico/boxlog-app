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

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/features/i18n/lib/hooks'
import { TagDeleteDialog } from '@/features/tags/components/TagDeleteDialog'
import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useTags, useUpdateTag } from '@/features/tags/hooks/use-tags'
import { useToast } from '@/lib/toast/use-toast'
import type { TagWithChildren } from '@/types/tags'

type SortField = 'name' | 'created_at'
type SortDirection = 'asc' | 'desc'

// プリセットカラー（10色）
const PRESET_COLORS = [
  { name: '青', value: '#3B82F6' },
  { name: '緑', value: '#10B981' },
  { name: '赤', value: '#EF4444' },
  { name: '黄', value: '#F59E0B' },
  { name: '紫', value: '#8B5CF6' },
  { name: 'ピンク', value: '#EC4899' },
  { name: 'シアン', value: '#06B6D4' },
  { name: 'オレンジ', value: '#F97316' },
  { name: 'グレー', value: '#6B7280' },
  { name: 'インディゴ', value: '#6366F1' },
]

export function ArchivePageClient() {
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true)
  const { tags, setTags, setIsLoading } = useTagsPageContext()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'name' | 'description' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<TagWithChildren | null>(null)

  const { handleDeleteTag } = useTagOperations(tags)

  const updateTagMutation = useUpdateTag()
  const toast = useToast()

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

  // 復元ハンドラー（is_active = true）
  const handleRestoreTag = useCallback(
    async (tag: TagWithChildren) => {
      if (
        !confirm(
          `タグ「${tag.name}」を復元しますか？\n\n復元されたタグは再び新規のタグ付けに使用できるようになります。`
        )
      ) {
        return
      }

      try {
        await updateTagMutation.mutateAsync({
          id: tag.id,
          data: { is_active: true },
        })
        toast.success(`タグ「${tag.name}」を復元しました`)
      } catch (error) {
        console.error('Failed to restore tag:', error)
        toast.error('タグの復元に失敗しました')
      }
    },
    [updateTagMutation, toast]
  )

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

  // アーカイブされたタグのみを取得（is_active = false）
  const baseTags = tags.filter((tag) => tag.level === 0 && !tag.is_active)

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
    if (!confirm(`選択した${selectedTagIds.length}件のタグを完全に削除しますか？`)) return

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
      {/* ヘッダー */}
      <TagsPageHeader title={t('tags.sidebar.archive')} count={baseTags.length} />

      {/* 一括削除ボタン（選択時のみ表示） */}
      {selectedTagIds.length > 0 && (
        <div className="flex h-12 shrink-0 items-center gap-2 px-4 pt-2">
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-9">
            <Trash2 className="mr-2 size-4" />
            削除 ({selectedTagIds.length})
          </Button>
        </div>
      )}

      {/* テーブル */}
      <div className="flex flex-1 flex-col overflow-hidden px-4">
        {displayTags.length === 0 ? (
          <div className="border-border flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">アーカイブされたタグはありません</p>
            </div>
          </div>
        ) : (
          <>
            {/* テーブル部分: 枠で囲む */}
            <div className="border-border flex-1 overflow-hidden rounded-lg border">
              {/* ヘッダー: 固定 */}
              <div className="overflow-x-auto">
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
              <div className="h-full overflow-x-auto overflow-y-auto" style={{ height: 'calc(100% - 41px)' }}>
                <Table className="min-w-full" style={{ tableLayout: 'fixed' }}>
                  <TableBody>
                    {displayTags.map((tag) => (
                      <TableRow
                        key={tag.id}
                        className="hover:bg-accent/50 cursor-pointer"
                        onClick={() => {
                          const locale = pathname?.split('/')[1] || 'ja'
                          router.push(`/${locale}/tags/t-${tag.tag_number}`)
                        }}
                      >
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
                        <TableCell style={{ width: '32px' }} className="pr-1" onClick={(e) => e.stopPropagation()}>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                className="hover:ring-offset-background focus-visible:ring-ring h-3 w-3 cursor-pointer rounded-full transition-all hover:ring-2 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                style={{ backgroundColor: tag.color || '#3B82F6' }}
                                aria-label="カラーを変更"
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3" align="start">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">カラーを選択</h4>
                                <div className="grid grid-cols-5 gap-2">
                                  {PRESET_COLORS.map((presetColor) => (
                                    <button
                                      key={presetColor.value}
                                      type="button"
                                      onClick={() => handleColorChange(tag.id, presetColor.value)}
                                      className={`h-10 w-full rounded-md border-2 transition-all hover:scale-110 ${
                                        tag.color === presetColor.value
                                          ? 'border-foreground ring-2 ring-offset-2'
                                          : 'border-border hover:border-foreground/50'
                                      }`}
                                      style={{ backgroundColor: presetColor.value }}
                                      title={presetColor.name}
                                      aria-label={presetColor.name}
                                    />
                                  ))}
                                </div>
                              </div>
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
                                表示
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRestoreTag(tag)
                                }}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                復元
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
              <div className="flex items-center justify-between px-4 py-4">
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

      {/* 削除確認ダイアログ */}
      <TagDeleteDialog tag={deleteConfirmTag} onClose={handleCloseDeleteConfirm} onConfirm={handleConfirmDelete} />
    </div>
  )
}
