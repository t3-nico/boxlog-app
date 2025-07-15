'use client'

import { useState, useEffect } from 'react'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/box'
import { taskTypes } from '@/lib/tasks'
import { useBoxStore } from '@/lib/box-store'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { generateId } from '@/lib/tasks'
import { TagSelector } from '@/components/tags/tag-selector'

interface TaskFormData {
  task: string
  title: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
}

interface TaskFormProps {
  task?: Task | null
  open: boolean
  onClose: () => void
}

export function TaskForm({ task, open, onClose }: TaskFormProps) {
  const { addTask, updateTask } = useBoxStore()
  const { success, error } = useToast()
  
  const [formData, setFormData] = useState<TaskFormData>({
    task: '',
    title: '',
    type: 'Feature',
    status: 'Todo',
    priority: 'Medium',
    tags: [],
  })
  
  useEffect(() => {
    if (task) {
      setFormData({
        task: task.task,
        title: task.title,
        type: task.type,
        status: task.status,
        priority: task.priority,
        tags: task.tags || [],
      })
    } else {
      setFormData({
        task: `TASK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        title: '',
        type: 'Feature',
        status: 'Todo',
        priority: 'Medium',
        tags: [],
      })
    }
  }, [task])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      error('Validation error', 'Title is required')
      return
    }
    
    try {
      let result: boolean
      
      if (task) {
        result = await updateTask(task.id, formData)
        if (result) {
          success('Task updated', 'Task has been successfully updated')
        } else {
          error('Update failed', 'Failed to update task. Please try again.')
          return
        }
      } else {
        const now = new Date()
        result = await addTask({
          ...formData,
          selected: false,
          createdAt: now,
          updatedAt: now,
          attachments: [],
          comments: [],
        })
        if (result) {
          success('Task created', 'New task has been successfully created')
        } else {
          error('Creation failed', 'Failed to create task. Please try again.')
          return
        }
      }
      
      onClose()
    } catch (err) {
      error('Operation failed', 'An unexpected error occurred. Please try again.')
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {task ? 'タスクを編集' : '新しいタスクを作成'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">タスクID</Label>
            <Input
              id="task"
              value={formData.task}
              onChange={(e) =>
                setFormData({ ...formData, task: e.target.value })
              }
              placeholder="TASK-XXXX"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="タスクのタイトルを入力"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>タイプ</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TaskType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug">Bug</SelectItem>
                <SelectItem value="Feature">Feature</SelectItem>
                <SelectItem value="Documentation">Documentation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ステータス</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>優先度</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>タグ</Label>
            <TagSelector
              selectedTagIds={formData.tags}
              onTagsChange={(tagIds) => setFormData({ ...formData, tags: tagIds })}
              placeholder="タグを選択..."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" outline onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">
              {task ? '更新' : '作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}