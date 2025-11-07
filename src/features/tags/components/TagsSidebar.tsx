'use client'

import { Archive, Edit, Folder, FolderOpen, MoreHorizontal, Palette, Plus, Tags, Trash2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TagGroupDeleteDialog } from '@/features/tags/components/tag-group-delete-dialog'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import {
  useCreateTagGroup,
  useDeleteTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from '@/features/tags/hooks/use-tag-groups'
import { useTags } from '@/features/tags/hooks/use-tags'
import { useToast } from '@/lib/toast/use-toast'
import type { TagGroup } from '@/types/tags'

interface TagsSidebarProps {
  onAllTagsClick: () => void
  isLoading?: boolean
  activeTagsCount?: number
  archivedTagsCount?: number
  externalIsCreating?: boolean
}

/**
 * タグページ用サイドバー
 *
 * すべてのタグとアーカイブビューを提供
 */
export function TagsSidebar({
  onAllTagsClick,
  isLoading = false,
  activeTagsCount = 0,
  archivedTagsCount = 0,
  externalIsCreating = false,
}: TagsSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setIsCreatingGroup } = useTagsPageContext()
  const { data: groups = [], isLoading: isLoadingGroups } = useTagGroups()
  const { data: allTags = [] } = useTags(true) // タグ数カウント用
  const createGroupMutation = useCreateTagGroup()
  const updateGroupMutation = useUpdateTagGroup()
  const deleteGroupMutation = useDeleteTagGroup()
  const toast = useToast()

  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState('#6B7280')
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')

  // インライン作成フォームのref
  const inlineFormRef = useRef<HTMLDivElement>(null)

  // 外部から制御される isCreating を使用
  const isCreating = externalIsCreating

  const isArchivePage = pathname?.includes('/archive')
  const isUncategorizedPage = pathname?.includes('/uncategorized')
  const currentGroupNumber = useMemo(() => {
    if (!pathname) return null
    const match = pathname.match(/\/tags\/g-(\d+)/)
    return match ? Number(match[1]) : null
  }, [pathname])

  // インライン作成を開始
  const handleStartCreating = useCallback(() => {
    setIsCreatingGroup(true)
    setNewGroupName('')
    setNewGroupColor('#6B7280')
  }, [setIsCreatingGroup])

  // インライン作成をキャンセル
  const handleCancelCreating = useCallback(() => {
    setIsCreatingGroup(false)
    setNewGroupName('')
    setNewGroupColor('#6B7280')
  }, [setIsCreatingGroup])

  // クリックアウトサイド検知
  useEffect(() => {
    if (!isCreating) return

    const handleClickOutside = (event: MouseEvent) => {
      if (inlineFormRef.current && !inlineFormRef.current.contains(event.target as Node)) {
        handleCancelCreating()
      }
    }

    // 少し遅延させてイベントリスナーを追加（作成ボタンクリックと競合しないように）
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCreating, handleCancelCreating])

  // インライン作成を保存
  const handleSaveNewGroup = useCallback(async () => {
    if (!newGroupName.trim()) {
      toast.error('グループ名を入力してください')
      return
    }

    try {
      // slug を名前から自動生成（小文字化 + スペースをハイフンに変換）
      const slug = newGroupName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')

      const result = await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        slug: slug || `group-${Date.now()}`, // 空の場合はタイムスタンプを使用
        description: null,
        color: newGroupColor || null,
      })
      toast.success(`グループ「${newGroupName}」を作成しました`)
      setIsCreatingGroup(false)
      setNewGroupName('')
      setNewGroupColor('#6B7280')

      // 作成したグループのページに遷移
      const locale = pathname?.split('/')[1] || 'ja'
      router.push(`/${locale}/tags/g-${result.group_number}`)
    } catch (error) {
      console.error('Failed to create tag group:', error)
      toast.error('グループの作成に失敗しました')
    }
  }, [newGroupName, newGroupColor, createGroupMutation, toast, router, pathname, setIsCreatingGroup])

  // グループ削除
  const handleDeleteGroup = useCallback(async () => {
    if (!deletingGroup) return

    try {
      await deleteGroupMutation.mutateAsync(deletingGroup.id)
      toast.success(`グループ「${deletingGroup.name}」を削除しました`)
      setDeletingGroup(null)

      // 削除したグループのページを表示中だったら、タグ一覧に戻る
      if (currentGroupNumber === deletingGroup.group_number) {
        const locale = pathname?.split('/')[1] || 'ja'
        router.push(`/${locale}/tags`)
      }
    } catch (error) {
      console.error('Failed to delete tag group:', error)
      toast.error('グループの削除に失敗しました')
    }
  }, [deletingGroup, deleteGroupMutation, toast, currentGroupNumber, router, pathname])

  // インライン編集を開始
  const handleStartEditing = useCallback((group: TagGroup) => {
    setEditingGroupId(group.id)
    setEditingGroupName(group.name)
  }, [])

  // インライン編集をキャンセル
  const handleCancelEditing = useCallback(() => {
    setEditingGroupId(null)
    setEditingGroupName('')
  }, [])

  // インライン編集を保存
  const handleSaveEditing = useCallback(
    async (group: TagGroup) => {
      if (!editingGroupName.trim()) {
        toast.error('グループ名を入力してください')
        return
      }

      try {
        await updateGroupMutation.mutateAsync({
          id: group.id,
          data: {
            name: editingGroupName.trim(),
            description: group.description,
            color: group.color,
          },
        })
        toast.success(`グループ名を「${editingGroupName}」に変更しました`)
        setEditingGroupId(null)
        setEditingGroupName('')
      } catch (error) {
        console.error('Failed to update tag group:', error)
        toast.error('グループ名の変更に失敗しました')
      }
    },
    [editingGroupName, updateGroupMutation, toast]
  )

  // グループごとのタグ数をカウント
  const getGroupTagCount = useCallback(
    (groupId: string) => {
      return allTags.filter((tag) => tag.group_id === groupId && tag.is_active && tag.level === 0).length
    },
    [allTags]
  )

  // 未分類タグ数をカウント
  const uncategorizedTagsCount = useMemo(() => {
    return allTags.filter((tag) => !tag.group_id && tag.is_active && tag.level === 0).length
  }, [allTags])

  const handleArchiveClick = useCallback(() => {
    const locale = pathname?.split('/')[1] || 'ja'
    router.push(`/${locale}/tags/archive`)
  }, [router, pathname])

  const handleUncategorizedClick = useCallback(() => {
    const locale = pathname?.split('/')[1] || 'ja'
    router.push(`/${locale}/tags/uncategorized`)
  }, [router, pathname])

  const handleGroupClick = useCallback(
    (groupNumber: number) => {
      const locale = pathname?.split('/')[1] || 'ja'
      router.push(`/${locale}/tags/g-${groupNumber}`)
    },
    [router, pathname]
  )

  if (isLoading || isLoadingGroups) {
    return (
      <aside className="bg-background text-foreground flex h-full w-full flex-col">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Header - 見出し (40px) */}
      <div className="border-border flex h-10 shrink-0 items-center border-b px-4">
        <h2 className="text-foreground text-sm font-semibold">タグ</h2>
      </div>

      {/* コンテンツ */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div>
          {/* すべてのタグ */}
          <button
            type="button"
            onClick={onAllTagsClick}
            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              !isArchivePage && !isUncategorizedPage && !currentGroupNumber
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Tags className="h-4 w-4 shrink-0" />
                <span>すべてのタグ</span>
              </div>
              <span className="text-muted-foreground text-xs">{activeTagsCount}</span>
            </div>
          </button>

          {/* 未分類 */}
          <button
            type="button"
            onClick={handleUncategorizedClick}
            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              isUncategorizedPage ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span>未分類</span>
              </div>
              <span className="text-muted-foreground text-xs">{uncategorizedTagsCount}</span>
            </div>
          </button>

          {/* アーカイブ */}
          <button
            type="button"
            onClick={handleArchiveClick}
            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              isArchivePage ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 shrink-0" />
                <span>アーカイブ</span>
              </div>
              <span className="text-muted-foreground text-xs">{archivedTagsCount}</span>
            </div>
          </button>

          {/* グループセクション */}
          <div className="text-muted-foreground mt-4 mb-2 flex items-center justify-between pr-1 pl-3">
            <span className="text-xs font-semibold uppercase">グループ</span>
            <Button variant="ghost" size="sm" onClick={handleStartCreating} className="hover:bg-accent h-5 w-5 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {groups.length === 0 && !isCreating ? (
            <div className="text-muted-foreground px-3 py-2 text-xs">グループがありません</div>
          ) : (
            <>
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleGroupClick(group.group_number)}
                  className={`group w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    currentGroupNumber === group.group_number
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {/* カラーアイコン（クリック可能） */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            className="hover:ring-offset-background focus-visible:ring-ring shrink-0 transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-none"
                            aria-label={`${group.name}のカラーを変更`}
                          >
                            <Folder
                              className="h-4 w-4"
                              style={{ color: group.color || '#6B7280' }}
                              fill={group.color || '#6B7280'}
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
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    await updateGroupMutation.mutateAsync({
                                      id: group.id,
                                      data: {
                                        name: group.name,
                                        description: group.description,
                                        color,
                                      },
                                    })
                                    toast.success('カラーを変更しました')
                                  } catch (error) {
                                    console.error('Failed to update group color:', error)
                                    toast.error('カラーの変更に失敗しました')
                                  }
                                }}
                                className={`h-8 w-8 shrink-0 rounded border-2 transition-all ${
                                  group.color === color ? 'border-foreground scale-110' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`カラー ${color}`}
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* グループ名（インライン編集可能） */}
                      {editingGroupId === group.id ? (
                        <Input
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEditing(group)
                            } else if (e.key === 'Escape') {
                              handleCancelEditing()
                            }
                          }}
                          onBlur={() => handleSaveEditing(group)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="h-auto flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                        />
                      ) : (
                        <GroupNameWithTooltip
                          name={group.name}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            handleStartEditing(group)
                          }}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* コンテキストメニュー */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="hover:bg-accent-foreground/10 flex h-6 w-6 shrink-0 items-center justify-center rounded p-0 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartEditing(group)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            名前を変更
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Palette className="mr-2 h-4 w-4" />
                              カラーを変更
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <div className="grid grid-cols-5 gap-2 p-2">
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
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      try {
                                        await updateGroupMutation.mutateAsync({
                                          id: group.id,
                                          data: {
                                            name: group.name,
                                            description: group.description,
                                            color,
                                          },
                                        })
                                        toast.success('カラーを変更しました')
                                      } catch (error) {
                                        console.error('Failed to update group color:', error)
                                        toast.error('カラーの変更に失敗しました')
                                      }
                                    }}
                                    className={`h-8 w-8 shrink-0 rounded border-2 transition-all ${
                                      group.color === color ? 'border-foreground scale-110' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`カラー ${color}`}
                                  />
                                ))}
                              </div>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async (e) => {
                              e.stopPropagation()
                              const tagCount = getGroupTagCount(group.id)
                              // タグ数が0件の場合は即削除
                              if (tagCount === 0) {
                                try {
                                  await deleteGroupMutation.mutateAsync(group.id)
                                  toast.success(`グループ「${group.name}」を削除しました`)
                                  // 削除したグループのページを表示中だったら、タグ一覧に戻る
                                  if (currentGroupNumber === group.group_number) {
                                    const locale = pathname?.split('/')[1] || 'ja'
                                    router.push(`/${locale}/tags`)
                                  }
                                } catch (error) {
                                  console.error('Failed to delete tag group:', error)
                                  toast.error('グループの削除に失敗しました')
                                }
                              } else {
                                // タグが1件以上の場合は確認ダイアログを表示
                                setDeletingGroup(group)
                              }
                            }}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* タグ数 */}
                      <span className="text-muted-foreground text-xs">{getGroupTagCount(group.id)}</span>
                    </div>
                  </div>
                </button>
              ))}

              {/* インライン作成フォーム */}
              {isCreating && (
                <div ref={inlineFormRef} className="w-full rounded-md px-3 py-2">
                  <div className="flex items-center gap-2">
                    {/* カラーアイコン（左側） */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="hover:ring-offset-background focus-visible:ring-ring shrink-0 transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-none"
                          aria-label="カラーを変更"
                        >
                          <Folder className="h-4 w-4" style={{ color: newGroupColor }} fill={newGroupColor} />
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
                              onClick={() => setNewGroupColor(color)}
                              className={`h-8 w-8 shrink-0 rounded border-2 transition-all ${
                                newGroupColor === color ? 'border-foreground scale-110' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              aria-label={`カラー ${color}`}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* グループ名入力（右側） */}
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNewGroup()
                        } else if (e.key === 'Escape') {
                          handleCancelCreating()
                        }
                      }}
                      placeholder="グループ名を入力"
                      autoFocus
                      className="h-auto flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* 削除確認ダイアログ */}
      <TagGroupDeleteDialog
        group={deletingGroup}
        tagCount={deletingGroup ? getGroupTagCount(deletingGroup.id) : 0}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDeleteGroup}
      />
    </aside>
  )
}

/**
 * グループ名表示 - 省略時のみツールチップを表示
 */
function GroupNameWithTooltip({ name, onDoubleClick }: { name: string; onDoubleClick: (e: React.MouseEvent) => void }) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    // 省略されているかどうかをチェック
    const checkTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth)
    }

    checkTruncation()

    // リサイズ時に再チェック
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [name])

  const content = (
    <span ref={textRef} className="flex-1 truncate" onDoubleClick={onDoubleClick}>
      {name}
    </span>
  )

  if (!isTruncated) {
    return content
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" sideOffset={4}>
          <p className="whitespace-nowrap">{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
