'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBoxStore } from '@/lib/box-store'
import { useTagStore } from '@/lib/tag-store'
import { Task, SortConfig, TaskStatus, TaskPriority, TaskType } from '@/types/box'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/badge'
import { Button } from '@/components/ui/button'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/ui/dropdown-menu'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskMobileCard } from './task-mobile-card'
import { TaskDetailModal } from './task-detail-modal'
import { useToast } from '@/components/ui/toast'
import {
  ChevronsUpDown,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Circle,
  CheckCircle2,
  Clock,
  XCircle,
  Minus,
  Edit,
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
    case 'Backlog':
      return <Minus className={`${iconProps} text-gray-400`} />
    case 'Cancelled':
      return <XCircle className={`${iconProps} text-red-500`} />
    default:
      return <Circle className={`${iconProps} text-gray-500`} />
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

const getTaskTypeBadge = (type: TaskType) => {
  switch (type) {
    case 'Bug':
      return <Badge color="red">{type}</Badge>
    case 'Feature':
      return <Badge color="blue">{type}</Badge>
    case 'Documentation':
      return <Badge color="green">{type}</Badge>
    default:
      return <Badge color="zinc">{type}</Badge>
  }
}

const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case 'Todo':
      return <Badge color="zinc">{status}</Badge>
    case 'In Progress':
      return <Badge color="blue">{status}</Badge>
    case 'Done':
      return <Badge color="green">{status}</Badge>
    case 'Backlog':
      return <Badge color="yellow">{status}</Badge>
    case 'Cancelled':
      return <Badge color="red">{status}</Badge>
    default:
      return <Badge color="zinc">{status}</Badge>
  }
}

const getPriorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case 'High':
      return <Badge color="red">{priority}</Badge>
    case 'Medium':
      return <Badge color="yellow">{priority}</Badge>
    case 'Low':
      return <Badge color="green">{priority}</Badge>
    default:
      return <Badge color="zinc">{priority}</Badge>
  }
}

interface TaskTableProps {
  className?: string
}

export function TaskTable({ className }: TaskTableProps) {
  const {
    getSortedTasks,
    sortConfig,
    setSortConfig,
    toggleTaskSelection,
    selectAllTasks,
    updateTask,
    deleteTask,
  } = useBoxStore()

  const { getTagsByIds } = useTagStore()
  const { success, error } = useToast()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const tasks = getSortedTasks()
  const selectedTasks = tasks.filter(task => task.selected)
  const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length
  const indeterminate = selectedTasks.length > 0 && !allSelected

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const renderSortButton = (key: keyof Task, label: string) => {
    const isActive = sortConfig.key === key
    return (
      <Button
        plain
        className="flex items-center gap-2 font-medium"
        onClick={() => handleSort(key)}
      >
        {label}
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    )
  }

  const handleSelectAll = () => {
    selectAllTasks(!allSelected)
  }

  const handleTaskSelect = (taskId: string) => {
    toggleTaskSelection(taskId)
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const result = await updateTask(taskId, { status: newStatus })
    if (result) {
      success('Status updated', `Task status changed to ${newStatus}`)
    } else {
      error('Failed to update status', 'Please try again')
    }
  }

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    const result = await updateTask(taskId, { priority: newPriority })
    if (result) {
      success('Priority updated', `Task priority changed to ${newPriority}`)
    } else {
      error('Failed to update priority', 'Please try again')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await deleteTask(taskId)
      if (result) {
        success('Task deleted', 'Task has been successfully removed')
      } else {
        error('Failed to delete task', 'Please try again')
      }
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCloseTaskForm = () => {
    setEditingTask(null)
    setShowTaskForm(false)
  }

  const handleShowTaskDetail = (task: Task) => {
    setDetailTask(task)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setDetailTask(null)
    setShowDetailModal(false)
  }

  // Mobile view with cards
  if (isMobile) {
    return (
      <div className={className}>
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-24 flex items-center justify-center text-center text-muted-foreground"
          >
            No results.
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <TaskMobileCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={handleEditTask}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        {showTaskForm && (
          <TaskForm
            task={editingTask}
            open={showTaskForm}
            onClose={handleCloseTaskForm}
          />
        )}
        {showDetailModal && (
          <TaskDetailModal
            task={detailTask}
            open={showDetailModal}
            onClose={handleCloseDetailModal}
          />
        )}
      </div>
    )
  }

  // Desktop view with table
  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[100px]">Task</TableHead>
              <TableHead>
                {renderSortButton('title', 'Title')}
              </TableHead>
              <TableHead className="w-[100px]">
                {renderSortButton('status', 'Status')}
              </TableHead>
              <TableHead className="w-[100px]">
                {renderSortButton('priority', 'Priority')}
              </TableHead>
              <TableHead className="w-[150px]">Tags</TableHead>
              <TableHead className="w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    No results.
                  </motion.div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence mode="popLayout">
                {tasks.map((task, index) => (
                  <motion.tr
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
                    whileHover={{ 
                      scale: 1.01,
                      transition: { duration: 0.2 }
                    }}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Checkbox
                          checked={task.selected}
                          onCheckedChange={() => handleTaskSelect(task.id)}
                          aria-label={`Select task ${task.task}`}
                        />
                      </motion.div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {task.task}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {getTaskTypeBadge(task.type)}
                        </motion.div>
                        <button
                          onClick={() => handleShowTaskDetail(task)}
                          className="max-w-[500px] truncate font-medium text-left hover:text-blue-600 transition-colors"
                        >
                          {task.title}
                        </button>
                      </div>
                    </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dropdown>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <DropdownButton plain>
                            {getStatusIcon(task.status)}
                          </DropdownButton>
                        </motion.div>
                        <DropdownMenu>
                          <DropdownItem onClick={() => handleStatusChange(task.id, 'Todo')}>
                            <Circle className="mr-2 h-4 w-4 text-gray-500" />
                            Todo
                          </DropdownItem>
                          <DropdownItem onClick={() => handleStatusChange(task.id, 'In Progress')}>
                            <Clock className="mr-2 h-4 w-4 text-blue-500" />
                            In Progress
                          </DropdownItem>
                          <DropdownItem onClick={() => handleStatusChange(task.id, 'Backlog')}>
                            <Minus className="mr-2 h-4 w-4 text-gray-400" />
                            Backlog
                          </DropdownItem>
                          <DropdownItem onClick={() => handleStatusChange(task.id, 'Done')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            Done
                          </DropdownItem>
                          <DropdownItem onClick={() => handleStatusChange(task.id, 'Cancelled')}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Cancelled
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getStatusBadge(task.status)}
                      </motion.div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dropdown>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <DropdownButton plain>
                            {getPriorityIcon(task.priority)}
                          </DropdownButton>
                        </motion.div>
                        <DropdownMenu>
                          <DropdownItem onClick={() => handlePriorityChange(task.id, 'High')}>
                            <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                            High
                          </DropdownItem>
                          <DropdownItem onClick={() => handlePriorityChange(task.id, 'Medium')}>
                            <Minus className="mr-2 h-4 w-4 text-yellow-500" />
                            Medium
                          </DropdownItem>
                          <DropdownItem onClick={() => handlePriorityChange(task.id, 'Low')}>
                            <ArrowDown className="mr-2 h-4 w-4 text-green-500" />
                            Low
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getPriorityBadge(task.priority)}
                      </motion.div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.tags && task.tags.length > 0 ? (
                        getTagsByIds(task.tags).map(tag => (
                          <TagBadge
                            key={tag.id}
                            tag={tag}
                            size="sm"
                            showIcon={false}
                          />
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <DropdownButton plain>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownButton>
                      </motion.div>
                      <DropdownMenu>
                        <DropdownItem onClick={() => handleEditTask(task)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownItem>
                        <DropdownItem onClick={() => handleDeleteTask(task.id)}>
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          open={showTaskForm}
          onClose={handleCloseTaskForm}
        />
      )}
      {showDetailModal && (
        <TaskDetailModal
          task={detailTask}
          open={showDetailModal}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  )
}