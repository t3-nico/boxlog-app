'use client'

import { useState } from 'react'
import { SmartFolder } from '@/types/box'
import { useSmartFolderStore } from '@/lib/smart-folder-store'
import { useBoxStore } from '@/lib/box-store'
import { Button } from '@/components/button'
import { 
  Folder, 
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
import { SmartFolderModal } from './smart-folder-modal'

interface SmartFolderListProps {
  onSelectFolder: (folderId: string) => void
  selectedFolderId?: string
}

export function SmartFolderList({ onSelectFolder, selectedFolderId }: SmartFolderListProps) {
  const { 
    smartFolders, 
    deleteSmartFolder, 
    getTaskCount, 
    getRootFolders, 
    getChildFolders, 
    canAddChild 
  } = useSmartFolderStore()
  const { getSortedTasks } = useBoxStore()
  const tasks = getSortedTasks()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<SmartFolder | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [parentForNewFolder, setParentForNewFolder] = useState<string | null>(null)

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this smart folder?')) {
      deleteSmartFolder(folderId)
      if (selectedFolderId === folderId) {
        onSelectFolder('')
      }
    }
  }

  const handleEditFolder = (folder: SmartFolder) => {
    setEditingFolder(folder)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingFolder(null)
    setParentForNewFolder(null)
  }

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleAddChildFolder = (parentId: string) => {
    setParentForNewFolder(parentId)
    setShowCreateModal(true)
  }

  const renderFolderItem = (folder: SmartFolder, level: number = 0) => {
    const taskCount = getTaskCount(tasks, folder.id)
    const isSelected = selectedFolderId === folder.id
    const children = getChildFolders(folder.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const indentClass = level > 0 ? `ml-${level * 4}` : ''

    return (
      <div key={folder.id}>
        <div
          className={`group flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors ${indentClass} ${
            isSelected 
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0" onClick={() => onSelectFolder(folder.id)}>
            {hasChildren && (
              <Button
                plain
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  toggleExpanded(folder.id)
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
            
            {folder.icon && (
              <span className="text-sm">{folder.icon}</span>
            )}
            {folder.color && (
              <div 
                className="h-4 w-4 rounded flex-shrink-0" 
                style={{ backgroundColor: folder.color }}
              />
            )}
            {!folder.icon && !folder.color && (
              <Folder className="h-4 w-4 flex-shrink-0" />
            )}
            
            <span className="text-sm truncate">
              {folder.name}
              {folder.level > 1 && (
                <span className="text-xs text-gray-500 ml-1">
                  (L{folder.level})
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
              {canAddChild(folder.id) && (
                <DropdownItem onClick={() => handleAddChildFolder(folder.id)}>
                  Add Child Folder
                </DropdownItem>
              )}
              <DropdownItem onClick={() => handleEditFolder(folder)}>
                Edit
              </DropdownItem>
              <DropdownItem onClick={() => handleDeleteFolder(folder.id)}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {children.map(child => renderFolderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Smart Folders
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
        {getRootFolders().map(folder => renderFolderItem(folder))}
      </div>

      {showCreateModal && (
        <SmartFolderModal
          open={showCreateModal}
          onClose={handleCloseModal}
          folder={editingFolder}
          parentId={parentForNewFolder}
        />
      )}
    </div>
  )
}