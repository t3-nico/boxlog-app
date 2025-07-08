'use client'

import { TagItem } from './TagItem'

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

interface TagGroupProps {
  letter: string
  tags: Tag[]
}

export const TagGroup = ({ letter, tags }: TagGroupProps) => {
  return (
    <div className="space-y-3">
      {/* グループヘッダー */}
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {letter}
          </span>
        </div>
        <div className="ml-3 text-sm text-gray-500 dark:text-gray-400">
          ({tags.length})
        </div>
      </div>

      {/* タグリスト */}
      <div className="ml-11 space-y-2">
        {tags.map(tag => (
          <TagItem key={tag.id} tag={tag} />
        ))}
      </div>
    </div>
  )
}