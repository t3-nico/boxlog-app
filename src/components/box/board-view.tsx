'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, TaskStatus } from '@/types/box'
import { useBoxStore } from '@/lib/box-store'
import { useToast } from '@/components/ui/toast'
import { useTagStore } from '@/lib/tag-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TagBadge } from '@/components/tags/tag-badge'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/dropdown'
import {
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Edit,
  Plus,
} from 'lucide-react'

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'Todo', title: 'Todo', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'Done', title: 'Done', color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'Backlog', title: 'Backlog', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
]

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

function TaskCard({ task, isDragging, onEdit, onDelete }: TaskCardProps) {
  const { getTagsByIds } = useTagStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Bug':
        return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
      case 'Feature':
        return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30'
      case 'Documentation':
        return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30'
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30'
    }
  }

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'High':
        return <ArrowUp className="h-3 w-3 text-red-500" />
      case 'Medium':
        return <Minus className="h-3 w-3 text-yellow-500" />
      case 'Low':
        return <ArrowDown className="h-3 w-3 text-green-500" />
      default:
        return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`
        mb-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700
        hover:shadow-md transition-shadow
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge className={`text-xs ${getTypeColor(task.type)}`}>
          {task.type}
        </Badge>
        <Dropdown>
          <DropdownButton plain>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownButton>
          <DropdownMenu>
            <DropdownItem onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownItem>
            <DropdownItem onClick={() => onDelete(task.id)}>
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h3>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {getTagsByIds(task.tags).slice(0, 2).map(tag => (
            <TagBadge
              key={tag.id}
              tag={tag}
              size="sm"
              showIcon={false}
            />
          ))}
          {task.tags.length > 2 && (
            <Badge className="text-xs">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="font-mono">{task.task}</span>
        <div className="flex items-center">
          {getPriorityIcon()}
          <span className="ml-1">{task.priority}</span>
        </div>
      </div>
    </motion.div>
  )
}

interface BoardColumnProps {
  column: { id: TaskStatus; title: string; color: string }
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onAddTask: (status: TaskStatus) => void
}

function BoardColumn({ column, tasks, onEdit, onDelete, onAddTask }: BoardColumnProps) {
  return (
    <div className={`flex-1 min-w-0 ${column.color} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {column.title}
          </h2>
          <Badge color="zinc" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        <Button
          plain
          onClick={() => onAddTask(column.id)}
          className="p-1"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[200px] space-y-0">
          <AnimatePresence>
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-24 text-gray-500 dark:text-gray-400 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
            >
              Drop tasks here
            </motion.div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

interface BoardViewProps {
  className?: string
  onEditTask: (task: Task) => void
  onAddTask: (status?: TaskStatus) => void
}

export function BoardView({ className, onEditTask, onAddTask }: BoardViewProps) {
  const { getSortedTasks, updateTask, deleteTask } = useBoxStore()
  const { success, error } = useToast()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const tasks = getSortedTasks()

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    let newStatus: TaskStatus

    // Check if we're dropping on a column or another task
    if (columns.some(col => col.id === over.id)) {
      newStatus = over.id as TaskStatus
    } else {
      // We're dropping on a task, find its column
      const targetTask = tasks.find(t => t.id === over.id)
      if (!targetTask) return
      newStatus = targetTask.status
    }

    // Check if task is being moved to a different column
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    try {
      const result = await updateTask(taskId, { status: newStatus })
      if (result) {
        success('Task updated', `Task moved to ${newStatus}`)
      } else {
        error('Update failed', 'Failed to move task')
      }
    } catch (err) {
      error('Move failed', 'An error occurred while moving the task')
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`h-full ${className}`}>
        <div className="flex gap-6 h-full overflow-x-auto">
          {columns.map(column => (
            <SortableContext
              key={column.id}
              id={column.id}
              items={getTasksByStatus(column.id).map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <BoardColumn
                column={column}
                tasks={getTasksByStatus(column.id)}
                onEdit={onEditTask}
                onDelete={handleDeleteTask}
                onAddTask={onAddTask}
              />
            </SortableContext>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            isDragging
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}