'use client'

import { useState, useCallback } from 'react'

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy , useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'
import { 
  Plus as PlusIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  MoreHorizontal as EllipsisHorizontalIcon,
  Folder as FolderIcon,
  Menu as Bars3Icon
} from 'lucide-react'

import { useSmartFolders, useCreateSmartFolder, useUpdateSmartFolder, useDeleteSmartFolder, useReorderSmartFolders } from '@/features/smart-folders/hooks/use-smart-folders'
import { useActiveState } from '@/hooks/useActiveState'
import { SmartFolder } from '@/types/smart-folders'

import { SmartFolderContextMenu } from './smart-folder-context-menu'
import { SmartFolderDialog } from './smart-folder-dialog'

interface SmartFolderListProps {
  collapsed?: boolean
  currentPath?: string
  selectedFolderId?: string
  onSelectFolder?: (folderId: string) => void
  previewItems?: any[]
}

// ソート可能なフォルダアイテム
const SortableSmartFolderItem = ({ 
  folder, 
  isSelected, 
  isCollapsed, 
  onClick, 
  onContextMenu 
}: {
  folder: SmartFolder
  isSelected: boolean
  isCollapsed: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent, folder: SmartFolder) => void
}) => {
  const { isSmartFolderActive } = useActiveState()
  const isActive = isSmartFolderActive(folder.id)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      className={clsx(
        'group flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors duration-150',
        {
          'smart-folder-item-active': isActive,
          'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': !isActive,
          'opacity-50': !folder.isActive
        }
      )}
      onClick={onClick}
      onContextMenu={(e) => onContextMenu(e, folder)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`スマートフォルダー: ${folder.name}`}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        {/* ドラッグハンドル */}
        {!folder.isSystem && (
          <div 
            {...attributes}
            {...listeners}
            className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Bars3Icon className="h-4 w-4" data-slot="icon" />
          </div>
        )}
        
        {/* アイコン */}
        <div className="flex-shrink-0">
          {folder.icon ? (
            <span className="text-sm">{folder.icon}</span>
          ) : (
            <FolderIcon 
              className={clsx('h-4 w-4', { 'smart-folder-icon': isActive })}
              style={{ color: isActive ? undefined : folder.color }}
              data-slot="icon"
            />
          )}
        </div>
        
        {/* フォルダ名 */}
        {!isCollapsed && (
          <span className="text-xs font-medium truncate" title={folder.name}>
            {folder.name}
          </span>
        )}
      </div>

      {/* タスク数とメニュー */}
      {!isCollapsed && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {folder.taskCount || 0}
          </span>
          
          {!folder.isSystem && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onContextMenu(e, folder)
              }}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
            >
              <EllipsisHorizontalIcon className="h-4 w-4" data-slot="icon" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const SmartFolderList = ({ 
  collapsed = false, 
  currentPath = '', 
  selectedFolderId = '',
  onSelectFolder,
  previewItems = []
}: SmartFolderListProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingFolder, setEditingFolder] = useState<SmartFolder | undefined>()
  const [contextMenu, setContextMenu] = useState<{ 
    x: number
    y: number
    folder: SmartFolder 
  } | null>(null)

  // React Query hooks
  const { data: smartFolders = [], isLoading } = useSmartFolders()
  const createMutation = useCreateSmartFolder()
  const updateMutation = useUpdateSmartFolder()
  const deleteMutation = useDeleteSmartFolder()
  const reorderMutation = useReorderSmartFolders()

  // ドラッグ&ドロップセンサー
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // システムフォルダとユーザーフォルダに分離
  const systemFolders = smartFolders.filter(f => f.isSystem).sort((a, b) => a.orderIndex - b.orderIndex)
  const userFolders = smartFolders.filter(f => !f.isSystem).sort((a, b) => a.orderIndex - b.orderIndex)

  // フォルダ選択
  const handleSelectFolder = useCallback((folderId: string) => {
    onSelectFolder?.(folderId)
  }, [onSelectFolder])

  // 右クリックメニュー
  const handleContextMenu = useCallback((e: React.MouseEvent, folder: SmartFolder) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folder
    })
  }, [])

  // コンテキストメニューアクション
  const handleEdit = useCallback((folder: SmartFolder) => {
    setEditingFolder(folder)
    setShowEditDialog(true)
    setContextMenu(null)
  }, [])

  const handleDelete = useCallback(async (folder: SmartFolder) => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(folder.id)
      } catch (error) {
        console.error('Failed to delete folder:', error)
      }
    }
    setContextMenu(null)
  }, [deleteMutation])

  const handleDuplicate = useCallback(async (folder: SmartFolder) => {
    try {
      await createMutation.mutateAsync({
        name: `${folder.name} (Copy)`,
        description: folder.description,
        rules: folder.rules,
        icon: folder.icon,
        color: folder.color,
        orderIndex: folder.orderIndex + 1
      })
    } catch (error) {
      console.error('Failed to duplicate folder:', error)
    }
    setContextMenu(null)
  }, [createMutation])

  const handleToggleActive = useCallback(async (folder: SmartFolder) => {
    try {
      await updateMutation.mutateAsync({
        id: folder.id,
        isActive: !folder.isActive
      })
    } catch (error) {
      console.error('Failed to toggle folder:', error)
    }
    setContextMenu(null)
  }, [updateMutation])

  // ドラッグ&ドロップ処理
  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      const oldIndex = userFolders.findIndex(folder => folder.id === active.id)
      const newIndex = userFolders.findIndex(folder => folder.id === over.id)
      
      const reorderedFolders = arrayMove(userFolders, oldIndex, newIndex)
      
      // 新しい順序を計算
      const folderOrders = reorderedFolders.map((folder, index) => ({
        id: folder.id,
        orderIndex: index
      }))
      
      reorderMutation.mutate(folderOrders)
    }
  }, [userFolders, reorderMutation])

  // フォルダ作成
  const handleCreateFolder = useCallback(async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw error
    }
  }, [createMutation])

  // フォルダ更新
  const handleUpdateFolder = useCallback(async (data: any) => {
    if (!editingFolder) return
    
    try {
      await updateMutation.mutateAsync({
        id: editingFolder.id,
        ...data
      })
      setShowEditDialog(false)
      setEditingFolder(undefined)
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw error
    }
  }, [editingFolder, updateMutation])

  if (collapsed) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="section-header-toggle flex items-center mb-2 px-2 text-xs/6 font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-950/5 dark:hover:bg-white/5 rounded transition-colors"
        >
          <span className="peer">Smart Folders</span>
          <span className="ml-1 opacity-0 peer-hover:opacity-100 transition-opacity">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" data-slot="icon" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" data-slot="icon" />
            )}
          </span>
        </button>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="section-header-button p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <PlusIcon className="h-4 w-4 text-gray-400" data-slot="icon" />
        </button>
      </div>

      {/* フォルダリスト */}
      {isExpanded && (
        <div className="space-y-2">
          {/* システムフォルダ */}
          {systemFolders.map(folder => (
            <SortableSmartFolderItem
              key={folder.id}
              folder={folder}
              isSelected={selectedFolderId === folder.id}
              isCollapsed={collapsed}
              onClick={() => handleSelectFolder(folder.id)}
              onContextMenu={handleContextMenu}
            />
          ))}
          
          {/* 区切り線 */}
          {systemFolders.length > 0 && userFolders.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
          )}
          
          {/* ユーザーフォルダ（ドラッグ可能） */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={userFolders.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {userFolders.map(folder => (
                <SortableSmartFolderItem
                  key={folder.id}
                  folder={folder}
                  isSelected={selectedFolderId === folder.id}
                  isCollapsed={collapsed}
                  onClick={() => handleSelectFolder(folder.id)}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* コンテキストメニュー */}
      {contextMenu && (
        <SmartFolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          folder={contextMenu.folder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onToggleActive={handleToggleActive}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* 作成ダイアログ */}
      <SmartFolderDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateFolder}
        previewItems={previewItems}
      />

      {/* 編集ダイアログ */}
      <SmartFolderDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false)
          setEditingFolder(undefined)
        }}
        onSave={handleUpdateFolder}
        folder={editingFolder}
        previewItems={previewItems}
      />
    </div>
  )
}