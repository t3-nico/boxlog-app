'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBoxStore } from '@/lib/box-store'
import { useTagStore } from '@/lib/tag-store'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/box'
import {
  TableProvider,
  TableHeader,
  TableHeaderGroup,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  type ColumnDef,
} from '@/components/ui/kibo-ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskMobileCard } from './task-mobile-card'
import { TaskDetailModal } from './task-detail-modal'
import { useToast } from '@/components/ui/toast'
import {
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Circle,
  CheckCircle2,
  Clock,
  XCircle,
  Minus,
  Edit,
  Eye,
} from 'lucide-react'
import { TagBadge } from '@/components/tags/tag-badge'

const getStatusIcon = (status: TaskStatus) => {
  const iconProps = "h-4 w-4"
  switch (status) {
    case 'Todo':
      return <Circle className={`${iconProps} text-gray-500`} />
    case 'In Progress':
      return <Clock className={`${iconProps} text-blue-500`} />
    case 'Done':
      return <CheckCircle2 className={`${iconProps} text-green-500`} />
    case 'Cancelled':
      return <XCircle className={`${iconProps} text-red-500`} />
    case 'Backlog':
      return <Minus className={`${iconProps} text-gray-400`} />
    default:
      return <Circle className={`${iconProps} text-gray-500`} />
  }
}

const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'Todo':
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
    case 'In Progress':
      return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800'
    case 'Done':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    case 'Cancelled':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800'
    case 'Backlog':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}

const getPriorityIcon = (priority: TaskPriority) => {
  const iconProps = "h-4 w-4"
  switch (priority) {
    case 'High':
      return <ArrowUp className={`${iconProps} text-red-500`} />
    case 'Medium':
      return <Minus className={`${iconProps} text-yellow-500`} />
    case 'Low':
      return <ArrowDown className={`${iconProps} text-green-500`} />
    default:
      return <Minus className={`${iconProps} text-gray-500`} />
  }
}

const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'High':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800'
    case 'Medium':
      return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-800'
    case 'Low':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}

const getTypeColor = (type: TaskType): string => {
  switch (type) {
    case 'Bug':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800'
    case 'Feature':
      return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-800'
    case 'Documentation':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-800'
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
  }
}

interface TaskTableProps {
  onEditTask?: (task: Task) => void
  onViewTask?: (task: Task) => void
}

export function TaskTable({ onEditTask, onViewTask }: TaskTableProps) {
  const { 
    getSortedTasks, 
    updateTask, 
    deleteTask, 
    toggleTaskSelection, 
    selectAllTasks, 
    getSelectedTasks 
  } = useBoxStore()
  const { getTagsByIds } = useTagStore()
  const { success, error } = useToast()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)

  const tasks = getSortedTasks()
  const selectedTasks = getSelectedTasks()

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const result = await updateTask(taskId, { status: newStatus })
      if (result) {
        success('Task updated', `Status changed to ${newStatus}`)
      } else {
        error('Update failed', 'Failed to update task status')
      }
    } catch (err) {
      error('Update failed', 'An error occurred while updating the task')
    }
  }

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    try {
      const result = await updateTask(taskId, { priority: newPriority })
      if (result) {
        success('Task updated', `Priority changed to ${newPriority}`)
      } else {
        error('Update failed', 'Failed to update task priority')
      }
    } catch (err) {
      error('Update failed', 'An error occurred while updating the task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const result = await deleteTask(taskId)
        if (result) {
          success('Task deleted', 'Task has been successfully removed')
        } else {
          error('Delete failed', 'Failed to delete task')
        }
      } catch (err) {
        error('Delete failed', 'An error occurred while deleting the task')
      }
    }
  }

  const handleEditTask = (task: Task) => {
    if (onEditTask) {
      onEditTask(task)
    } else {
      setEditingTask(task)
    }
  }

  const handleViewTask = (task: Task) => {
    if (onViewTask) {
      onViewTask(task)
    } else {
      setViewingTask(task)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    selectAllTasks(checked)
  }

  const columns: ColumnDef<Task>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={selectedTasks.length === tasks.length && tasks.length > 0}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.selected}
          onCheckedChange={() => toggleTaskSelection(row.original.id)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'task',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">
          {row.getValue('task')}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">{row.getValue('title')}</div>
          <Badge className={`mt-1 text-xs ${getTypeColor(row.original.type)}`}>
            {row.original.type}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as TaskStatus
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <Badge className={`text-xs ${getStatusColor(status)}`}>
                    {status}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(['Todo', 'In Progress', 'Done', 'Cancelled', 'Backlog'] as TaskStatus[]).map((statusOption) => (
                <DropdownMenuItem
                  key={statusOption}
                  onClick={() => handleStatusChange(row.original.id, statusOption)}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(statusOption)}
                    {statusOption}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue('priority') as TaskPriority
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(priority)}
                  <Badge className={`text-xs ${getPriorityColor(priority)}`}>
                    {priority}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(['High', 'Medium', 'Low'] as TaskPriority[]).map((priorityOption) => (
                <DropdownMenuItem
                  key={priorityOption}
                  onClick={() => handlePriorityChange(row.original.id, priorityOption)}
                >
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(priorityOption)}
                    {priorityOption}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags || []
        const tagObjects = getTagsByIds(tags)
        
        if (tagObjects.length === 0) {
          return <div className="text-muted-foreground">—</div>
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {tagObjects.slice(0, 2).map(tag => (
              <TagBadge
                key={tag.id}
                tag={tag}
                size="sm"
                showIcon={false}
              />
            ))}
            {tagObjects.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tagObjects.length - 2}
              </Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const task = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewTask(task)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteTask(task.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], [tasks, selectedTasks, getTagsByIds])

  // Mobile responsive check
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ 
                duration: 0.2,
                delay: index * 0.05,
                layout: { duration: 0.3 }
              }}
            >
              <TaskMobileCard
                task={task}
                index={index}
                onEdit={handleEditTask}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 text-muted-foreground"
          >
            No tasks found
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <TableProvider columns={columns} data={tasks}>
          <TableHeader>
            {({ headerGroup }) => (
              <TableHeaderGroup headerGroup={headerGroup}>
                {({ header }) => (
                  <TableHead key={header.id} header={header} />
                )}
              </TableHeaderGroup>
            )}
          </TableHeader>
          <TableBody>
            {({ row }) => (
              <TableRow key={row.id} row={row}>
                {({ cell }) => (
                  <TableCell key={cell.id} cell={cell} />
                )}
              </TableRow>
            )}
          </TableBody>
        </TableProvider>
      </div>

      {editingTask && (
        <TaskForm
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          open={!!viewingTask}
          onClose={() => setViewingTask(null)}
        />
      )}
    </>
  )
}