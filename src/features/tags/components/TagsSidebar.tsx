'use client'

import { Archive, Edit, Folder, MoreHorizontal, Plus, Tags, Trash2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TagGroupCreateModal } from '@/features/tags/components/tag-group-create-modal'
import { TagGroupDeleteDialog } from '@/features/tags/components/tag-group-delete-dialog'
import { TagGroupEditModal } from '@/features/tags/components/tag-group-edit-modal'
import {
  useCreateTagGroup,
  useDeleteTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from '@/features/tags/hooks/use-tag-groups'
import { useToast } from '@/lib/toast/use-toast'
import type { CreateTagGroupInput, TagGroup, UpdateTagGroupInput } from '@/types/tags'

interface TagsSidebarProps {
  onAllTagsClick: () => void
  isLoading?: boolean
  activeTagsCount?: number
  archivedTagsCount?: number
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
}: TagsSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: groups = [], isLoading: isLoadingGroups } = useTagGroups()
  const createGroupMutation = useCreateTagGroup()
  const updateGroupMutation = useUpdateTagGroup()
  const deleteGroupMutation = useDeleteTagGroup()
  const toast = useToast()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null)

  const isArchivePage = pathname?.includes('/archive')
  const currentGroupNumber = useMemo(() => {
    if (!pathname) return null
    const match = pathname.match(/\/tags\/g-(\d+)/)
    return match ? Number(match[1]) : null
  }, [pathname])

  // グループ作成
  const handleCreateGroup = useCallback(
    async (data: CreateTagGroupInput) => {
      try {
        const result = await createGroupMutation.mutateAsync(data)
        toast.success(`グループ「${data.name}」を作成しました`)
        setShowCreateModal(false)

        // 作成したグループのページに遷移
        const locale = pathname?.split('/')[1] || 'ja'
        router.push(`/${locale}/tags/g-${result.group_number}`)
      } catch (error) {
        console.error('Failed to create tag group:', error)
        toast.error('グループの作成に失敗しました')
        throw error
      }
    },
    [createGroupMutation, toast, router, pathname]
  )

  // グループ編集
  const handleEditGroup = useCallback(
    async (data: UpdateTagGroupInput) => {
      if (!editingGroup) return

      try {
        await updateGroupMutation.mutateAsync({
          id: editingGroup.id,
          data,
        })
        toast.success(`グループ「${data.name}」を更新しました`)
        setEditingGroup(null)
      } catch (error) {
        console.error('Failed to update tag group:', error)
        toast.error('グループの更新に失敗しました')
        throw error
      }
    },
    [editingGroup, updateGroupMutation, toast]
  )

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

  if (isLoading || isLoadingGroups) {
    return (
      <aside className="bg-background text-foreground flex h-full w-full flex-col">
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </aside>
    )
  }

  const handleArchiveClick = () => {
    const locale = pathname?.split('/')[1] || 'ja'
    router.push(`/${locale}/tags/archive`)
  }

  const handleGroupClick = (groupNumber: number) => {
    const locale = pathname?.split('/')[1] || 'ja'
    router.push(`/${locale}/tags/g-${groupNumber}`)
  }

  return (
    <aside className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Header - 見出し (40px) */}
      <div className="border-border flex h-10 shrink-0 items-center border-b px-4">
        <h2 className="text-foreground text-sm font-semibold">タグ</h2>
      </div>

      {/* コンテンツ */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {/* すべてのタグ */}
          <button
            type="button"
            onClick={onAllTagsClick}
            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              !isArchivePage && !currentGroupNumber
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

          {/* グループセクション */}
          <div className="text-muted-foreground mt-4 mb-2 flex items-center justify-between px-3">
            <span className="text-xs font-semibold uppercase">グループ</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="hover:bg-accent h-5 w-5 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {groups.length === 0 ? (
            <div className="text-muted-foreground px-3 py-2 text-xs">グループがありません</div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className={`group relative flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  currentGroupNumber === group.group_number
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleGroupClick(group.group_number)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  {group.color ? (
                    <div
                      className="h-4 w-4 shrink-0 rounded"
                      style={{ backgroundColor: group.color }}
                      aria-label={`${group.name}のカラー`}
                    />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">{group.name}</span>
                </button>

                {/* コンテキストメニュー */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-accent-foreground/10 h-6 w-6 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingGroup(group)}>
                      <Edit className="mr-2 h-4 w-4" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingGroup(group)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}

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
        </div>
      </nav>

      {/* モーダル */}
      <TagGroupCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateGroup}
      />

      <TagGroupEditModal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        onSave={handleEditGroup}
        group={editingGroup}
      />

      <TagGroupDeleteDialog
        group={deletingGroup}
        tagCount={0}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDeleteGroup}
      />
    </aside>
  )
}
