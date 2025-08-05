'use client'

import { Task } from '@/types/box'
import { getStatusColor, getPriorityColor, getTypeColor } from '@/lib/tasks'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
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
    const newStatus = task.status === 'completed' ? 'backlog' : 'completed'
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
        checked={task.status === 'completed'}
        onCheckedChange={handleStatusToggle}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      />
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono text-gray-500">{task.id}</span>
          <h3
            className={`font-medium ${
              task.status === 'completed' ? 'line-through text-gray-500' : ''
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}