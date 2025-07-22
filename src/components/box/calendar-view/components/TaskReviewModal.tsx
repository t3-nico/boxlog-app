import React, { useState, useEffect } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'
import {
  Clock,
  Star,
  X,
  Pencil,
  Trash2,
  Check,
  Calendar,
  FileText,
  Zap
} from 'lucide-react'

interface Task {
  id: string
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

interface TaskReviewModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: Task['status']) => void
}

// 時間をフォーマット（24h/12h対応）
function formatTime(date: Date, timeFormat: '24h' | '12h'): string {
  if (timeFormat === '12h') {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } else {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
}

export function TaskReviewModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onStatusChange
}: TaskReviewModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const { timeFormat } = useCalendarSettingsStore()

  useEffect(() => {
    if (task) {
      setEditedTask(task)
      setIsEditing(false)
    }
  }, [task])

  if (!isOpen || !task || !editedTask) return null

  const handleSave = () => {
    onSave(editedTask)
    setIsEditing(false)
    onClose()
  }

  const handleDelete = () => {
    if (confirm('このタスクを削除しますか？')) {
      onDelete(task.id)
      onClose()
    }
  }

  const handleStatusChange = (status: Task['status']) => {
    onStatusChange(task.id, status)
    onClose()
  }

  const endTime = new Date(task.planned_start.getTime() + task.planned_duration * 60000)

  // 優先度の設定
  const getPriorityConfig = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return {
          icon: Zap,
          color: 'text-red-500',
          bg: 'bg-red-50 dark:bg-red-950/30',
          label: '緊急'
        }
      case 'medium':
        return {
          icon: Star,
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          label: '標準'
        }
      case 'low':
        return {
          icon: Star,
          color: 'text-gray-500',
          bg: 'bg-gray-50 dark:bg-gray-950/30',
          label: '低'
        }
    }
  }

  // ステータスの設定
  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: '予定',
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/30'
        }
      case 'in_progress':
        return {
          label: '進行中',
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-950/30'
        }
      case 'completed':
        return {
          label: '完了',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-950/30'
        }
    }
  }

  const priorityConfig = getPriorityConfig(editedTask.priority)
  const statusConfig = getStatusConfig(editedTask.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダル */}
      <div className="relative w-full max-w-lg">
        <div className={cn(
          "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl",
          "border border-gray-200 dark:border-gray-700",
          "overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        )}>
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", statusConfig.bg)}>
                  <Calendar className={cn("w-5 h-5", statusConfig.color)} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    タスクの詳細
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(task.planned_start, 'M月d日 (E)', { locale: require('date-fns/locale/ja') })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="px-6 py-4 space-y-6">
            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                タイトル
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {task.title}
                </p>
              )}
            </div>

            {/* 時間 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {formatTime(task.planned_start, timeFormat)} - {formatTime(endTime, timeFormat)}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ({task.planned_duration}分)
              </div>
            </div>

            {/* ステータスと優先度 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ステータス
                </label>
                {isEditing ? (
                  <select
                    value={editedTask.status}
                    onChange={(e) => setEditedTask({ 
                      ...editedTask, 
                      status: e.target.value as Task['status'] 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">予定</option>
                    <option value="in_progress">進行中</option>
                    <option value="completed">完了</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    {(['pending', 'in_progress', 'completed'] as const).map((status) => {
                      const config = getStatusConfig(status)
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={cn(
                            "px-3 py-2 rounded-full text-sm font-medium transition-all",
                            task.status === status ? [
                              config.bg,
                              config.color
                            ] : [
                              "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
                              "hover:bg-gray-200 dark:hover:bg-gray-700"
                            ]
                          )}
                        >
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  優先度
                </label>
                {isEditing ? (
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ 
                      ...editedTask, 
                      priority: e.target.value as Task['priority'] 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">低</option>
                    <option value="medium">標準</option>
                    <option value="high">緊急</option>
                  </select>
                ) : (
                  <div className={cn("inline-flex items-center gap-2 px-3 py-2 rounded-full", priorityConfig.bg)}>
                    <priorityConfig.icon className={cn("w-4 h-4", priorityConfig.color)} />
                    <span className={cn("text-sm font-medium", priorityConfig.color)}>
                      {priorityConfig.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 説明 */}
            {(task.description || isEditing) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  説明
                </label>
                {isEditing ? (
                  <textarea
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="説明を入力..."
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {task.description || '説明なし'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isEditing && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    削除
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setEditedTask(task)
                        setIsEditing(false)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      保存
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    編集
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}