'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { Archive, Folder, FolderX, Plus, Tags } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors'
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell'
import { SortableGroupItem } from '@/features/tags/components/SortableGroupItem'
import { TagGroupDeleteDialog } from '@/features/tags/components/tag-group-delete-dialog'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useCreateTagGroup, useDeleteTagGroup, useUpdateTagGroup } from '@/features/tags/hooks/use-tag-groups'
import { useTags } from '@/features/tags/hooks/use-tags'
import type { TagGroup } from '@/features/tags/types'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

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
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const { setIsCreatingGroup, reorderedGroups, sortableContextProps } = useTagsPageContext()
  const { data: allTags = [] } = useTags(true) // タグ数カウント用
  const createGroupMutation = useCreateTagGroup()
  const updateGroupMutation = useUpdateTagGroup()
  const deleteGroupMutation = useDeleteTagGroup()

  // グループのローディング状態はContextから取得できるかどうかで判断
  const isLoadingGroups = reorderedGroups.length === 0 && isLoading

  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(DEFAULT_GROUP_COLOR)
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
    setNewGroupColor(DEFAULT_GROUP_COLOR)
  }, [setIsCreatingGroup])

  // インライン作成をキャンセル
  const handleCancelCreating = useCallback(() => {
    setIsCreatingGroup(false)
    setNewGroupName('')
    setNewGroupColor(DEFAULT_GROUP_COLOR)
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
      toast.error(t('tag.toast.groupNameRequired'))
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
      toast.success(t('tag.toast.groupCreated', { name: newGroupName }))
      setIsCreatingGroup(false)
      setNewGroupName('')
      setNewGroupColor(DEFAULT_GROUP_COLOR)

      // 作成したグループのページに遷移
      const locale = pathname?.split('/')[1] || 'ja'
      router.push(`/${locale}/tags/g-${result.group_number}`)
    } catch (error) {
      console.error('Failed to create tag group:', error)
      toast.error(t('tags.toast.groupCreateFailed'))
    }
  }, [newGroupName, newGroupColor, createGroupMutation, router, pathname, setIsCreatingGroup, t])

  // 削除確認ダイアログからの削除実行
  const handleConfirmDelete = useCallback(async () => {
    if (!deletingGroup) return

    try {
      await deleteGroupMutation.mutateAsync(deletingGroup.id)
      toast.success(t('tags.toast.groupDeleted', { name: deletingGroup.name }))
      setDeletingGroup(null)

      // 削除したグループのページを表示中だったら、タグ一覧に戻る
      if (currentGroupNumber === deletingGroup.group_number) {
        const locale = pathname?.split('/')[1] || 'ja'
        router.push(`/${locale}/tags`)
      }
    } catch (error) {
      console.error('Failed to delete tag group:', error)
      toast.error(t('tag.toast.groupDeleteFailed'))
    }
  }, [deletingGroup, deleteGroupMutation, currentGroupNumber, router, pathname, t])

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
        toast.error(t('tags.toast.groupNameRequired'))
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
        toast.success(t('tags.toast.groupNameChanged', { name: editingGroupName }))
        setEditingGroupId(null)
        setEditingGroupName('')
      } catch (error) {
        console.error('Failed to update tag group:', error)
        toast.error(t('tags.toast.groupNameChangeFailed'))
      }
    },
    [editingGroupName, updateGroupMutation, t]
  )

  // カラー更新
  const handleUpdateColor = useCallback(
    async (groupId: string, color: string) => {
      const group = reorderedGroups.find((g) => g.id === groupId)
      if (!group) return

      try {
        await updateGroupMutation.mutateAsync({
          id: groupId,
          data: {
            name: group.name,
            description: group.description,
            color,
          },
        })
      } catch (error) {
        console.error('Failed to update group color:', error)
      }
    },
    [reorderedGroups, updateGroupMutation]
  )

  // グループごとのタグ数をカウント
  const getGroupTagCount = useCallback(
    (groupId: string) => {
      return allTags.filter((tag) => tag.group_id === groupId && tag.is_active).length
    },
    [allTags]
  )

  // グループ削除（確認ダイアログを表示）
  const handleDeleteGroup = useCallback(
    (group: TagGroup) => {
      const tagCount = getGroupTagCount(group.id)
      // タグ数が0件の場合は即削除
      if (tagCount === 0) {
        deleteGroupMutation
          .mutateAsync(group.id)
          .then(() => {
            toast.success(t('tags.toast.groupDeleted', { name: group.name }))
            // 削除したグループのページを表示中だったら、タグ一覧に戻る
            if (currentGroupNumber === group.group_number) {
              const locale = pathname?.split('/')[1] || 'ja'
              router.push(`/${locale}/tags`)
            }
          })
          .catch((error) => {
            console.error('Failed to delete tag group:', error)
            toast.error(t('tags.toast.groupDeleteFailed'))
          })
      } else {
        // タグが1件以上の場合は確認ダイアログを表示
        setDeletingGroup(group)
      }
    },
    [getGroupTagCount, deleteGroupMutation, t, currentGroupNumber, pathname, router]
  )

  // 未分類タグ数をカウント
  const uncategorizedTagsCount = useMemo(() => {
    return allTags.filter((tag) => !tag.group_id && tag.is_active).length
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

  // 未分類へのドロップゾーン
  const UncategorizedDropZone = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'drop-uncategorized',
      data: {
        type: 'group',
        groupId: null,
      },
    })

    return (
      <button
        ref={setNodeRef}
        type="button"
        onClick={handleUncategorizedClick}
        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
          isUncategorizedPage ? 'bg-state-selected text-foreground' : 'text-muted-foreground hover:bg-state-hover'
        } ${isOver ? 'bg-primary/10 border-primary/50 border-2 border-dashed' : ''}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderX className="text-muted-foreground h-4 w-4 shrink-0" />
            <span>{t('tags.sidebar.uncategorized')}</span>
          </div>
          <span className="text-muted-foreground text-xs">{uncategorizedTagsCount}</span>
        </div>
      </button>
    )
  }

  if (isLoading || isLoadingGroups) {
    return (
      <SidebarShell title={t('sidebar.navigation.tags')}>
        <div className="flex flex-1 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </SidebarShell>
    )
  }

  return (
    <SidebarShell title={t('sidebar.navigation.tags')}>
      {/* コンテンツ */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {/* すべてのタグ */}
          <button
            type="button"
            onClick={onAllTagsClick}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              !isArchivePage && !isUncategorizedPage && !currentGroupNumber
                ? 'bg-state-selected text-foreground'
                : 'text-muted-foreground hover:bg-state-hover'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Tags className="h-4 w-4 shrink-0" />
                <span>{t('tags.sidebar.allTags')}</span>
              </div>
              <span className="text-muted-foreground text-xs">{activeTagsCount}</span>
            </div>
          </button>

          {/* 未分類 */}
          <UncategorizedDropZone />

          {/* アーカイブ */}
          <button
            type="button"
            onClick={handleArchiveClick}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              isArchivePage ? 'bg-state-selected text-foreground' : 'text-muted-foreground hover:bg-state-hover'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 shrink-0" />
                <span>{t('tags.sidebar.archive')}</span>
              </div>
              <span className="text-muted-foreground text-xs">{archivedTagsCount}</span>
            </div>
          </button>

          {/* グループセクション */}
          <div className="text-muted-foreground mt-4 mb-1 flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold uppercase">{t('tags.sidebar.groups')}</span>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartCreating}
                    className="hover:bg-state-hover h-5 w-5 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  <p>{t('tags.page.createGroup')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {reorderedGroups.length === 0 && !isCreating ? (
            <div className="text-muted-foreground px-3 py-2 text-xs">{t('tags.sidebar.noGroups')}</div>
          ) : (
            <>
              {/* SortableContext - DndContextは親のTagsPageProviderで提供 */}
              <SortableContext {...sortableContextProps}>
                {reorderedGroups.map((group) => (
                  <SortableGroupItem
                    key={group.id}
                    group={group}
                    isActive={currentGroupNumber === group.group_number}
                    tagCount={getGroupTagCount(group.id)}
                    onGroupClick={handleGroupClick}
                    onStartEdit={handleStartEditing}
                    onCancelEdit={handleCancelEditing}
                    onSaveEdit={handleSaveEditing}
                    onUpdateColor={handleUpdateColor}
                    onDelete={handleDeleteGroup}
                    isEditing={editingGroupId === group.id}
                    editingName={editingGroupName}
                    setEditingName={setEditingGroupName}
                  />
                ))}
              </SortableContext>

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
                          aria-label={t('tags.sidebar.changeColor')}
                        >
                          <Folder className="h-4 w-4 shrink-0" style={{ color: newGroupColor }} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <ColorPalettePicker selectedColor={newGroupColor} onColorSelect={setNewGroupColor} />
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
                      placeholder={t('tags.sidebar.groupNamePlaceholder')}
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
        onConfirm={handleConfirmDelete}
      />
    </SidebarShell>
  )
}
