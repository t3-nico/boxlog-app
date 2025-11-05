'use client'

import { Plus } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { TagCreateModal } from '@/features/tags/components/tag-create-modal'
import { TagEditModal } from '@/features/tags/components/tag-edit-modal'
import { useTagsPageContext } from '@/features/tags/contexts/TagsPageContext'
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations'
import { useTags } from '@/features/tags/hooks/use-tags'
import type { TagWithChildren } from '@/types/tags'

export function TagsPageClient() {
  const { data: fetchedTags = [], isLoading: isFetching } = useTags(true)
  const { selectedGroupId, setSelectedGroupId, tags, setTags, setIsLoading, setOnCreateGroup } = useTagsPageContext()

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

  // タグデータをContextに同期
  useEffect(() => {
    setTags(fetchedTags)
    setIsLoading(isFetching)
  }, [fetchedTags, isFetching, setTags, setIsLoading])

  // グループ作成ハンドラーをContextに登録
  useEffect(() => {
    setOnCreateGroup(() => () => handleCreateTag())
  }, [setOnCreateGroup, handleCreateTag])

  // グループ（Level 0）のみ抽出
  const groups = tags.filter((tag) => tag.level === 0)

  // 選択されたグループ、または最初のグループ
  const activeGroup = selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : groups[0]

  // 選択されたグループ内のタグ（Level 1）
  const tagsInGroup = activeGroup?.children || []

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* メインエリア: タグ一覧 */}
      {activeGroup ? (
        <div className="flex-1 overflow-y-auto p-6">
          {/* ヘッダー */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-foreground text-2xl font-bold">{activeGroup.name}</h1>
            <Button onClick={() => handleCreateTag(activeGroup.id)}>
              <Plus className="mr-2 h-4 w-4" />
              タグ追加
            </Button>
          </div>

          {/* タグカード一覧 */}
          {tagsInGroup.length === 0 ? (
            <div className="border-border flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">このグループにはまだタグがありません</p>
                <Button onClick={() => handleCreateTag(activeGroup.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のタグを追加
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tagsInGroup.map((tag) => (
                <TagCard key={tag.id} tag={tag} onEdit={handleEditTag} onDelete={handleDeleteTag} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">グループを作成してください</p>
            <Button onClick={() => handleCreateTag()}>
              <Plus className="mr-2 h-4 w-4" />
              最初のグループを作成
            </Button>
          </div>
        </div>
      )}

      {/* モーダル */}
      <TagCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={handleSaveNewTag}
        parentTag={createParentTag}
      />

      <TagEditModal isOpen={showEditModal} tag={selectedTag} onClose={handleCloseModals} onSave={handleSaveTag} />
    </div>
  )
}

interface TagCardProps {
  tag: TagWithChildren
  onEdit: (tag: TagWithChildren) => void
  onDelete: (tag: TagWithChildren) => void
}

function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  return (
    <div className="bg-card text-card-foreground border-border hover:border-primary rounded-lg border p-4 transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: tag.color || '#3B82F6' }} />
          <h3 className="text-foreground font-semibold">{tag.name}</h3>
        </div>
      </div>

      {tag.description && <p className="text-muted-foreground mb-3 text-sm">{tag.description}</p>}

      <div className="text-muted-foreground mb-3 text-xs">
        <p>パス: {tag.path}</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(tag)} className="flex-1">
          編集
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(tag)} className="text-destructive flex-1">
          削除
        </Button>
      </div>
    </div>
  )
}
