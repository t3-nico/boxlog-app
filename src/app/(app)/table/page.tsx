'use client'

import { useState } from 'react'
import { TaskTable } from '@/components/box/task-table'
import { TaskFilters } from '@/components/box/task-filters'
import { TaskBulkActions } from '@/components/box/task-bulk-actions'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Dashboard } from '@/components/box/dashboard'
import { BoardView } from '@/components/box/board-view'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { useBoxStore } from '@/lib/box-store'
import { useSmartFolderStore } from '@/lib/smart-folder-store'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useFilterUrlSync } from '@/hooks/use-filter-url-sync'
import { ChartBarIcon, TableCellsIcon, Squares2X2Icon } from '@heroicons/react/16/solid'
import { TableCellsIcon as TableIcon } from '@heroicons/react/24/outline'
import { useChatContext } from '@/contexts/chat-context'

export default function Box() {
  const { 
    getSortedTasks, 
    getSelectedTasks, 
    selectAllTasks, 
    deleteTask,
    filters,
    tasks: allTasks
  } = useBoxStore()
  const { getMatchingTasks } = useSmartFolderStore()
  const { toggleChat, state } = useChatContext()
  
  // Get tasks based on current filters (including SmartFolder)
  const tasks = filters.smartFolder 
    ? getMatchingTasks(allTasks, filters.smartFolder)
    : getSortedTasks()
  const selectedTasks = getSelectedTasks()
  
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [activeView, setActiveView] = useState<'table' | 'dashboard' | 'board'>('table')

  // Sync filters with URL
  useFilterUrlSync()

  const handleViewChange = (view: 'table' | 'dashboard' | 'board') => {
    console.log('Changing view from', activeView, 'to', view)
    setActiveView(view)
  }

  const handleNewTask = (status?: string) => {
    setShowTaskForm(true)
    // TODO: Set initial status if provided
  }

  const handleEditTask = (task: any) => {
    // TODO: Handle task editing from board view
    console.log('Edit task:', task)
  }

  const handleDeleteSelected = () => {
    if (selectedTasks.length === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} selected task${selectedTasks.length !== 1 ? 's' : ''}?`)) {
      selectedTasks.forEach(task => deleteTask(task.id))
    }
  }

  const handleSelectAll = () => {
    const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length
    selectAllTasks(!allSelected)
  }

  const handleClearSelection = () => {
    selectAllTasks(false)
  }

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onDeleteSelected: handleDeleteSelected,
    onSelectAll: handleSelectAll,
    onClearSelection: handleClearSelection,
  })

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex flex-1 overflow-hidden transition-all duration-300 ${state.isOpen ? 'mr-80' : ''}`}>
        <div className="flex-1 overflow-hidden">
          <TaskFilters />
          
          {selectedTasks.length > 0 && (
            <TaskBulkActions />
          )}
          
          <div className="flex justify-center space-x-1 mb-4 px-4">
            <Button 
              color={activeView === 'table' ? 'blue' : 'zinc'} 
              onClick={() => handleViewChange('table')}
              className="flex items-center gap-2"
            >
              <TableIcon className="w-4 h-4" />
              Table
            </Button>
            <Button 
              color={activeView === 'dashboard' ? 'blue' : 'zinc'} 
              onClick={() => handleViewChange('dashboard')}
              className="flex items-center gap-2"
            >
              <ChartBarIcon className="w-4 h-4" />
              Dashboard
            </Button>
            <Button 
              color={activeView === 'board' ? 'blue' : 'zinc'} 
              onClick={() => handleViewChange('board')}
              className="flex items-center gap-2"
            >
              <Squares2X2Icon className="w-4 h-4" />
              Board
            </Button>
          </div>

          {activeView === 'table' && (
            <TaskTable />
          )}
          
          {activeView === 'dashboard' && (
            <Dashboard />
          )}
          
          {activeView === 'board' && (
            <>
              <div className="min-h-[600px] h-[calc(100vh-250px)]">
                <BoardView
                  onEditTask={handleEditTask}
                  onAddTask={handleNewTask}
                />
              </div>
            </>
          )}
          {showTaskForm && (
            <TaskForm
              task={null}
              open={showTaskForm}
              onClose={() => setShowTaskForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}