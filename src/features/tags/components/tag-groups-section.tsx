'use client'

import { MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { TagGroupCreateModal } from '@/features/tags/components/tag-group-create-modal'
import { TagGroupDeleteDialog } from '@/features/tags/components/tag-group-delete-dialog'
import {
  useCreateTagGroup,
  useDeleteTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from '@/features/tags/hooks/use-tag-groups'
import { useTags } from '@/features/tags/hooks/use-tags'
import { useToast } from '@/lib/toast/use-toast'
import type { CreateTagGroupInput, TagGroup } from '@/types/tags'

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
  const { data: allTags = [] } = useTags(true) // タグ数カウント用
  const createGroupMutation = useCreateTagGroup()
  const updateGroupMutation = useUpdateTagGroup()
  const deleteGroupMutation = useDeleteTagGroup()
  const toast = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')

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

  // グループごとのタグ数をカウント
  const getGroupTagCount = useCallback(
    (groupId: string) => {
      return allTags.filter((tag) => tag.group_id === groupId && tag.is_active && tag.level === 0).length
    },
    [allTags]
  )

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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-xs">g-{group.group_number}</span>
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
                        className="h-auto border-0 bg-transparent p-0 text-base font-medium shadow-none focus-visible:ring-0"
                      />
                    ) : (
                      <h4
                        className="cursor-text font-medium"
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          handleStartEditing(group)
                        }}
                      >
                        {group.name}
                      </h4>
                    )}
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
                    onClick={async () => {
                      const tagCount = getGroupTagCount(group.id)
                      // タグ数が0件の場合は即削除
                      if (tagCount === 0) {
                        try {
                          await deleteGroupMutation.mutateAsync(group.id)
                          toast.success(`グループ「${group.name}」を削除しました`)
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

      <TagGroupDeleteDialog
        group={deletingGroup}
        tagCount={deletingGroup ? getGroupTagCount(deletingGroup.id) : 0}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDeleteGroup}
      />
    </div>
  )
}
