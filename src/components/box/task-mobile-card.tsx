'use client'

import { motion } from 'framer-motion'
import { Task } from '@/types/box'
import { TaskStatus, TaskPriority } from '@/types/unified'
import { useBoxStore } from '@/lib/box-store'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/dropdown'
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
    case 'backlog':
      return <Circle className={`${iconProps} text-gray-500`} />
    case 'scheduled':
      return <Clock className={`${iconProps} text-blue-500`} />
    case 'completed':
      return <CheckCircle2 className={`${iconProps} text-green-500`} />
    case 'rescheduled':
      return <Minus className={`${iconProps} text-gray-400`} />
    case 'stopped':
      return <XCircle className={`${iconProps} text-red-500`} />
    case 'delegated':
      return <Circle className={`${iconProps} text-purple-500`} />
    default:
      return <Circle className={`${iconProps} text-gray-500`} />
  }
}

const getPriorityIcon = (priority: TaskPriority) => {
  const iconProps = "h-4 w-4"
  switch (priority) {
    case 'high':
      return <ArrowUp className={`${iconProps} text-red-500`} />
    case 'medium':
      return <Minus className={`${iconProps} text-yellow-500`} />
    case 'low':
      return <ArrowDown className={`${iconProps} text-green-500`} />
    case 'urgent':
      return <ArrowUp className={`${iconProps} text-red-700`} />
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
    case 'backlog':
      return <Badge color="zinc">{status}</Badge>
    case 'scheduled':
      return <Badge color="blue">{status}</Badge>
    case 'completed':
      return <Badge color="green">{status}</Badge>
    case 'rescheduled':
      return <Badge color="yellow">{status}</Badge>
    case 'stopped':
      return <Badge color="red">{status}</Badge>
    case 'delegated':
      return <Badge color="purple">{status}</Badge>
    default:
      return <Badge color="zinc">{status}</Badge>
  }
}

const getPriorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case 'high':
      return <Badge color="red">{priority}</Badge>
    case 'medium':
      return <Badge color="yellow">{priority}</Badge>
    case 'low':
      return <Badge color="green">{priority}</Badge>
    case 'urgent':
      return <Badge color="red">{priority}</Badge>
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
        false ? 'ring-2 ring-primary ring-offset-2' : '' // TODO: Implement with new Task type
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
              checked={false} // TODO: Implement with new Task type
              onCheckedChange={handleTaskSelect}
              aria-label={`Select task ${task.id}`}
            />
          </motion.div>
          <div>
            <p className="text-sm font-mono text-muted-foreground">{task.id}</p>
            <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
              {getTaskTypeBadge(task.type)}
            </motion.div>
          </div>
        </div>
        <Dropdown>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <DropdownButton as={Button} variant="ghost">
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
              <DropdownButton as={Button} variant="ghost" className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <span className="text-sm">{task.status}</span>
              </DropdownButton>
            </motion.div>
            <DropdownMenu>
              <DropdownItem onClick={() => handleStatusChange('backlog')}>
                <Circle className="mr-2 h-4 w-4 text-gray-500" />
                Backlog
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('scheduled')}>
                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                Scheduled
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('completed')}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Completed
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('rescheduled')}>
                <Minus className="mr-2 h-4 w-4 text-yellow-500" />
                Rescheduled
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('stopped')}>
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Stopped
              </DropdownItem>
              <DropdownItem onClick={() => handleStatusChange('delegated')}>
                <Circle className="mr-2 h-4 w-4 text-purple-500" />
                Delegated
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex items-center space-x-2">
          <Dropdown>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <DropdownButton as={Button} variant="ghost" className="flex items-center space-x-2">
                {getPriorityIcon(task.priority)}
                <span className="text-sm">{task.priority}</span>
              </DropdownButton>
            </motion.div>
            <DropdownMenu>
              <DropdownItem onClick={() => handlePriorityChange('urgent')}>
                <ArrowUp className="mr-2 h-4 w-4 text-red-700" />
                Urgent
              </DropdownItem>
              <DropdownItem onClick={() => handlePriorityChange('high')}>
                <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                High
              </DropdownItem>
              <DropdownItem onClick={() => handlePriorityChange('medium')}>
                <Minus className="mr-2 h-4 w-4 text-yellow-500" />
                Medium
              </DropdownItem>
              <DropdownItem onClick={() => handlePriorityChange('low')}>
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