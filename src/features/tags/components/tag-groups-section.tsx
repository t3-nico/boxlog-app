'use client'

import { Folder, MoreHorizontal, Palette, Plus, Trash2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors'
import { TagGroupDeleteDialog } from '@/features/tags/components/tag-group-delete-dialog'
import {
  useCreateTagGroup,
  useDeleteTagGroup,
  useTagGroups,
  useUpdateTagGroup,
} from '@/features/tags/hooks/use-tag-groups'
import { useTags } from '@/features/tags/hooks/use-tags'
import type { TagGroup } from '@/types/tags'
import { toast } from 'sonner'

interface TagGroupsSectionProps {
  onSelectGroup?: (groupId: string | null) => void
  selectedGroupId?: string | null
  onClose?: () => void
}

export interface TagGroupsSectionRef {
  startCreating: () => void
}

/**
 * タググループ管理セクション
 *
 * グループの一覧表示、作成、編集、削除機能を提供
 */
export const TagGroupsSection = forwardRef<TagGroupsSectionRef, TagGroupsSectionProps>(
  ({ onSelectGroup: _onSelectGroup, selectedGroupId, onClose }, ref) => {
    const { data: groups = [] as TagGroup[], isLoading } = useTagGroups()
    const { data: allTags = [] } = useTags(true) // タグ数カウント用
    const createGroupMutation = useCreateTagGroup()
    const updateGroupMutation = useUpdateTagGroup()
    const deleteGroupMutation = useDeleteTagGroup()
    const router = useRouter()
    const pathname = usePathname()

    const [deletingGroup, setDeletingGroup] = useState<TagGroup | null>(null)
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
    const [editingGroupName, setEditingGroupName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupColor, setNewGroupColor] = useState(DEFAULT_GROUP_COLOR)

    // インライン作成を開始
    const handleStartCreating = useCallback(() => {
      setIsCreating(true)
      setNewGroupName('')
      setNewGroupColor(DEFAULT_GROUP_COLOR)
    }, [])

    // 外部から呼び出せるように公開
    useImperativeHandle(ref, () => ({
      startCreating: handleStartCreating,
    }))

    // インライン作成をキャンセル
    const handleCancelCreating = useCallback(() => {
      setIsCreating(false)
      setNewGroupName('')
      setNewGroupColor(DEFAULT_GROUP_COLOR)
    }, [])

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
        setIsCreating(false)
        setNewGroupName('')
        setNewGroupColor(DEFAULT_GROUP_COLOR)

        // 作成したグループのページに遷移
        const locale = pathname?.split('/')[1] || 'ja'
        router.push(`/${locale}/tags/g-${result.group_number}`)
      } catch (error) {
        console.error('Failed to create tag group:', error)
        toast.error('グループの作成に失敗しました')
      }
    }, [newGroupName, newGroupColor, createGroupMutation, router, pathname])

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
      [editingGroupName, updateGroupMutation]
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
    }, [deletingGroup, deleteGroupMutation])

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
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
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
          <Button onClick={handleStartCreating} size="sm" disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            グループを作成
          </Button>
        </div>

        {/* グループ一覧 */}
        {groups.length === 0 && !isCreating ? (
          <div className="border-border flex h-32 items-center justify-center rounded-xl border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">グループがありません</p>
              <Button onClick={handleStartCreating} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                最初のグループを作成
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-border divide-border divide-y rounded-xl border">
            {/* 既存グループ */}
            {groups.map((group) => (
              <div
                key={group.id}
                className={`flex items-center justify-between p-4 transition-colors ${
                  selectedGroupId === group.id ? 'bg-foreground/12' : 'hover:bg-foreground/8 cursor-pointer'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const locale = pathname?.split('/')[1] || 'ja'
                  const targetUrl = `/${locale}/tags/g-${group.group_number}`
                  router.push(targetUrl)
                  onClose?.()
                }}
              >
                <div className="flex items-center gap-3">
                  {/* カラーインジケーター（クリック可能） */}
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
                          className="h-5 w-5"
                          style={{ color: group.color || DEFAULT_GROUP_COLOR }}
                          fill={group.color || DEFAULT_GROUP_COLOR}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" align="start">
                      <ColorPalettePicker
                        selectedColor={group.color || DEFAULT_GROUP_COLOR}
                        onColorSelect={async (color) => {
                          try {
                            await updateGroupMutation.mutateAsync({
                              id: group.id,
                              data: {
                                name: group.name,
                                description: group.description,
                                color,
                              },
                            })
                          } catch (error) {
                            console.error('Failed to update group color:', error)
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>

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

                  {/* タグ数 */}
                  <span className="text-muted-foreground text-sm">{getGroupTagCount(group.id)}件</span>
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartEditing(group)
                      }}
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      名前を変更
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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

            {/* インライン作成フォーム（最下部） */}
            {isCreating && (
              <div className="hover:bg-foreground/8 flex items-center gap-3 p-4 transition-colors">
                {/* カラーアイコン（左側） */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="hover:ring-offset-background focus-visible:ring-ring shrink-0 transition-all hover:ring-2 focus-visible:ring-2 focus-visible:outline-none"
                      aria-label="カラーを変更"
                    >
                      <Folder className="h-5 w-5" style={{ color: newGroupColor }} fill={newGroupColor} />
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
                  placeholder="グループ名を入力"
                  autoFocus
                  className="h-auto flex-1 border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
                />
              </div>
            )}
          </div>
        )}

        {/* 削除確認ダイアログ */}
        <TagGroupDeleteDialog
          group={deletingGroup}
          tagCount={deletingGroup ? getGroupTagCount(deletingGroup.id) : 0}
          onClose={() => setDeletingGroup(null)}
          onConfirm={handleDeleteGroup}
        />
      </div>
    )
  }
)

TagGroupsSection.displayName = 'TagGroupsSection'
