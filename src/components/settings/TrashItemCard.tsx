'use client'

import { useState } from 'react'
import { Trash2 as TrashIcon, RotateCcw as ArrowPathIcon } from 'lucide-react'
import { 
  FileText as DocumentTextIcon, 
  Calendar as CalendarIcon, 
  Tag as TagIcon, 
  Folder as FolderIcon,
  AlertTriangle as ExclamationTriangleIcon 
} from 'lucide-react'
import { useTrashStore } from '@/stores/trashStore'
import { DeletedItem } from '@/types/trash'
import { Button } from '@/components/button'

interface TrashItemCardProps {
  item: DeletedItem
}

// アイテムタイプに応じたアイコンを取得
function getItemTypeIcon(type: DeletedItem['type']) {
  switch (type) {
    case 'task':
      return DocumentTextIcon
    case 'event':
      return CalendarIcon
    case 'tag':
      return TagIcon
    case 'smart-folder':
      return FolderIcon
    default:
      return DocumentTextIcon
  }
}

// 相対時間のフォーマット
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'yesterday'
  return `${diffDays} days ago`
}

// アイテムタイプの表示名を取得
function getItemTypeLabel(type: DeletedItem['type']): string {
  switch (type) {
    case 'task':
      return 'Task'
    case 'event':
      return 'Event'
    case 'tag':
      return 'Tag'
    case 'smart-folder':
      return 'Smart Folder'
    default:
      return 'Item'
  }
}

export const TrashItemCard = ({ item }: TrashItemCardProps) => {
  const { restoreItem, permanentDelete } = useTrashStore()
  const [isRestoring, setIsRestoring] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRestore = async () => {
    setIsRestoring(true)
    try {
      await restoreItem(item.id)
      // Toast通知は将来的に実装
      console.log(`"${item.data.name}" restored successfully`)
    } catch (error) {
      console.error('Failed to restore item:', error)
    } finally {
      setIsRestoring(false)
    }
  }

  const handlePermanentDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${item.data.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await permanentDelete(item.id)
      console.log('Item permanently deleted')
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const daysUntilExpiration = Math.ceil(
    (new Date(item.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const IconComponent = getItemTypeIcon(item.type)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {/* アイテムタイプアイコン */}
            <div className="flex-shrink-0">
              <IconComponent className="w-5 h-5 text-gray-400" />
            </div>
            
            {/* アイテム名とタイプ */}
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.data.name || item.data.title || 'Unnamed item'}
              </h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {getItemTypeLabel(item.type)}
              </span>
            </div>
          </div>
          
          {/* 削除情報 */}
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div>
              Deleted {formatRelativeTime(item.deletedAt)}
              {item.originalPath && ` from ${item.originalPath}`}
            </div>
          </div>
          
          {/* 期限情報 */}
          <div className="mt-1 flex items-center space-x-1 text-xs">
            {daysUntilExpiration <= 3 && (
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
            )}
            <span className={`${daysUntilExpiration <= 3 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
              {daysUntilExpiration > 0 
                ? `Expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}`
                : 'Expires soon'
              }
            </span>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center space-x-2 ml-4">
          <Button
            outline
            onClick={handleRestore}
            disabled={isRestoring || isDeleting}
            className="text-xs"
          >
            {isRestoring ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="w-4 h-4" />
            )}
            Restore
          </Button>
          
          <Button
            color="red"
            onClick={handlePermanentDelete}
            disabled={isDeleting || isRestoring}
            className="text-xs"
          >
            {isDeleting ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}