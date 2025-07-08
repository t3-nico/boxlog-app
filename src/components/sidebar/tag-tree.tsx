'use client'

import { useState } from 'react'
import {
  ChevronRightIcon,
  ChevronDownIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid'
import { SidebarItem, SidebarLabel } from '@/components/sidebar'

interface TagNode {
  id: string
  name: string
  count: number
  color?: string
  children?: TagNode[]
  expanded?: boolean
}

interface TagTreeProps {
  collapsed?: boolean
  currentPath?: string
  selectedTagIds?: string[]
  onTagSelect?: (tagId: string) => void
}

const defaultTags: TagNode[] = [
  {
    id: 'work',
    name: 'Work',
    count: 45,
    color: 'blue',
    expanded: true,
    children: [
      { id: 'project-a', name: 'ProjectA', count: 23, color: 'blue' },
      { id: 'project-b', name: 'ProjectB', count: 22, color: 'green' }
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    count: 28,
    color: 'emerald',
    expanded: false,
    children: [
      { id: 'health', name: 'Health', count: 12, color: 'emerald' },
      { id: 'learning', name: 'Learning', count: 10, color: 'yellow' },
      { id: 'family', name: 'Family', count: 6, color: 'pink' }
    ]
  },
  {
    id: 'routine',
    name: 'Routine',
    count: 15,
    color: 'gray'
  }
]

const colorClasses = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

export function TagTree({
  collapsed = false,
  currentPath = '',
  selectedTagIds = [],
  onTagSelect
}: TagTreeProps) {
  const [tags, setTags] = useState(defaultTags)
  const [isExpanded, setIsExpanded] = useState(true)

  if (collapsed) {
    return null
  }

  const toggleTagExpansion = (tagId: string) => {
    setTags(tags.map(tag => 
      tag.id === tagId 
        ? { ...tag, expanded: !tag.expanded }
        : tag
    ))
  }

  const handleTagClick = (tagId: string) => {
    onTagSelect?.(tagId)
  }

  const renderTag = (tag: TagNode, level = 0) => {
    const isSelected = selectedTagIds.includes(tag.id)
    const hasChildren = tag.children && tag.children.length > 0
    const isParentExpanded = tag.expanded

    return (
      <div key={tag.id} className="space-y-1">
        <div
          className={`
            flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors duration-150
            ${level > 0 ? 'ml-4' : ''}
            ${isSelected 
              ? 'bg-gray-800 text-gray-200'
              : 'text-gray-200 hover:bg-gray-800'
            }
          `}
          onClick={() => handleTagClick(tag.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleTagExpansion(tag.id)
              }}
              className="p-0.5 -ml-0.5 hover:bg-gray-700 rounded transition-colors duration-150"
            >
              {isParentExpanded ? (
                <ChevronDownIcon className="size-3" />
              ) : (
                <ChevronRightIcon className="size-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <TagIcon className="size-4 text-gray-400" />
          
          <span className="flex-1 text-sm truncate">
            {tag.name}
          </span>
          
          <span className="text-xs text-gray-400">
            {tag.count}
          </span>
        </div>

        {hasChildren && isParentExpanded && (
          <div className="space-y-1">
            {tag.children!.map(childTag => renderTag(childTag, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-400 transition-colors duration-150"
        >
          {isExpanded ? (
            <ChevronDownIcon className="size-3" />
          ) : (
            <ChevronRightIcon className="size-3" />
          )}
          Tags
        </button>
        <button
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors duration-150"
          title="View all tags"
        >
          View all tags →
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {tags.map(tag => renderTag(tag))}
        </div>
      )}
    </div>
  )
}