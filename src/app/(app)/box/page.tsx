'use client'

import { useState } from 'react'
import { TaskTable } from '@/components/box/task-table'
import { TaskFilters } from '@/components/box/task-filters'
import { TaskBulkActions } from '@/components/box/task-bulk-actions'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Dashboard } from '@/components/box/dashboard'
import { BoardView } from '@/components/box/board-view'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { useBoxStore } from '@/lib/box-store'
import { useSmartFolderStore } from '@/lib/smart-folder-store'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useFilterUrlSync } from '@/hooks/use-filter-url-sync'
import { BarChart3, Table, Grid2X2 } from 'lucide-react'

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
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            {activeView === 'dashboard' 
              ? "Here's an overview of your task progress!" 
              : activeView === 'board'
              ? "Manage your tasks with a kanban board!"
              : "Here's a list of your tasks for this month!"
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-md border">
            {activeView === 'dashboard' ? (
              <Button
                onClick={() => handleViewChange('dashboard')}
                className="flex items-center space-x-1 px-2 py-1 text-xs"
              >
                <BarChart3 className="h-4 w-4" data-slot="icon" />
                <span className="hidden lg:inline">Dashboard</span>
              </Button>
            ) : (
              <Button
                plain
                onClick={() => handleViewChange('dashboard')}
                className="flex items-center space-x-1 px-2 py-1 text-xs"
              >
                <BarChart3 className="h-4 w-4" data-slot="icon" />
                <span className="hidden lg:inline">Dashboard</span>
              </Button>
            )}
            {activeView === 'board' ? (
              <Button
                onClick={() => handleViewChange('board')}
                className="flex items-center space-x-1 px-2 py-1 text-xs"
              >
                <Grid2X2 className="h-4 w-4" data-slot="icon" />
                <span className="hidden lg:inline">Board</span>
              </Button>
            ) : (
              <Button
                plain
                onClick={() => handleViewChange('board')}
                className="flex items-center space-x-1 px-2 py-1 text-xs"
              >
                <Grid2X2 className="h-4 w-4" data-slot="icon" />
                <span className="hidden lg:inline">Board</span>
              </Button>
            )}
            {activeView === 'table' ? (
              <Button
                onClick={() => handleViewChange('table')}
                className="flex items-center space-x-1 px-2 py-1 text-xs"
              >
                <Table className="h-4 w-4" data-slot="icon" />
                <span className="hidden lg:inline">Table</span>
              </Button>
            ) : (
              <Button
                plain
                onClick={() => handleViewChange('table')}
                className="flex items-center space-x-1 px-2 py-1 text-xs"
              >
                <Table className="h-4 w-4" data-slot="icon" />
                <span className="hidden lg:inline">Table</span>
              </Button>
            )}
          </div>
          <Avatar
            src="/users/erica.jpg"
            className="h-8 w-8"
          />
        </div>
      </div>
      {activeView === 'table' && (
        <>
          <TaskFilters 
            currentView={activeView}
            onViewChange={handleViewChange}
          />
          {selectedTasks.length > 0 && <TaskBulkActions />}
          <div className="space-y-4">
            <TaskTable />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Showing {tasks.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </div>
              <div className="hidden md:block text-xs text-muted-foreground">
                Shortcuts: Ctrl+N (new), Ctrl+A (select all), Delete (remove), Esc (clear)
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeView === 'dashboard' && <Dashboard />}
      
      {activeView === 'board' && (
        <>
          <TaskFilters 
            currentView={activeView}
            onViewChange={handleViewChange}
          />
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
  )
}
