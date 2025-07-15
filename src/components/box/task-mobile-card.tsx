'use client'

import { motion } from 'framer-motion'
import { Task, TaskStatus, TaskPriority } from '@/types/box'
import { useBoxStore } from '@/lib/box-store'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Circle,
  Clock,
  CheckCircle2,
  Minus,
  XCircle,
  ArrowUp,
  ArrowDown,
  Edit,
} from 'lucide-react'

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

const getTaskTypeBadge = (type: string) => {
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

interface TaskMobileCardProps {
  task: Task
  index: number
  onEdit: (task: Task) => void
}

export function TaskMobileCard({ task, index, onEdit }: TaskMobileCardProps) {
  const {
    toggleTaskSelection,
    updateTask,
    deleteTask,
  } = useBoxStore()

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask(task.id, { status: newStatus })
  }

  const handlePriorityChange = (newPriority: TaskPriority) => {
    updateTask(task.id, { priority: newPriority })
  }

  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id)
    }
  }

  const handleTaskSelect = () => {
    toggleTaskSelection(task.id)
  }

  return (
    <motion.div
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
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`rounded-lg border bg-card p-4 space-y-3 ${
        task.selected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Checkbox
              checked={task.selected}
              onCheckedChange={handleTaskSelect}
              aria-label={`Select task ${task.task}`}
            />
          </motion.div>
          <div>
            <p className="text-sm font-mono text-muted-foreground">{task.task}</p>
            <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
              {getTaskTypeBadge(task.type)}
            </motion.div>
          </div>
        </div>
        <Dropdown>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <DropdownButton plain>
              <MoreHorizontal className="h-5 w-5" />
            </DropdownButton>
          </motion.div>
          <DropdownMenu>
            <DropdownItem onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownItem>
            <DropdownItem onClick={handleDeleteTask}>
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-medium text-base leading-6">{task.title}</h3>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Dropdown>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <DropdownButton plain className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <span className="text-sm">{task.status}</span>
              </DropdownButton>
            </motion.div>
            <DropdownMenu>
              <DropdownItem onClick={() => handleStatusChange('Todo')}>
                <Circle className="mr-2 h-4 w-4 text-gray-500" />
                Todo
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('In Progress')}>
                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                In Progress
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('Backlog')}>
                <Minus className="mr-2 h-4 w-4 text-gray-400" />
                Backlog
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('Done')}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Done
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('Cancelled')}>
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Cancelled
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex items-center space-x-2">
          <Dropdown>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <DropdownButton plain className="flex items-center space-x-2">
                {getPriorityIcon(task.priority)}
                <span className="text-sm">{task.priority}</span>
              </DropdownButton>
            </motion.div>
            <DropdownMenu>
              <DropdownItem onClick={() => handlePriorityChange('High')}>
                <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                High
              </DropdownItem>
              <DropdownItem onClick={() => handlePriorityChange('Medium')}>
                <Minus className="mr-2 h-4 w-4 text-yellow-500" />
                Medium
              </DropdownItem>
              <DropdownItem onClick={() => handlePriorityChange('Low')}>
                <ArrowDown className="mr-2 h-4 w-4 text-green-500" />
                Low
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </motion.div>
  )
}