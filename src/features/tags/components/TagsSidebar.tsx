'use client'

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ArrowUpDown, Check, Folder, Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HoverTooltip } from '@/components/ui/tooltip'
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors'
import { SidebarHeading } from '@/features/navigation/components/sidebar/SidebarHeading'
import { SidebarShell } from '@/features/navigation/components/sidebar/SidebarShell'
import { AllTagsDropZone, ArchiveDropZone, UncategorizedDropZone } from '@/features/tags/components/sidebar'
import { SortableGroupItem } from '@/features/tags/components/SortableGroupItem'
import { TagGroupDeleteDialog } from '@/features/tags/components/tag-group-delete-dialog'
import { useTagsNavigation } from '@/features/tags/contexts/TagsNavigationContext'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import {
  useCreateTagGroup,
  useDeleteTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from '@/features/tags/hooks/use-tag-groups'
import { useTags } from '@/features/tags/hooks/use-tags'
import type { TagGroup } from '@/features/tags/types'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

/** グループソートの種類 */
type GroupSortType = 'manual' | 'nameAsc' | 'nameDesc' | 'createdAsc' | 'createdDesc' | 'tagCountDesc' | 'tagCountAsc'

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
  const tagsNav = useTagsNavigation()
  const { setIsCreatingGroup } = useTagsPageContext()
  const { data: groups = [] } = useTagGroups()
  const { data: allTags = [] } = useTags(true) // タグ数カウント用
  const createGroupMutation = useCreateTagGroup()
  const updateGroupMutation = useUpdateTagGroup()
  const deleteGroupMutation = useDeleteTagGroup()

  // グループのローディング状態
  const isLoadingGroups = groups.length === 0 && isLoading

  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState(DEFAULT_GROUP_COLOR)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const [sortType, setSortType] = useState<GroupSortType>('manual')
  // 手動ソート用のローカル順序（グループIDの配列）
  const [manualOrder, setManualOrder] = useState<string[]>([])

  // DnD センサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px以上ドラッグしないと開始しない
      },
    })
  )

  // インライン作成フォームのref
  const inlineFormRef = useRef<HTMLDivElement>(null)

  // 外部から制御される isCreating を使用
  const isCreating = externalIsCreating

  // Context優先でアクティブ状態を判定（フォールバック: pathname）
  const isArchivePage = tagsNav?.filter === 'archive' || pathname?.includes('/archive')
  const isUncategorizedPage = tagsNav?.filter === 'uncategorized' || pathname?.includes('/uncategorized')
  const currentGroupNumber = useMemo(() => {
    // Context優先
    if (tagsNav?.groupNumber !== undefined) return tagsNav.groupNumber
    // フォールバック: pathname から解析
    if (!pathname) return null
    const match = pathname.match(/\/tags\/g-(\d+)/)
    return match ? Number(match[1]) : null
  }, [tagsNav?.groupNumber, pathname])

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
      if (tagsNav) {
        tagsNav.navigateToGroup(result.group_number)
      } else {
        const locale = pathname?.split('/')[1] || 'ja'
        router.push(`/${locale}/tags/g-${result.group_number}`)
      }
    } catch (error) {
      console.error('Failed to create tag group:', error)
      toast.error(t('tags.toast.groupCreateFailed'))
    }
  }, [newGroupName, newGroupColor, createGroupMutation, router, pathname, setIsCreatingGroup, t, tagsNav])

  // 削除確認ダイアログからの削除実行
  const handleConfirmDelete = useCallback(async () => {
    if (!deletingGroup) return

    try {
      await deleteGroupMutation.mutateAsync(deletingGroup.id)
      toast.success(t('tags.toast.groupDeleted', { name: deletingGroup.name }))
      setDeletingGroup(null)

      // 削除したグループのページを表示中だったら、タグ一覧に戻る
      if (currentGroupNumber === deletingGroup.group_number) {
        if (tagsNav) {
          tagsNav.navigateToFilter('all')
        } else {
          const locale = pathname?.split('/')[1] || 'ja'
          router.push(`/${locale}/tags`)
        }
      }
    } catch (error) {
      console.error('Failed to delete tag group:', error)
      toast.error(t('tag.toast.groupDeleteFailed'))
    }
  }, [deletingGroup, deleteGroupMutation, currentGroupNumber, router, pathname, t, tagsNav])

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
      const group = groups.find((g) => g.id === groupId)
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
    [groups, updateGroupMutation]
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
              if (tagsNav) {
                tagsNav.navigateToFilter('all')
              } else {
                const locale = pathname?.split('/')[1] || 'ja'
                router.push(`/${locale}/tags`)
              }
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
    [getGroupTagCount, deleteGroupMutation, t, currentGroupNumber, pathname, router, tagsNav]
  )

  // 未分類タグ数をカウント
  const uncategorizedTagsCount = useMemo(() => {
    return allTags.filter((tag) => !tag.group_id && tag.is_active).length
  }, [allTags])

  const handleAllTagsClick = useCallback(() => {
    if (tagsNav) {
      tagsNav.navigateToFilter('all')
    } else {
      onAllTagsClick()
    }
  }, [tagsNav, onAllTagsClick])

  const handleArchiveClick = useCallback(() => {
    if (tagsNav) {
      tagsNav.navigateToFilter('archive')
    } else {
      const locale = pathname?.split('/')[1] || 'ja'
      router.push(`/${locale}/tags/archive`)
    }
  }, [tagsNav, router, pathname])

  const handleUncategorizedClick = useCallback(() => {
    if (tagsNav) {
      tagsNav.navigateToFilter('uncategorized')
    } else {
      const locale = pathname?.split('/')[1] || 'ja'
      router.push(`/${locale}/tags/uncategorized`)
    }
  }, [tagsNav, router, pathname])

  const handleGroupClick = useCallback(
    (groupNumber: number) => {
      if (tagsNav) {
        tagsNav.navigateToGroup(groupNumber)
      } else {
        const locale = pathname?.split('/')[1] || 'ja'
        router.push(`/${locale}/tags/g-${groupNumber}`)
      }
    },
    [tagsNav, router, pathname]
  )

  // 「すべてのタグ」がアクティブかどうか
  const isAllTagsActive = !isArchivePage && !isUncategorizedPage && !currentGroupNumber

  // manualOrderの初期化（groupsが変わったら更新）
  useEffect(() => {
    if (groups.length > 0 && manualOrder.length === 0) {
      setManualOrder(groups.map((g) => g.id))
    }
    // 新しいグループが追加された場合、manualOrderに追加
    const groupIds = new Set(groups.map((g) => g.id))
    const currentOrderIds = new Set(manualOrder)
    const newIds = groups.filter((g) => !currentOrderIds.has(g.id)).map((g) => g.id)
    const removedIds = manualOrder.filter((id) => !groupIds.has(id))

    if (newIds.length > 0 || removedIds.length > 0) {
      setManualOrder((prev) => {
        const filtered = prev.filter((id) => groupIds.has(id))
        return [...filtered, ...newIds]
      })
    }
  }, [groups, manualOrder])

  // ドラッグ終了時のハンドラ
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // over.id は "drop-xxx" 形式かもしれないので、グループIDを抽出
    const overId = String(over.id).startsWith('drop-') ? String(over.id).slice(5) : String(over.id)
    const activeId = String(active.id)

    if (activeId !== overId) {
      setManualOrder((prev) => {
        const oldIndex = prev.indexOf(activeId)
        const newIndex = prev.indexOf(overId)
        if (oldIndex === -1 || newIndex === -1) return prev
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }, [])

  // ソート済みグループ
  const sortedGroups = useMemo(() => {
    if (sortType === 'manual') {
      // manualOrderに基づいてソート
      if (manualOrder.length === 0) {
        return groups
      }
      const orderMap = new Map(manualOrder.map((id, index) => [id, index]))
      return [...groups].sort((a, b) => {
        const aIndex = orderMap.get(a.id) ?? Infinity
        const bIndex = orderMap.get(b.id) ?? Infinity
        return aIndex - bIndex
      })
    }

    const sorted = [...groups]
    switch (sortType) {
      case 'nameAsc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
        break
      case 'nameDesc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'ja'))
        break
      case 'createdAsc':
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'createdDesc':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'tagCountDesc':
        sorted.sort((a, b) => getGroupTagCount(b.id) - getGroupTagCount(a.id))
        break
      case 'tagCountAsc':
        sorted.sort((a, b) => getGroupTagCount(a.id) - getGroupTagCount(b.id))
        break
    }
    return sorted
  }, [groups, sortType, getGroupTagCount, manualOrder])

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
      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-2">
        <div>
          {/* すべてのタグ（アーカイブから復元のドロップゾーン） */}
          <AllTagsDropZone isActive={isAllTagsActive} activeTagsCount={activeTagsCount} onClick={handleAllTagsClick} />

          {/* 未分類 */}
          <UncategorizedDropZone
            isActive={isUncategorizedPage ?? false}
            uncategorizedTagsCount={uncategorizedTagsCount}
            onClick={handleUncategorizedClick}
          />

          {/* アーカイブ */}
          <ArchiveDropZone
            isActive={isArchivePage ?? false}
            archivedTagsCount={archivedTagsCount}
            onClick={handleArchiveClick}
          />

          {/* グループセクション */}
          <SidebarHeading
            className="mt-4"
            action={
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <HoverTooltip content={t('tags.sidebar.sortGroups')} side="top">
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <ArrowUpDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </HoverTooltip>
                  <DropdownMenuContent align="end">
                    {(
                      [
                        'manual',
                        'nameAsc',
                        'nameDesc',
                        'createdAsc',
                        'createdDesc',
                        'tagCountDesc',
                        'tagCountAsc',
                      ] as const
                    ).map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSortType(option)}
                        className="flex items-center justify-between"
                      >
                        <span>{t(`tags.sidebar.sort.${option}`)}</span>
                        {sortType === option && <Check className="text-primary size-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <HoverTooltip content={t('tags.page.createGroup')} side="top">
                  <Button variant="ghost" size="icon-sm" onClick={handleStartCreating}>
                    <Plus className="size-4" />
                  </Button>
                </HoverTooltip>
              </div>
            }
          >
            {t('tags.sidebar.groups')}
          </SidebarHeading>

          {sortedGroups.length === 0 && !isCreating ? (
            <div className="text-muted-foreground px-2 py-2 text-xs">{t('tags.sidebar.noGroups')}</div>
          ) : (
            <>
              {/* グループリスト */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedGroups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                  {sortedGroups.map((group) => (
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
                      isDraggable={sortType === 'manual'}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* インライン作成フォーム */}
              {isCreating && (
                <div ref={inlineFormRef} className="w-full rounded-md px-2 py-2">
                  <div className="flex items-center gap-2">
                    {/* カラーアイコン（左側） */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0"
                          aria-label={t('tags.sidebar.changeColor')}
                        >
                          <Folder className="h-4 w-4 shrink-0" style={{ color: newGroupColor }} />
                        </Button>
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
