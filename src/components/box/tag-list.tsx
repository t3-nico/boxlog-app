'use client'

import { useState } from 'react'
import { Tag } from '@/types/box'
import { useTagStore } from '@/lib/tag-store'
import { useBoxStore } from '@/lib/box-store'
import { Button } from '@/components/button'
import { 
  Plus, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/dropdown'
import { TagModal } from './tag-modal'

interface TagListProps {
  onSelectTag: (tagId: string) => void
  selectedTagIds: string[]
}

export function TagList({ onSelectTag, selectedTagIds }: TagListProps) {
  const { 
    tags, 
    deleteTag, 
    getTaskCount, 
    getRootTags, 
    getChildTags, 
    canAddChild 
  } = useTagStore()
  const { getSortedTasks } = useBoxStore()
  const tasks = getSortedTasks()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set())
  const [parentForNewTag, setParentForNewTag] = useState<string | null>(null)

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag? It will be removed from all tasks.')) {
      await deleteTag(tagId)
    }
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingTag(null)
    setParentForNewTag(null)
  }

  const toggleExpanded = (tagId: string) => {
    const newExpanded = new Set(expandedTags)
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId)
    } else {
      newExpanded.add(tagId)
    }
    setExpandedTags(newExpanded)
  }

  const handleAddChildTag = (parentId: string) => {
    setParentForNewTag(parentId)
    setShowCreateModal(true)
  }

  const renderTagItem = (tag: Tag, level: number = 0) => {
    const taskCount = getTaskCount(tasks, tag.id)
    const isSelected = selectedTagIds.includes(tag.id)
    const children = getChildTags(tag.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedTags.has(tag.id)
    const indentClass = level > 0 ? `ml-${level * 4}` : ''

    return (
      <div key={tag.id}>
        <div
          className={`group flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors ${indentClass} ${
            isSelected 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0" onClick={() => onSelectTag(tag.id)}>
            {hasChildren && (
              <Button
                plain
                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  toggleExpanded(tag.id)
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-4" />}
            
            <div 
              className="h-4 w-4 rounded-full flex-shrink-0" 
              style={{ backgroundColor: tag.color }}
            />
            <span className="text-sm truncate">
              {tag.name}
              {tag.level > 1 && (
                <span className="text-xs text-gray-500 ml-1">
                  (L{tag.level})
                </span>
              )}
            </span>
            {taskCount > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isSelected 
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {taskCount}
              </span>
            )}
          </div>
          
          <Dropdown>
            <DropdownButton
              as={Button}
              plain
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownButton>
            <DropdownMenu anchor="bottom end">
              {canAddChild(tag.id) && (
                <DropdownItem onClick={() => handleAddChildTag(tag.id)}>
                  Add Child Tag
                </DropdownItem>
              )}
              <DropdownItem onClick={() => handleEditTag(tag)}>
                Edit
              </DropdownItem>
              <DropdownItem onClick={() => handleDeleteTag(tag.id)}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {children.map(child => renderTagItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Tags
        </h3>
        <Button
          plain
          onClick={() => setShowCreateModal(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-1">
        {getRootTags().map(tag => renderTagItem(tag))}
      </div>

      {showCreateModal && (
        <TagModal
          open={showCreateModal}
          onClose={handleCloseModal}
          tag={editingTag}
          parentId={parentForNewTag}
        />
      )}
    </div>
  )
}