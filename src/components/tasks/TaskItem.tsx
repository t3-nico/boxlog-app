'use client'

import { Task } from '@/types/box'
import { getStatusColor, getPriorityColor, getTypeColor } from '@/lib/tasks'
import { Badge } from '@/components/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/button'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from '@/components/dropdown'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { useBoxStore } from '@/lib/box-store'

interface TaskItemProps {
  task: Task
  onEdit?: (task: Task) => void
  onSelect?: (task: Task) => void
}

export function TaskItem({ task, onEdit, onSelect }: TaskItemProps) {
  const { updateTask, deleteTask } = useBoxStore()
  
  const handleStatusToggle = () => {
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done'
    updateTask(task.id, { status: newStatus })
  }
  
  const handleEdit = () => {
    onEdit?.(task)
  }
  
  const handleDelete = () => {
    deleteTask(task.id)
  }
  
  const handleClick = () => {
    onSelect?.(task)
  }
  
  return (
    <div
      className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50 cursor-pointer"
      onClick={handleClick}
    >
      <Checkbox
        checked={task.status === 'Done'}
        onCheckedChange={handleStatusToggle}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      />
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-gray-500">{task.task}</span>
          <h3
            className={`font-medium ${
              task.status === 'Done' ? 'line-through text-gray-500' : ''
            }`}
          >
            {task.title}
          </h3>
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
      
      <Dropdown>
        <DropdownButton plain onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownButton>
        <DropdownMenu>
          <DropdownItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </DropdownItem>
          <DropdownItem onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}