'use client'

import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

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

interface TagGroupsSectionProps {
  onSelectGroup?: (groupId: string | null) => void
  selectedGroupId?: string | null
  onClose?: () => void
}

/**
 * タググループ管理セクション
 *
 * グループの一覧表示、作成、編集、削除機能を提供
 */
export function TagGroupsSection({ onSelectGroup, selectedGroupId, onClose }: TagGroupsSectionProps = {}) {
  const { data: groups = [], isLoading } = useTagGroups()
  const createGroupMutation = useCreateTagGroup()
  const updateGroupMutation = useUpdateTagGroup()
  const deleteGroupMutation = useDeleteTagGroup()
  const toast = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null)

  // グループ作成
  const handleCreateGroup = useCallback(
    async (data: CreateTagGroupInput) => {
      console.log('Creating group with data:', data)
      try {
        const result = await createGroupMutation.mutateAsync(data)
        console.log('Group created successfully:', result)
        toast.success(`グループ「${data.name}」を作成しました`)
        setShowCreateModal(false)
      } catch (error) {
        console.error('Failed to create tag group:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('Error message:', errorMessage)
        if (
          errorMessage.includes('duplicate') ||
          errorMessage.includes('unique') ||
          errorMessage.includes('重複') ||
          errorMessage.includes('既に存在')
        ) {
          toast.error('このスラッグは既に使用されています')
        } else {
          toast.error(`グループの作成に失敗しました: ${errorMessage}`)
        }
        throw error
      }
    },
    [createGroupMutation, toast]
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
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (
          errorMessage.includes('duplicate') ||
          errorMessage.includes('unique') ||
          errorMessage.includes('重複') ||
          errorMessage.includes('既に存在')
        ) {
          toast.error('このスラッグは既に使用されています')
        } else {
          toast.error('グループの更新に失敗しました')
        }
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
    } catch (error) {
      console.error('Failed to delete tag group:', error)
      toast.error('グループの削除に失敗しました')
    }
  }, [deletingGroup, deleteGroupMutation, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">タググループ</h3>
          <p className="text-muted-foreground text-sm">タグをグループ化して整理します</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          グループを作成
        </Button>
      </div>

      {/* グループ一覧 */}
      {groups.length === 0 ? (
        <div className="border-border flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">グループがありません</p>
            <Button onClick={() => setShowCreateModal(true)} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              最初のグループを作成
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-border divide-border divide-y rounded-lg border">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center justify-between p-4 transition-colors ${
                selectedGroupId === group.id ? 'bg-accent' : 'hover:bg-accent/50 cursor-pointer'
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const locale = pathname?.split('/')[1] || 'ja'
                const targetUrl = `/${locale}/tags/g-${group.group_number}`
                console.log('Navigating to:', targetUrl, 'Group:', group)
                router.push(targetUrl)
                onClose?.()
              }}
            >
              <div className="flex items-center gap-3">
                {/* カラーインジケーター */}
                {group.color && (
                  <div
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: group.color }}
                    aria-label={`${group.name}のカラー`}
                  />
                )}
                {/* グループ情報 */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-xs">g-{group.group_number}</span>
                    <h4 className="font-medium">{group.name}</h4>
                  </div>
                  {group.description && <p className="text-muted-foreground text-sm">{group.description}</p>}
                </div>
              </div>

              {/* アクションメニュー */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingGroup(group)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setDeletingGroup(group)
                    }}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

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
        tagCount={0} // TODO: グループに属するタグ数を取得
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDeleteGroup}
      />
    </div>
  )
}
