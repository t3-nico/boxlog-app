'use client'

import { useState } from 'react'
import { 
  KanbanProvider, 
  KanbanBoard, 
  KanbanHeader, 
  KanbanCards, 
  KanbanCard,
  type DragEndEvent
} from '@/components/ui/kibo-ui/kanban'
import { Task, TaskStatus } from '@/types/unified'
import { useBoxStore } from '@/lib/box-store'
import { useToast } from '@/components/ui/toast'
import { useTagStore } from '@/features/tags/stores/tag-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TagBadge } from '@/features/tags/components/tag-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Edit,
  Plus,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Column definitions for kanban
const columns = [
  { id: 'backlog', name: 'Backlog', color: 'bg-gray-50 dark:bg-gray-900/50' },
  { id: 'scheduled', name: 'Scheduled', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'completed', name: 'Completed', color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'rescheduled', name: 'Rescheduled', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
]

interface KanbanTaskData {
  id: string
  name: string
  column: string
  task: Task
  [key: string]: unknown
}

interface BoardViewProps {
  className?: string
  onEditTask: (task: Task) => void
  onAddTask: (status?: TaskStatus) => void
}

export function BoardView({ className, onEditTask, onAddTask }: BoardViewProps) {
  const { getSortedTasks, updateTask, deleteTask } = useBoxStore()
  const { getTagsByIds } = useTagStore()
  const { success, error } = useToast()
  
  const tasks = getSortedTasks()
  
  // Transform tasks to KanbanProvider format
  const kanbanData: KanbanTaskData[] = tasks.map(task => ({
    id: task.id,
    name: task.title,
    column: task.status,
    task,
  }))
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Bug':
        return 'destructive'
      case 'Feature':
        return 'default'
      case 'Documentation':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <ArrowUp className="h-4 w-4 text-red-500" />
      case 'Medium':
        return <Minus className="h-4 w-4 text-yellow-500" />
      case 'Low':
        return <ArrowDown className="h-4 w-4 text-green-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const handleDataChange = async (newData: KanbanTaskData[]) => {
    // Find task that changed column
    for (const item of newData) {
      const originalTask = tasks.find(t => t.id === item.id)
      if (originalTask && originalTask.status !== item.column) {
        try {
          const result = await updateTask(item.id, { status: item.column as TaskStatus })
          if (result) {
            success('Task updated', `Task moved to ${item.column}`)
          } else {
            error('Update failed', 'Failed to move task')
          }
        } catch (err) {
          error('Move failed', 'An error occurred while moving the task')
        }
        break
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await deleteTask(taskId)
      if (result) {
        success('Task deleted', 'Task has been successfully removed')
      } else {
        error('Delete failed', 'Failed to delete task')
      }
    }
  }

  const getColumnTaskCount = (columnId: string) => {
    return kanbanData.filter(item => item.column === columnId).length
  }

  return (
    <div className={cn("h-full", className)}>
      <KanbanProvider 
        columns={columns} 
        data={kanbanData}
        onDataChange={handleDataChange}
        className="h-full"
      >
        {(column) => (
          <KanbanBoard 
            key={column.id} 
            id={column.id}
            className={cn("h-full", column.color)}
          >
            <KanbanHeader className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{column.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {getColumnTaskCount(column.id)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddTask(column.id as TaskStatus)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </KanbanHeader>
            
            <KanbanCards id={column.id} className="p-3">
              {(item: KanbanTaskData) => (
                <KanbanCard 
                  key={item.id} 
                  id={item.id} 
                  name={item.name}
                  column={item.column}
                  className="mb-3 hover:shadow-lg transition-all duration-200"
                >
                  <div className="space-y-2">
                    {/* Header with type badge and actions */}
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant={getTypeColor(item.task.type)} className="text-xs">
                        {item.task.type}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditTask(item.task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTask(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Task title */}
                    <h3 className="text-sm font-medium line-clamp-2">
                      {item.task.title}
                    </h3>

                    {/* Tags */}
                    {item.task.tags && item.task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {getTagsByIds(item.task.tags).slice(0, 2).map(tag => (
                          <TagBadge
                            key={tag.id}
                            tag={tag}
                            size="sm"
                            showIcon={false}
                          />
                        ))}
                        {item.task.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer with ID and priority */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">{item.task.id}</span>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(item.task.priority)}
                        <span>{item.task.priority}</span>
                      </div>
                    </div>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  )
}