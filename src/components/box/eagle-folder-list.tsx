'use client'

import React, { useState, useCallback } from 'react'
import { useTagStore } from '@/lib/tag-store'
import { useSidebarStore } from '@/lib/sidebar-store'
import { useBoxStore } from '@/lib/box-store'
import { Tag } from '@/types/unified'
import { 
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Folder
} from 'lucide-react'

interface EagleFolderListProps {
  onSelectTag: (tagId: string) => void
  selectedTagIds: string[]
}

export function EagleFolderList({ 
  onSelectTag, 
  selectedTagIds 
}: EagleFolderListProps) {
  const { getAllTags } = useTagStore()
  const { getSortedTasks } = useBoxStore()
  const { isSectionCollapsed, toggleSection } = useSidebarStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['tag-1', 'tag-2', 'tag-3']))
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tagId: string } | null>(null)

  const tags = getAllTags()
  const tasks = getSortedTasks()
  const isCollapsed = isSectionCollapsed('folders')

  // Get root tags (level 1) sorted by name
  const rootTags = tags
    .filter(tag => tag.level === 1)
    .sort((a, b) => a.name.localeCompare(b.name))

  const toggleExpanded = useCallback((tagId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tagId)) {
        newSet.delete(tagId)
      } else {
        newSet.add(tagId)
      }
      return newSet
    })
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, tagId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tagId
    })
  }, [])

  const getTaskCountForTag = (tag: Tag): number => {
    // Count tasks that have this tag or any child tags
    const getAllDescendantTagIds = (tagId: string): string[] => {
      const result = [tagId]
      const childTags = tags.filter(t => t.parent_id === tagId)
      for (const child of childTags) {
        result.push(...getAllDescendantTagIds(child.id))
      }
      return result
    }

    const relevantTagIds = getAllDescendantTagIds(tag.id)
    return tasks.filter(task => 
      task.tags?.some(taskTagId => relevantTagIds.includes(taskTagId))
    ).length
  }

  const getChildTags = (parentId: string): Tag[] => {
    return tags
      .filter(tag => tag.parent_id === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const renderTag = (tag: Tag, level: number = 0): JSX.Element => {
    const childTags = getChildTags(tag.id)
    const hasChildren = childTags.length > 0
    const isExpanded = expandedFolders.has(tag.id)
    const isSelected = selectedTagIds.includes(tag.id)
    const taskCount = getTaskCountForTag(tag)

    return (
      <div key={tag.id} className="select-none">
        <div
          className={`group flex items-center justify-between px-2 py-2 rounded-md cursor-pointer eagle-transition eagle-item-hover ${isSelected ? 'eagle-item-selected text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'} ${level > 0 ? 'eagle-tree-line' : ''}`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => onSelectTag(tag.id)}
          onContextMenu={(e) => handleContextMenu(e, tag.id)}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(tag.id)
                }}
                className="mr-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            
            {!hasChildren && level > 0 && (
              <div className="w-4 mr-1" />
            )}

            <div className="flex items-center min-w-0 flex-1">
              {/* Color indicator */}
              <div 
                className="eagle-color-dot w-4 h-4 rounded-full mr-2 flex-shrink-0 border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: tag.color }}
              />
              
              {/* Icon if available */}
              {(tag as any).icon && (
                <span className="text-sm mr-2 flex-shrink-0">
                  {(tag as any).icon}
                </span>
              )}
              
              <span className="text-sm font-medium truncate" title={tag.name}>
                {tag.name}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <span className="eagle-task-count">
              {taskCount}
            </span>
            
            <button
              onClick={(e) => handleContextMenu(e, tag.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {childTags.map(childTag => renderTag(childTag, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <button
        onClick={() => toggleSection('folders')}
        className="eagle-section-header flex items-center justify-between w-full px-2 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md eagle-transition"
      >
        <div className="flex items-center space-x-2">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>Folders</span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {rootTags.length}
        </span>
      </button>

      {/* Folder List */}
      {!isCollapsed && (
        <div className="space-y-1">
          {rootTags.map(tag => renderTag(tag))}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="eagle-context-menu fixed z-50 border border-gray-200 dark:border-gray-700 rounded-md py-1 min-w-36"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onBlur={() => setContextMenu(null)}
        >
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            New Folder
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            New Subfolder
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Rename
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Change Color
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Delete
          </button>
        </div>
      )}
    </div>
  )
}