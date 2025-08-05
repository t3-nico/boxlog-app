'use client'

import React, { useState, useCallback } from 'react'
import { useSmartFolderStore } from '@/lib/smart-folder-store'
import { useSidebarStore } from '@/lib/sidebar-store'
import { useBoxStore } from '@/lib/box-store'
import { SmartFolder } from '@/types/unified'
import { 
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Folder
} from 'lucide-react'

interface EagleSmartFolderListProps {
  onSelectFolder: (folderId: string) => void
  selectedFolderId: string
}

export function EagleSmartFolderList({ 
  onSelectFolder, 
  selectedFolderId 
}: EagleSmartFolderListProps) {
  const { smartFolders, getTaskCount } = useSmartFolderStore()
  const { getSortedTasks } = useBoxStore()
  const { isSectionCollapsed, toggleSection } = useSidebarStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['all-tasks', 'recent', 'favorites']))
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null)

  const tasks = getSortedTasks()
  const isCollapsed = isSectionCollapsed('smart-folders')

  // Sort folders by order and separate system vs user folders
  const systemFolders = smartFolders
    .filter(f => f.isSystem)
    .sort((a, b) => a.orderIndex - b.orderIndex)
  
  const userFolders = smartFolders
    .filter(f => !f.isSystem)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const toggleExpanded = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId
    })
  }, [])

  const getTaskCountForFolder = (folder: SmartFolder): number => {
    if (folder.isSystem) {
      switch (folder.id) {
        case 'all-tasks':
          return tasks.length
        case 'recent':
          const recentTasks = tasks.filter(task => {
            const daysDiff = Math.floor((Date.now() - new Date(task.updated_at).getTime()) / (1000 * 60 * 60 * 24))
            return daysDiff <= 7
          })
          return recentTasks.length
        case 'favorites':
          return 0 // TODO: Implement favorites logic with new Task type
        case 'trash':
          return 0 // Implement trash logic when needed
        default:
          return 0
      }
    }
    return getTaskCount(tasks, folder.id)
  }

  const renderFolder = (folder: SmartFolder, level: number = 0): JSX.Element => {
    const hasChildren = false // SmartFolders don't have hierarchical structure
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const taskCount = getTaskCountForFolder(folder)
    const childFolders: SmartFolder[] = [] // No children for SmartFolders

    return (
      <div key={folder.id} className="select-none">
        <div
          className={`group flex items-center justify-between px-2 py-2 rounded-md cursor-pointer eagle-transition eagle-item-hover ${isSelected ? 'eagle-item-selected text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'} ${level > 0 ? 'eagle-tree-line' : ''}`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
          onContextMenu={(e) => handleContextMenu(e, folder.id)}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(folder.id)
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
              <span className="text-sm mr-2 flex-shrink-0">
                {folder.icon || <Folder className="h-4 w-4" />}
              </span>
              
              <span className="text-sm font-medium truncate" title={folder.name}>
                {folder.name}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <span className="eagle-task-count">
              {taskCount}
            </span>
            
            {!folder.isSystem && (
              <button
                onClick={(e) => handleContextMenu(e, folder.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {childFolders
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map(childFolder => renderFolder(childFolder, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <button
        onClick={() => toggleSection('smart-folders')}
        className="eagle-section-header flex items-center justify-between w-full px-2 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md eagle-transition"
      >
        <div className="flex items-center space-x-2">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>Smart Folders</span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {systemFolders.length + userFolders.length}
        </span>
      </button>

      {/* Folder List */}
      {!isCollapsed && (
        <div className="space-y-1">
          {/* System Folders */}
          {systemFolders.map(folder => renderFolder(folder))}
          
          {/* Divider */}
          {userFolders.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
          )}
          
          {/* User Folders */}
          {userFolders.map(folder => renderFolder(folder))}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="eagle-context-menu fixed z-50 border border-gray-200 dark:border-gray-700 rounded-md py-1 min-w-32"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onBlur={() => setContextMenu(null)}
        >
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            New Folder
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Edit
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Duplicate
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