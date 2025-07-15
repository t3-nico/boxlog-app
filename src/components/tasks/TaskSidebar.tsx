'use client'

import { useState } from 'react'
import { TaskFilters, TaskStatus, TaskPriority, TaskType } from '@/types/box'
import { taskTypes } from '@/lib/tasks'
import { useBoxStore } from '@/lib/box-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, Plus, Filter } from 'lucide-react'
import { getTypeColor } from '@/lib/tasks'

interface TaskSidebarProps {
  onNewTask: () => void
}

export function TaskSidebar({ onNewTask }: TaskSidebarProps) {
  const { filters, setSearchFilter, setStatusFilter, setPriorityFilter, setTypeFilter, clearFilters, getFilteredTasks, getSortedTasks } = useBoxStore()
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  
  const tasks = getSortedTasks()
  const filteredTasks = getFilteredTasks()
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setSearchFilter(value)
  }
  
  const handleStatusFilter = (status: TaskStatus) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]
    
    setStatusFilter(newStatuses)
  }
  
  const handlePriorityFilter = (priority: TaskPriority) => {
    const currentPriorities = filters.priority || []
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority]
    
    setPriorityFilter(newPriorities)
  }
  
  const handleTypeFilter = (type: TaskType) => {
    const currentTypes = filters.type || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]
    
    setTypeFilter(newTypes)
  }
  
  const getTaskCountByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status).length
  }
  
  const getTaskCountByPriority = (priority: TaskPriority) => {
    return tasks.filter((task) => task.priority === priority).length
  }
  
  const getTaskCountByType = (type: TaskType) => {
    return tasks.filter((task) => task.type === type).length
  }
  
  return (
    <div className="w-80 border-r bg-gray-50/40 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold">タスク管理</h2>
          <p className="text-sm text-gray-600">
            {filteredTasks.length} / {tasks.length} 件のタスク
          </p>
        </div>
        
        {/* New Task Button */}
        <Button onClick={onNewTask} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          新しいタスク
        </Button>
        
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">検索</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="search"
              placeholder="タスクを検索..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Status Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>ステータス</Label>
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
          <div className="space-y-2">
            {(['Todo', 'In Progress', 'Backlog', 'Done', 'Cancelled'] as TaskStatus[]).map((status) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={status}
                    checked={filters.status?.includes(status) || false}
                    onCheckedChange={() => handleStatusFilter(status)}
                  />
                  <Label htmlFor={status} className="text-sm font-normal">
                    {status}
                  </Label>
                </div>
                <span className="text-xs text-gray-500">
                  {getTaskCountByStatus(status)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Priority Filter */}
        <div className="space-y-3">
          <Label>優先度</Label>
          <div className="space-y-2">
            {(['High', 'Medium', 'Low'] as TaskPriority[]).map((priority) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={priority}
                    checked={filters.priority?.includes(priority) || false}
                    onCheckedChange={() => handlePriorityFilter(priority)}
                  />
                  <Label htmlFor={priority} className="text-sm font-normal">
                    {priority}
                  </Label>
                </div>
                <span className="text-xs text-gray-500">
                  {getTaskCountByPriority(priority)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Type Filter */}
        <div className="space-y-3">
          <Label>タイプ</Label>
          <div className="space-y-2">
            {taskTypes.map((type) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={filters.type?.includes(type) || false}
                    onCheckedChange={() => handleTypeFilter(type)}
                  />
                  <Badge className={getTypeColor(type)}>
                    {type}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {getTaskCountByType(type)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Clear Filters */}
        {(filters.status?.length || filters.priority?.length || filters.type?.length || filters.search) && (
          <>
            <Separator />
            <Button outline onClick={clearFilters} className="w-full">
              フィルターをクリア
            </Button>
          </>
        )}
      </div>
    </div>
  )
}