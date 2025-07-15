'use client'

import { useState } from 'react'
import { useBoxStore } from '@/lib/box-store'
import { useTagStore } from '@/lib/tag-store'
import { TaskStatus, TaskPriority, TaskType } from '@/types/box'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from '@/components/ui/dropdown-menu'
import { TaskForm } from '@/components/tasks/TaskForm'
import { ExportMenu } from './export-menu'
import { TagBadge } from '@/components/tags/tag-badge'
import { Search, ChevronDown, Plus } from 'lucide-react'

const statusOptions: TaskStatus[] = ['Todo', 'In Progress', 'Backlog', 'Cancelled', 'Done']
const priorityOptions: TaskPriority[] = ['High', 'Medium', 'Low']
const typeOptions: TaskType[] = ['Bug', 'Feature', 'Documentation']

interface TaskFiltersProps {
  className?: string
  currentView?: 'table' | 'board' | 'dashboard'
  onViewChange?: (view: 'table' | 'board' | 'dashboard') => void
}

export function TaskFilters({ className, currentView, onViewChange }: TaskFiltersProps) {
  const {
    filters,
    setSearchFilter,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    setTagFilter,
    clearFilters,
    addTask,
  } = useBoxStore()
  
  const { getAllTags, getTagsByIds } = useTagStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value)
  }

  const handleStatusFilterChange = (status: TaskStatus) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    setStatusFilter(newStatuses)
  }

  const handlePriorityFilterChange = (priority: TaskPriority) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority]
    setPriorityFilter(newPriorities)
  }

  const handleTypeFilterChange = (type: TaskType) => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type]
    setTypeFilter(newTypes)
  }

  const handleTagFilterChange = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId]
    setTagFilter(newTags)
  }

  const [showTaskForm, setShowTaskForm] = useState(false)

  const handleAddTask = () => {
    setShowTaskForm(true)
  }

  const hasActiveFilters = 
    filters.search || 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.type.length > 0 ||
    filters.tags.length > 0

  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className}`}>
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:space-x-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" data-slot="icon" />
          <Input
            placeholder="Filter tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-8 h-8 w-full md:w-[150px] lg:w-[250px]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown>
            <DropdownButton 
              outline
              className={`h-8 border-dashed ${filters.status.length > 0 ? 'border-solid' : ''}`}
            >
              <Plus className="mr-2 h-4 w-4" data-slot="icon" />
              Status
              {filters.status.length > 0 && (
                <div className="ml-1 flex h-4 w-4 items-center justify-center rounded bg-primary text-xs text-primary-foreground">
                  {filters.status.length}
                </div>
              )}
            </DropdownButton>
            <DropdownMenu className="w-[200px] p-0">
              <div className="p-2">
                {statusOptions.map((status) => (
                  <div
                    key={status}
                    className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
                    onClick={() => handleStatusFilterChange(status)}
                  >
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => {}}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{status}</span>
                  </div>
                ))}
              </div>
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownButton 
              outline
              className={`h-8 border-dashed ${filters.priority.length > 0 ? 'border-solid' : ''}`}
            >
              <Plus className="mr-2 h-4 w-4" data-slot="icon" />
              Priority
              {filters.priority.length > 0 && (
                <div className="ml-1 flex h-4 w-4 items-center justify-center rounded bg-primary text-xs text-primary-foreground">
                  {filters.priority.length}
                </div>
              )}
            </DropdownButton>
            <DropdownMenu className="w-[200px] p-0">
              <div className="p-2">
                {priorityOptions.map((priority) => (
                  <div
                    key={priority}
                    className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
                    onClick={() => handlePriorityFilterChange(priority)}
                  >
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(priority)}
                      onChange={() => {}}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{priority}</span>
                  </div>
                ))}
              </div>
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownButton 
              outline
              className={`h-8 border-dashed ${filters.tags.length > 0 ? 'border-solid' : ''}`}
            >
              <Plus className="mr-2 h-4 w-4" data-slot="icon" />
              Tags
              {filters.tags.length > 0 && (
                <div className="ml-1 flex h-4 w-4 items-center justify-center rounded bg-primary text-xs text-primary-foreground">
                  {filters.tags.length}
                </div>
              )}
            </DropdownButton>
            <DropdownMenu className="w-[250px] p-0">
              <div className="p-2">
                {getAllTags().map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm"
                    onClick={() => handleTagFilterChange(tag.id)}
                  >
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300"
                    />
                    <TagBadge tag={tag} showIcon={true} />
                  </div>
                ))}
                {getAllTags().length === 0 && (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    No tags available
                  </div>
                )}
              </div>
            </DropdownMenu>
          </Dropdown>
          {hasActiveFilters && (
            <Button
              outline
              onClick={clearFilters}
              className="h-8 px-2 lg:px-3"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end space-x-2">
        <div className="flex items-center space-x-2">
          <ExportMenu />
          {onViewChange && (
            <Dropdown>
              <DropdownButton outline className="h-8">
                View
                <ChevronDown className="ml-2 h-4 w-4" data-slot="icon" />
              </DropdownButton>
              <DropdownMenu>
                <DropdownItem 
                  onClick={() => onViewChange('table')}
                  className={currentView === 'table' ? 'bg-accent' : ''}
                >
                  <span className="text-sm">Table View</span>
                </DropdownItem>
                <DropdownItem 
                  onClick={() => onViewChange('board')}
                  className={currentView === 'board' ? 'bg-accent' : ''}
                >
                  <span className="text-sm">Board View</span>
                </DropdownItem>
                <DropdownItem 
                  onClick={() => onViewChange('dashboard')}
                  className={currentView === 'dashboard' ? 'bg-accent' : ''}
                >
                  <span className="text-sm">Dashboard</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
        <Button onClick={handleAddTask} className="h-8">
          <Plus className="mr-2 h-4 w-4 md:mr-2" />
          <span className="hidden sm:inline">Task</span>
          <span className="sm:hidden">+</span>
        </Button>
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