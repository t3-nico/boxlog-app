'use client'

import { useState } from 'react'
import { useBoxStore } from '@/lib/box-store'
import { getStatusColor, getPriorityColor, getTypeColor } from '@/lib/tasks'
import { Task } from '@/types/box'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Edit, Trash2, X } from 'lucide-react'

interface TaskDetailProps {
  task: Task
  onEdit: () => void
  onClose: () => void
}

export function TaskDetail({ task, onEdit, onClose }: TaskDetailProps) {
  const { deleteTask } = useBoxStore()
  
  const handleDelete = () => {
    if (window.confirm('このタスクを削除しますか？')) {
      deleteTask(task.id)
      onClose()
    }
  }
  
  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-mono text-gray-500">{task.task}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
            <div className="flex items-center space-x-2">
              <Badge className={getTypeColor(task.type)}>
                {task.type}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        {/* Task Info */}
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">タスクID:</span>{' '}
            <span className="font-mono">{task.task}</span>
          </div>
          <div>
            <span className="font-medium">タイトル:</span>{' '}
            {task.title}
          </div>
          <div>
            <span className="font-medium">タイプ:</span>{' '}
            {task.type}
          </div>
          <div>
            <span className="font-medium">ステータス:</span>{' '}
            {task.status}
          </div>
          <div>
            <span className="font-medium">優先度:</span>{' '}
            {task.priority}
          </div>
        </div>
      </div>
    </div>
  )
}