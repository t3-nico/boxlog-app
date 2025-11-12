'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCreateTag, useTags } from '@/features/tags/hooks/use-tags'
import { Tag as TagType } from '@/types/unified'
import { Check, Plus } from 'lucide-react'
import { useState } from 'react'

interface TicketTagSelectPopoverProps {
  children: React.ReactNode
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
}

export function TicketTagSelectPopover({ children, selectedTagIds, onTagsChange }: TicketTagSelectPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const { data: tagsData } = useTags(true)
  const createTagMutation = useCreateTag()

  // TagWithChildren[] を Tag[] に変換（階層を平坦化）
  const flattenTags = (tags: typeof tagsData): TagType[] => {
    if (!tags) return []
    const result: TagType[] = []
    const flatten = (tagList: typeof tagsData) => {
      if (!tagList) return
      tagList.forEach((tag) => {
        result.push(tag)
        if (tag.children && tag.children.length > 0) {
          flatten(tag.children)
        }
      })
    }
    flatten(tags)
    return result
  }

  const allTags = flattenTags(tagsData)
  // アクティブなタグのみを使用（アーカイブ済みタグを除外）
  const activeTags = allTags.filter((tag) => tag.is_active)

  // 検索フィルタ
  const filteredTags = searchQuery
    ? activeTags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeTags

  // タグの選択/解除
  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onTagsChange([...selectedTagIds, tagId])
    }
  }

  // タグ作成
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const createdTag = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        color: '#3B82F6', // デフォルトの青色
        description: undefined,
        level: 0,
      })

      if (createdTag && createdTag.id) {
        onTagsChange([...selectedTagIds, createdTag.id])
      }

      setNewTagName('')
      setIsCreating(false)
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  // Enter キーでタグ作成
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateTag()
    } else if (e.key === 'Escape') {
      setIsCreating(false)
      setNewTagName('')
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* 検索バー */}
        <div className="border-b p-3">
          <Input
            placeholder="タグを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
            autoFocus
          />
        </div>

        {/* タグリスト */}
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredTags.length === 0 && !isCreating ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              {searchQuery ? 'タグが見つかりません' : 'タグがありません'}
            </div>
          ) : (
            filteredTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.id)}
                  className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isSelected ? 'border-primary bg-primary' : 'border-input'
                    }`}
                  >
                    {isSelected && <Check className="text-primary-foreground h-3 w-3" />}
                  </div>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      borderColor: tag.color,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </Badge>
                </button>
              )
            })
          )}
        </div>

        {/* 新規作成フォーム */}
        <div className="border-t p-2">
          {isCreating ? (
            <div className="flex gap-2">
              <Input
                placeholder="タグ名を入力..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-9"
                autoFocus
              />
              <Button size="sm" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                作成
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false)
                  setNewTagName('')
                }}
              >
                キャンセル
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              新しいタグを作成
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
