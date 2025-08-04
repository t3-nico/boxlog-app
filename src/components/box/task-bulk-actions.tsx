'use client'

import { motion } from 'framer-motion'
import { useBoxStore } from '@/lib/box-store'
import { TaskStatus, TaskPriority } from '@/types/unified'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Trash2, ChevronDown } from 'lucide-react'
import { Circle, Clock, CheckCircle2, Minus, XCircle, ArrowUp, ArrowDown } from 'lucide-react'

export function TaskBulkActions() {
  const { 
    getSelectedTasks, 
    updateTask, 
    deleteTask, 
    selectAllTasks 
  } = useBoxStore()
  
  const { success, error } = useToast()
  const selectedTasks = getSelectedTasks()
  const selectedCount = selectedTasks.length

  const handleBulkStatusChange = async (status: TaskStatus) => {
    try {
      const results = await Promise.all(
        selectedTasks.map(task => updateTask(task.id, { status }))
      )
      
      const successCount = results.filter(result => result).length
      const failureCount = results.length - successCount
      
      if (successCount > 0) {
        success(
          `Status updated for ${successCount} task${successCount !== 1 ? 's' : ''}`,
          failureCount > 0 ? `${failureCount} task${failureCount !== 1 ? 's' : ''} failed to update` : undefined
        )
      }
      
      if (failureCount > 0 && successCount === 0) {
        error('Failed to update status', 'Please try again')
      }
      
      selectAllTasks(false)
    } catch (err) {
      error('Bulk status update failed', 'Please try again')
    }
  }

  const handleBulkPriorityChange = async (priority: TaskPriority) => {
    try {
      const results = await Promise.all(
        selectedTasks.map(task => updateTask(task.id, { priority }))
      )
      
      const successCount = results.filter(result => result).length
      const failureCount = results.length - successCount
      
      if (successCount > 0) {
        success(
          `Priority updated for ${successCount} task${successCount !== 1 ? 's' : ''}`,
          failureCount > 0 ? `${failureCount} task${failureCount !== 1 ? 's' : ''} failed to update` : undefined
        )
      }
      
      if (failureCount > 0 && successCount === 0) {
        error('Failed to update priority', 'Please try again')
      }
      
      selectAllTasks(false)
    } catch (err) {
      error('Bulk priority update failed', 'Please try again')
    }
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} tasks?`)) {
      try {
        const results = await Promise.all(
          selectedTasks.map(task => deleteTask(task.id))
        )
        
        const successCount = results.filter(result => result).length
        const failureCount = results.length - successCount
        
        if (successCount > 0) {
          success(
            `Deleted ${successCount} task${successCount !== 1 ? 's' : ''}`,
            failureCount > 0 ? `${failureCount} task${failureCount !== 1 ? 's' : ''} failed to delete` : undefined
          )
        }
        
        if (failureCount > 0 && successCount === 0) {
          error('Failed to delete tasks', 'Please try again')
        }
      } catch (err) {
        error('Bulk delete failed', 'Please try again')
      }
    }
  }

  const handleCancel = () => {
    selectAllTasks(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 rounded-lg border bg-muted/50 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-0 md:py-2"
    >
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-sm font-medium">
          {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </motion.div>
      <motion.div 
        className="flex flex-wrap items-center gap-2 md:space-x-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 text-xs md:text-sm">
              <span className="hidden sm:inline">Set Status</span>
              <span className="sm:hidden">Status</span>
              <ChevronDown className="ml-1 h-4 w-4 md:ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleBulkStatusChange('backlog')}>
              <Circle className="mr-2 h-4 w-4 text-gray-500" />
              Todo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusChange('scheduled')}>
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusChange('backlog')}>
              <Minus className="mr-2 h-4 w-4 text-gray-400" />
              Backlog
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusChange('completed')}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Done
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusChange('stopped')}>
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 text-xs md:text-sm">
              <span className="hidden sm:inline">Set Priority</span>
              <span className="sm:hidden">Priority</span>
              <ChevronDown className="ml-1 h-4 w-4 md:ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleBulkPriorityChange('high')}>
              <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
              High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkPriorityChange('medium')}>
              <Minus className="mr-2 h-4 w-4 text-yellow-500" />
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkPriorityChange('low')}>
              <ArrowDown className="mr-2 h-4 w-4 text-green-500" />
              Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          onClick={handleBulkDelete}
          className="h-8 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" onClick={handleCancel} className="h-8 text-xs md:text-sm">
            Cancel
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}