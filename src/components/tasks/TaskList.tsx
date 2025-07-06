'use client'

import { useBoxStore } from '@/lib/box-store'
import { TaskItem } from './TaskItem'
import { TaskForm } from './TaskForm'
import { Task } from '@/types/box'
import { useState } from 'react'

export function TaskList() {
  const { getSortedTasks } = useBoxStore()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  const tasks = getSortedTasks()
  
  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }
  
  const handleSelect = (task: Task) => {
    setSelectedTask(task)
  }
  
  const handleCloseForm = () => {
    setEditingTask(null)
    setShowForm(false)
  }
  
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 mb-4">タスクが見つかりません</p>
      </div>
    )
  }
  
  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onSelect={handleSelect}
          />
        ))}
      </div>
      
      {showForm && (
        <TaskForm
          task={editingTask}
          open={showForm}
          onClose={handleCloseForm}
        />
      )}
    </>
  )
}