'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Clock, Trash2, Pencil } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { Task, TaskStatus, TaskPriority } from '@/types/box'
import { CalendarTask } from '../utils/time-grid-helpers'
import { Button } from '@/components/ui/button'

interface TaskPopoverProps {
  task: CalendarTask | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  anchorEl?: HTMLElement | null
}

export function TaskPopover({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  anchorEl 
}: TaskPopoverProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title)
      setEditedDescription(task.description || '')
    }
  }, [task])
  
  if (!task) return null
  
  const handleSave = () => {
    const updates: Partial<Task> = {}
    
    if (editedTitle.trim() && editedTitle !== task.title) {
      updates.title = editedTitle.trim()
    }
    
    if (editedDescription !== (task.description || '')) {
      updates.description = editedDescription
    }
    
    if (Object.keys(updates).length > 0) {
      onUpdate(task.id, updates)
    }
    
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    setEditedTitle(task.title)
    setEditedDescription(task.description || '')
    setIsEditing(false)
  }
  
  const handleStatusChange = (status: TaskStatus) => {
    onUpdate(task.id, { status })
  }
  
  const handlePriorityChange = (priority: TaskPriority) => {
    onUpdate(task.id, { priority })
  }
  
  const handleDelete = () => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      onDelete(task.id)
      onClose()
    }
  }
  
  return (
    <Popover.Root open={isOpen} onOpenChange={onClose}>
      <Popover.Anchor asChild>
        <div style={{ position: 'absolute', top: 0, left: 0 }} />
      </Popover.Anchor>
      
      <Popover.Content 
        className="w-80 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50" 
        align="start"
        sideOffset={5}
      >
        <div className="p-4 space-y-4">
          {/* タイトル編集 */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
                  {task.title}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
          
          {/* 説明編集 */}
          {isEditing && (
            <div>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="説明を入力..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          )}
          
          {/* 説明表示 */}
          {!isEditing && task.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {task.description}
            </div>
          )}
          
          {/* 時間情報 */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>
              {format(task.startTime, 'HH:mm', { locale: ja })} - 
              {format(task.endTime, 'HH:mm', { locale: ja })}
            </span>
            <span className="text-gray-500 dark:text-gray-500">
              ({Math.round((task.endTime.getTime() - task.startTime.getTime()) / 60000)}分)
            </span>
          </div>
          
          {/* ステータス変更 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ステータス:
            </label>
            <select
              value={task.status || 'Todo'}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* 優先度変更 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              優先度:
            </label>
            <select
              value={task.priority || 'Medium'}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          {/* 編集モードのアクション */}
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                保存
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          )}
          
          {/* 通常モードのアクション */}
          {!isEditing && (
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleDelete}
                variant="ghost"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                削除
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
              >
                閉じる
              </Button>
            </div>
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  )
}