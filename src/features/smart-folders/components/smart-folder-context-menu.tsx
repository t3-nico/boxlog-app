'use client'

import { useEffect, useRef } from 'react'

import {
  Copy as DocumentDuplicateIcon,
  Eye as EyeIcon,
  EyeOff as EyeSlashIcon,
  Pencil as PencilIcon,
  Star as StarIcon,
  Trash2 as TrashIcon,
} from 'lucide-react'

import { SmartFolder } from '@/types/smart-folders'

interface SmartFolderContextMenuProps {
  x: number
  y: number
  folder: SmartFolder
  onEdit: (folder: SmartFolder) => void
  onDelete: (folder: SmartFolder) => void
  onDuplicate: (folder: SmartFolder) => void
  onToggleActive: (folder: SmartFolder) => void
  onClose: () => void
}

export const SmartFolderContextMenu = ({
  x,
  y,
  folder,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onClose,
}: SmartFolderContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // メニュー位置の調整
  const adjustedPosition = {
    x: Math.min(x, window.innerWidth - 200), // メニュー幅を考慮
    y: Math.min(y, window.innerHeight - 300), // メニュー高さを考慮
  }

  const menuItems = [
    {
      icon: PencilIcon,
      label: 'Edit',
      action: () => onEdit(folder),
      disabled: false,
    },
    {
      icon: DocumentDuplicateIcon,
      label: 'Duplicate',
      action: () => onDuplicate(folder),
      disabled: false,
    },
    {
      icon: folder.isActive ? EyeSlashIcon : EyeIcon,
      label: folder.isActive ? 'Disable' : 'Enable',
      action: () => onToggleActive(folder),
      disabled: false,
    },
    {
      type: 'divider' as const,
    },
    {
      icon: TrashIcon,
      label: 'Delete',
      action: () => onDelete(folder),
      disabled: folder.isSystem,
      danger: true,
    },
  ]

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      {/* フォルダ情報ヘッダー */}
      <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {folder.icon ? (
            <span className="text-sm">{folder.icon}</span>
          ) : (
            <div className="h-4 w-4 rounded" style={{ backgroundColor: folder.color }} />
          )}
          <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{folder.name}</span>
          {folder.isSystem ? <StarIcon className="h-4 w-4 text-yellow-500" /> : null}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {folder.taskCount || 0} items • {folder.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* メニューアイテム */}
      {menuItems.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`divider-${index}`}
              className="my-1 border-t border-gray-200 dark:border-gray-700"
            />
          )
        }

        return (
          <button
            type="button"
            key={item.label}
            onClick={item.action}
            disabled={item.disabled}
            className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${
              item.disabled
                ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                : item.danger
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        )
      })}

      {/* フォルダが無効な場合の警告 */}
      {!folder.isActive && (
        <div className="border-t border-gray-200 px-3 py-2 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
            <EyeSlashIcon className="h-4 w-4" />
            This folder is currently disabled
          </div>
        </div>
      )}

      {/* システムフォルダの説明 */}
      {folder.isSystem === true && (
        <div className="border-t border-gray-200 px-3 py-2 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <StarIcon className="h-4 w-4" />
            System folder (cannot be deleted)
          </div>
        </div>
      )}
    </div>
  )
}
