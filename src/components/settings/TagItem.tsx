'use client'

import { useState } from 'react'
import { MoreVertical as EllipsisVerticalIcon, Pencil as PencilIcon, Trash2 as TrashIcon } from 'lucide-react'
import { 
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { useSidebarStore } from '@/stores/sidebarStore'
import { TagEditDialog } from '@/components/tags/tag-edit-dialog'
import { tagIconMapping, TagIconName } from '@/config/tagIcons'

interface Tag {
  id: string
  name: string
  count: number
  parentId?: string | null
  color?: string
  icon?: string
  level?: number
  createdAt?: Date
  updatedAt?: Date
}

interface TagItemProps {
  tag: Tag
}

export const TagItem = ({ tag }: TagItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const { updateTag, deleteTag, tags } = useSidebarStore()

  const getParentTagName = (parentId: string) => {
    const parent = tags.find(t => t.id === parentId)
    return parent?.name || 'Unknown'
  }

  const handleSave = (updatedTag: Tag) => {
    updateTag(tag.id, {
      name: updatedTag.name,
      color: updatedTag.color,
      icon: updatedTag.icon
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (tag.count > 0) {
      alert('このタグは使用中のため削除できません。')
      return
    }
    if (confirm(`タグ「${tag.name}」を削除しますか？`)) {
      deleteTag(tag.id)
    }
  }

  // アイコンコンポーネントの取得
  const IconComponent = tag.icon && tagIconMapping[tag.icon as TagIconName] 
    ? tagIconMapping[tag.icon as TagIconName] 
    : null

  return (
    <>
      <div className="group flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <div className="flex items-center space-x-3">
          {/* タグアイコンまたは色 */}
          <div className="flex items-center space-x-2">
            {IconComponent ? (
              <IconComponent 
                className="w-4 h-4"
                style={{ color: tag.color || '#6B7280' }}
              />
            ) : (
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tag.color || '#6B7280' }}
              />
            )}
          </div>
          
          {/* タグ名と親情報 */}
          <div className="flex-1">
            <div className="space-y-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {tag.name}
              </div>
              {tag.parentId && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Child of: {getParentTagName(tag.parentId)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 使用回数 */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ({tag.count})
          </div>

          {/* アクションメニュー */}
          <Dropdown>
            <DropdownButton className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <EllipsisVerticalIcon className="w-4 h-4" />
            </DropdownButton>
            
            <DropdownMenu>
              <DropdownItem onClick={() => setIsEditing(true)}>
                <PencilIcon className="w-4 h-4" />
                <DropdownLabel>Edit</DropdownLabel>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleDelete}>
                <TrashIcon className="w-4 h-4" />
                <DropdownLabel>Delete</DropdownLabel>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* 編集ダイアログ */}
      <TagEditDialog
        tag={isEditing ? tag : null}
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
      />
    </>
  )
}