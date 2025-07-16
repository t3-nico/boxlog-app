'use client'

import { useState } from 'react'
import { BoardView } from '@/components/box/board-view'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskFilters } from '@/components/box/task-filters'
import { Heading } from '@/components/heading'
import { useChatContext } from '@/contexts/chat-context'

export default function Board() {
  const { toggleChat, state } = useChatContext()
  const [showTaskForm, setShowTaskForm] = useState(false)

  const handleNewTask = (status?: string) => {
    setShowTaskForm(true)
    // TODO: Set initial status if provided
  }

  const handleEditTask = (task: any) => {
    // TODO: Handle task editing from board view
    console.log('Edit task:', task)
  }

  const handleViewChange = (view: string) => {
    // Navigate to other views if needed
    console.log('View change:', view)
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex-1 p-4 pt-6 md:p-8 transition-all duration-300 ${state.isOpen ? 'mr-80' : ''}`}>
        
        <TaskFilters 
          currentView="board"
          onViewChange={handleViewChange}
        />
        
        <div className="mt-4 min-h-[600px] h-[calc(100vh-200px)]">
          <BoardView
            onEditTask={handleEditTask}
            onAddTask={handleNewTask}
          />
        </div>
      </div>
      
      {showTaskForm && (
        <TaskForm
          task={null}
          open={showTaskForm}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  )
}