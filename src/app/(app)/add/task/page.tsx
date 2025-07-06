'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Button } from '@/components/button'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'

export default function AddTaskPage() {
  const router = useRouter()
  const [showTaskForm, setShowTaskForm] = useState(true)

  const handleClose = () => {
    setShowTaskForm(false)
    router.push('/add')
  }

  const handleSuccess = () => {
    router.push('/box')
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-4">
        <Button
          plain
          onClick={() => router.push('/add')}
          className="flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Add</span>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Create New Task</h2>
        <p className="text-muted-foreground">
          Add a new task with details, tags, and priority settings
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <TaskForm
            task={null}
            open={showTaskForm}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  )
}